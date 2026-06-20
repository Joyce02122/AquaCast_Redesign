import type { Location, Area } from '../../types';
import { totalSamples, buildRuns } from '../../utils/runs';

interface Props {
  area: Area;
  locations: Location[];
  routeOrder: string[];
  onRestart: () => void;
}

export function DeployedOverlay({ area, locations, routeOrder, onRestart }: Props) {
  const total = totalSamples(locations);
  const nRounds = Math.max(1, buildRuns(locations, routeOrder).length);
  const summary = `${locations.length} sites · ${total} samples · ${nRounds} ${nRounds > 1 ? 'runs' : 'run'}`;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'rgba(244,247,248,.86)', backdropFilter: 'blur(6px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 18,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: '#e6f6ee',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26,
      }}>✓</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-.4px', color: '#16242e' }}>Mission deployed</div>
        <div style={{ fontSize: 14, color: '#657984', marginTop: 6 }}>
          {area.name} · {summary} · AquaCast-023
        </div>
      </div>
      <button
        onClick={onRestart}
        style={{
          padding: '11px 22px', border: '1px solid rgba(120,150,165,.3)',
          borderRadius: 12, background: '#fff', color: '#16242e',
          fontWeight: 600, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >Build another mission</button>
    </div>
  );
}
