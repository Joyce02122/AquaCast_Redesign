import type { FlatSample } from '../types';

export interface AiInsight {
  tag: string;
  body: string;
  canApply: boolean;
  applied?: boolean;
}

export function aiInsight(flat: FlatSample[], aiApplied: boolean): AiInsight {
  if (!flat.length) {
    return { tag: 'COVERAGE', body: 'Add sampling locations and depths — AquaCast will check coverage here.', canApply: false, applied: false };
  }
  const depths = flat.map(f => f.depth);
  const dup = depths.find((d, i) => depths.indexOf(d) !== i);
  if (dup != null && !aiApplied) {
    return { tag: 'DUPLICATE', body: `Two samples sit at ${dup.toFixed(1)} m. Spacing depths across the water column avoids redundant data and maximizes profile coverage.`, canApply: true, applied: false };
  }
  const max = Math.max(...depths);
  if (max < 3) {
    return { tag: 'SHALLOW', body: 'All samples are above 3 m. Adding deeper profiles improves thermocline coverage and captures stratified water layers.', canApply: false, applied: aiApplied };
  }
  const locs = new Set(flat.map(f => f.locId)).size;
  return { tag: 'GOOD', body: `${flat.length} samples across ${locs} location${locs !== 1 ? 's' : ''}. Depth coverage looks well balanced for this mission.`, canApply: false, applied: aiApplied };
}
