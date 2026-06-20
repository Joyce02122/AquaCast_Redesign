import type { Location, Area } from '../../types';
import { SENSORS, RUN_COLORS, RUN_NAMES } from '../../constants';
import { letter, flatten, buildRuns, totalSamples } from '../../utils/runs';
import { aiInsight } from '../../utils/ai';
import { Chip } from '../ui/Chip';
import { GlassCard } from '../ui/GlassCard';

interface Props {
  locations: Location[];
  selLocId: string | null;
  routeOrder: string[];
  area: Area;
  bottle: 250 | 400 | 1000;
  sensors: string[];
  aiApplied: boolean;
  onSelectLoc: (id: string | null) => void;
  onSetDepth: (sampleId: string, depth: number) => void;
  onAiApply: () => void;
}

export function ReviewPanel({ locations, selLocId, routeOrder, area, bottle, sensors, aiApplied, onSelectLoc, onSetDepth, onAiApply }: Props) {
  const flat = flatten(locations, routeOrder);
  const runs = buildRuns(locations, routeOrder);
  const total = totalSamples(locations);
  const nRounds = Math.max(1, runs.length);
  const ai = aiInsight(flat, aiApplied);

  const sensorNames = sensors.map(id => {
    const s = SENSORS.find(x => x[0] === id);
    return s ? s[1] : id;
  });

  const sensorSummary = sensors.length === 0 ? 'None'
    : sensors.length === SENSORS.length ? 'All'
    : sensorNames.join(', ');

  const multiRound = nRounds > 1;
  const roundNote = multiRound
    ? `Mission requires ${nRounds} deployment runs. The device surfaces and resets between runs.`
    : 'Single-run deployment. All samples fit within one round.';

  const chMap: Record<string, { ch: number; run: number }> = {};
  flat.forEach(f => { chMap[f.sampleId] = { ch: f.ch, run: f.run }; });

  return (
    <GlassCard className="ac-scroll" style={{
      position: 'absolute', left: 40, top: 150,
      width: 344, maxHeight: 556, overflowY: 'auto',
      zIndex: 22, padding: 22,
    }}>
      <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-.3px', color: '#16242e' }}>Mission validation</div>
      <div style={{ fontSize: 12, color: '#8aa0ab', margin: '4px 0 16px', lineHeight: 1.45 }}>
        Check coverage and the deployment plan. Tap a location to fine-tune its depths.
      </div>

      {/* Deployment summary */}
      <div style={{
        padding: '14px 15px', borderRadius: 14,
        border: `1px solid ${multiRound ? 'rgba(245,158,11,.28)' : 'rgba(120,150,165,.18)'}`,
        background: multiRound ? 'rgba(245,158,11,.05)' : 'rgba(120,150,165,.05)',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
            <span style={{ fontSize: 21, fontWeight: 700, color: '#16242e', letterSpacing: '-.6px' }}>{total}</span>
            <span style={{ fontSize: 11.5, color: '#7c8c98' }}>total samples</span>
          </div>
          <span style={{
            fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
            color: multiRound ? '#9a6a10' : '#1559b0',
            background: multiRound ? 'rgba(245,158,11,.14)' : 'rgba(31,111,212,.1)',
          }}>
            {nRounds} {nRounds === 1 ? 'run' : 'runs'}
          </span>
        </div>

        {runs.map((run, ri) => {
          const cnt = run.reduce((n, l) => n + l.samples.length, 0);
          const pct = (cnt / 6) * 100;
          return (
            <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#566974', width: 56, flexShrink: 0 }}>{RUN_NAMES[ri]}</span>
              <div style={{ flex: 1, height: 7, borderRadius: 4, background: 'rgba(120,150,165,.18)', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: RUN_COLORS[ri % RUN_COLORS.length] }} />
              </div>
              <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 10.5, color: '#8aa0ab', width: 38, textAlign: 'right' }}>
                {cnt}/6 CH
              </span>
            </div>
          );
        })}

        <div style={{ fontSize: 11.5, lineHeight: 1.45, color: multiRound ? '#9a6a10' : '#7c8c98', marginTop: 11 }}>
          {roundNote}
        </div>
      </div>

      {/* Setup */}
      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', color: '#9fb2bc', textTransform: 'uppercase', marginBottom: 8 }}>Mission setup</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, paddingBottom: 10, borderBottom: '1px solid rgba(120,150,165,.16)' }}>
        <span style={{ color: '#8aa0ab' }}>Survey area</span>
        <span style={{ fontWeight: 600, color: '#16242e' }}>{area.name}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '10px 0 14px' }}>
        <span style={{ color: '#8aa0ab' }}>Bottle · sensors</span>
        <span style={{ fontWeight: 600, color: '#16242e' }}>{bottle}ml · {sensorSummary}</span>
      </div>

      {/* Sampling plan */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', color: '#9fb2bc', textTransform: 'uppercase', margin: '4px 0 8px' }}>
        <span>Sampling plan</span>
        <span style={{ fontWeight: 500, letterSpacing: 0, textTransform: 'none', color: '#aebcc4' }}>— tap to edit</span>
      </div>

      {locations.map((loc, i) => {
        const ltr = letter(i);
        const isSelected = loc.id === selLocId;
        return (
          <div key={loc.id}
            onClick={() => onSelectLoc(isSelected ? null : loc.id)}
            className="ac-transition"
            style={{
              padding: '10px 12px', borderRadius: 12, cursor: 'pointer', marginBottom: 8,
              background: isSelected ? 'rgba(31,111,212,.06)' : 'rgba(120,150,165,.05)',
              border: isSelected ? '1px solid rgba(31,111,212,.15)' : '1px solid transparent',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#16242e', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ltr}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#16242e' }}>Point {ltr}</div>
                <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 10, color: '#8aa0ab' }}>{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</div>
              </div>
              <span style={{ fontSize: 11, color: '#8aa0ab' }}>{loc.samples.length} {loc.samples.length === 1 ? 'sample' : 'samples'}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, paddingLeft: 31 }}>
              {loc.samples.map(sm => {
                const info = chMap[sm.id];
                const pre = info && info.run > 1 ? `R${info.run}·` : '';
                return (
                  <Chip key={sm.id}>{pre}CH{info?.ch ?? '?'} · {sm.depth.toFixed(1)}m</Chip>
                );
              })}
            </div>

            {/* Inline depth editing */}
            {isSelected && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(120,150,165,.16)' }}>
                <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', color: '#9fb2bc', textTransform: 'uppercase', marginBottom: 10 }}>
                  Editing Point {ltr}
                </div>
                {loc.samples.map((sm, si) => {
                  const info = chMap[sm.id];
                  return (
                    <div key={sm.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 10.5, color: '#8aa0ab', width: 44 }}>
                        {info ? `CH${info.ch}` : `#${si + 1}`}
                      </span>
                      <input
                        type="range" min={0} max={10} step={0.5}
                        value={sm.depth}
                        onChange={e => onSetDepth(sm.id, +e.target.value)}
                        onClick={e => e.stopPropagation()}
                        style={{ flex: 1 }}
                      />
                      <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 12, color: '#1559b0', width: 46, textAlign: 'right' }}>
                        {sm.depth.toFixed(1)}m
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* AI review */}
      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', color: '#9fb2bc', textTransform: 'uppercase', margin: '18px 0 8px' }}>AI review</div>
      <div style={{
        padding: 13, border: '1px solid rgba(138,114,255,.34)',
        borderRadius: 13, background: 'rgba(247,245,255,.7)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8L12 2Z" fill="#6d52f5" />
          </svg>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', color: '#6d52f5' }}>AI · {ai.tag}</span>
        </div>
        <div style={{ fontSize: 12.5, lineHeight: 1.5, color: '#566974' }}>{ai.body}</div>
        {ai.canApply && !aiApplied && (
          <button
            onClick={e => { e.stopPropagation(); onAiApply(); }}
            style={{
              marginTop: 11, width: '100%', padding: 9, border: 'none',
              borderRadius: 10, background: 'linear-gradient(150deg,#9b86ff,#6d52f5)',
              color: '#fff', fontWeight: 600, fontSize: 12.5, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >Apply recommendation</button>
        )}
        {aiApplied && (
          <div style={{ marginTop: 9, fontSize: 12, color: '#1aa06a', fontWeight: 600 }}>✓ Applied</div>
        )}
      </div>
    </GlassCard>
  );
}
