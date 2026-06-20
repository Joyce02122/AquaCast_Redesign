import type { Location, Area } from '../../types';
import { SENSORS } from '../../constants';
import { letter, flatten, buildRuns, totalSamples } from '../../utils/runs';
import { aiInsight } from '../../utils/ai';

interface Props {
  locations: Location[];
  routeOrder: string[];
  area: Area;
  bottle: 250 | 400 | 1000;
  sensors: string[];
  aiApplied: boolean;
  onBack: () => void;
  onDeploy: () => void;
}

export function ConfirmModal({ locations, routeOrder, area, bottle, sensors, aiApplied, onBack, onDeploy }: Props) {
  const flat = flatten(locations, routeOrder);
  const runs = buildRuns(locations, routeOrder);
  const total = totalSamples(locations);
  const nRounds = Math.max(1, runs.length);
  const ai = aiInsight(flat, aiApplied);
  const multiRound = nRounds > 1;

  const sensorNames = sensors.map(id => {
    const s = SENSORS.find(x => x[0] === id);
    return s ? s[1] : id;
  });

  const letters = locations.map((_, i) => letter(i)).join(' · ');

  const stats = [
    { label: 'Survey area', value: area.name, sub: area.region },
    { label: 'Locations', value: String(locations.length), sub: letters || '—' },
    { label: 'Total samples', value: String(total), sub: `${total} ${total === 1 ? 'chamber' : 'chambers'} filled` },
    { label: 'Deployment runs', value: String(nRounds), sub: runs.map((r, ri) => `${nRounds > 1 ? `Run ${ri + 1}: ` : ''}${r.reduce((n, l) => n + l.samples.length, 0)} CH`).join('   ') },
    { label: 'Bottle size', value: `${bottle} ml`, sub: 'per chamber' },
    { label: 'Sensors', value: `${sensors.length} active`, sub: sensorNames.join(', ') || 'none' },
  ];

  const chMap: Record<string, { ch: number; run: number }> = {};
  flat.forEach(f => { chMap[f.sampleId] = { ch: f.ch, run: f.run }; });

  const aiConfirm = `AI · ${ai.tag} — ${aiApplied ? 'recommendation applied.' : ai.canApply ? 'a depth refinement is available back in Review.' : 'depths look well balanced for this mission.'}`;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 42,
      background: 'rgba(231,237,239,.74)', backdropFilter: 'blur(7px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="ac-scroll ac-fade" style={{
        width: 548, maxHeight: 670, overflowY: 'auto',
        background: 'rgba(255,255,255,.98)', border: '1px solid rgba(120,150,165,.22)',
        borderRadius: 24, boxShadow: '0 40px 90px rgba(20,50,90,.28)',
        padding: '30px 32px',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.22em', color: '#9fb2bc', textTransform: 'uppercase' }}>
          Final check
        </div>
        <h2 style={{ margin: '8px 0 5px', fontSize: 25, fontWeight: 600, letterSpacing: '-.5px', color: '#16242e' }}>
          Confirm deployment
        </h2>
        <div style={{ fontSize: 13, color: '#7c8c98', lineHeight: 1.5, marginBottom: 22 }}>
          This mission will be sent to AquaCast-023. Review the summary before deploying.
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 17 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              padding: '13px 14px', borderRadius: 14,
              background: 'rgba(120,150,165,.07)', border: '1px solid rgba(120,150,165,.13)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', color: '#9fb2bc', textTransform: 'uppercase', marginBottom: 5 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#16242e', letterSpacing: '-.2px' }}>{s.value}</div>
              <div style={{ fontSize: 10.5, color: '#8aa0ab', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Multi-round warning */}
        {multiRound && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '13px 14px', borderRadius: 13,
            background: 'rgba(245,158,11,.09)', border: '1px solid rgba(245,158,11,.32)',
            marginBottom: 18,
          }}>
            <span style={{ fontSize: 14, lineHeight: 1.2 }}>⚠</span>
            <div style={{ fontSize: 12.5, lineHeight: 1.5, color: '#7a5b12' }}>
              Mission requires {nRounds} deployment runs. The sampler surfaces and resets between runs.
            </div>
          </div>
        )}

        {/* Depth config */}
        <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', color: '#9fb2bc', textTransform: 'uppercase', marginBottom: 9 }}>
          Depth configuration
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {locations.map((loc, i) => {
            const ltr = letter(i);
            return (
              <div key={loc.id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: '#16242e',
                  color: '#fff', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{ltr}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {loc.samples.map(sm => {
                    const info = chMap[sm.id];
                    const pre = info && info.run > 1 ? `R${info.run}·` : '';
                    return (
                      <span key={sm.id} style={{
                        fontFamily: "'Roboto Mono',monospace", fontSize: 10.5,
                        color: '#1559b0', background: 'rgba(31,111,212,.09)',
                        borderRadius: 6, padding: '3px 7px',
                      }}>
                        {pre}CH{info?.ch ?? '?'} · {sm.depth.toFixed(1)}m
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI note */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 9,
          padding: '12px 13px', borderRadius: 12,
          background: 'rgba(247,245,255,.8)', border: '1px solid rgba(138,114,255,.28)',
          marginBottom: 23,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M12 2l1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8L12 2Z" fill="#6d52f5" />
          </svg>
          <span style={{ fontSize: 12, color: '#566974', lineHeight: 1.45 }}>{aiConfirm}</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <button
            onClick={onBack}
            className="ac-transition"
            style={{
              padding: '13px 18px', border: '1px solid rgba(120,150,165,.3)',
              borderRadius: 13, background: '#fff', color: '#16242e',
              fontWeight: 600, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >← Back to pairing</button>
          <button
            onClick={onDeploy}
            className="ac-transition"
            style={{
              flex: 1, padding: 14, border: 'none', borderRadius: 13,
              background: '#16242e', color: '#fff',
              fontWeight: 600, fontSize: 14.5, cursor: 'pointer',
              boxShadow: '0 14px 30px rgba(20,40,55,.26)', fontFamily: 'inherit',
            }}
          >Confirm &amp; deploy ↓</button>
        </div>
      </div>
    </div>
  );
}
