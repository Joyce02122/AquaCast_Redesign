import type { Location, FlatSample } from '../types';
import { MAXCH } from '../constants';

export function letter(i: number) {
  return String.fromCharCode(65 + i);
}

export function uid() {
  return 'x' + Date.now() + Math.floor(Math.random() * 999);
}

export function totalSamples(locations: Location[]) {
  return locations.reduce((n, l) => n + l.samples.length, 0);
}

export function sortByOrder(locations: Location[], routeOrder: string[]): Location[] {
  const byId: Record<string, Location> = {};
  locations.forEach(l => { byId[l.id] = l; });
  const out: Location[] = [];
  routeOrder.forEach(id => { if (byId[id]) { out.push(byId[id]); delete byId[id]; } });
  locations.forEach(l => { if (byId[l.id]) out.push(l); });
  return out;
}

export function buildRuns(locations: Location[], routeOrder: string[]): Location[][] {
  const ordered = sortByOrder(locations, routeOrder);
  const runs: Location[][] = [];
  let cur: Location[] = [], cnt = 0;
  for (const loc of ordered) {
    const c = loc.samples.length;
    if (cnt > 0 && cnt + c > MAXCH) { runs.push(cur); cur = []; cnt = 0; }
    cur.push(loc);
    cnt += c;
  }
  if (cur.length) runs.push(cur);
  return runs;
}

export function flatten(locations: Location[], routeOrder: string[]): FlatSample[] {
  const out: FlatSample[] = [];
  const runs = buildRuns(locations, routeOrder);
  runs.forEach((run, ri) => {
    let ch = 0;
    run.forEach(l => {
      const li = locations.indexOf(l);
      l.samples.forEach(sm => {
        ch++;
        out.push({
          locId: l.id,
          locIdx: li,
          letter: letter(li),
          sampleId: sm.id,
          depth: sm.depth,
          globalIdx: out.length,
          round: ri + 1,
          run: ri + 1,
          ch,
        });
      });
    });
  });
  return out;
}
