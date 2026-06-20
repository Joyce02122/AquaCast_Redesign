import { SENSORS, BOTTLE_SIZES } from '../../constants';
import { GlassCard } from '../ui/GlassCard';

interface Props {
  bottle: 250 | 400 | 1000;
  sensors: string[];
  onSetBottle: (v: 250 | 400 | 1000) => void;
  onToggleSensor: (id: string) => void;
}

function BottleGlyph({ size, active }: { size: number; active: boolean }) {
  const h = size === 250 ? 18 : size === 400 ? 26 : 38;
  const w = size === 250 ? 8 : size === 400 ? 10 : 14;
  return (
    <div style={{
      height: 34, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        width: w, height: h, borderRadius: `${w / 2}px ${w / 2}px 3px 3px`,
        background: active ? '#1f6fd4' : 'rgba(120,150,165,.3)',
        position: 'relative', transition: 'background .25s ease',
      }}>
        <div style={{
          position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
          width: w * 0.6, height: 6, background: active ? '#1f6fd4' : 'rgba(120,150,165,.3)',
          borderRadius: '2px 2px 0 0',
        }} />
      </div>
    </div>
  );
}

export function DefaultsPanel({ bottle, sensors, onSetBottle, onToggleSensor }: Props) {
  const sensorSummary = sensors.length === 0 ? 'None'
    : sensors.length === SENSORS.length ? 'All sensors'
    : `${sensors.length} active`;

  return (
    <GlassCard className="ac-fade" style={{
      position: 'absolute', left: 40, top: 208,
      width: 344, maxHeight: 430, overflowY: 'auto',
      zIndex: 22, padding: 22,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.05em', color: '#9fb2bc', textTransform: 'uppercase', marginBottom: 4 }}>
        Mission defaults
      </div>
      <div style={{ fontSize: 12, color: '#8aa0ab', lineHeight: 1.45, marginBottom: 17 }}>
        Applied to every sample. You'll set depths point-by-point next.
      </div>

      {/* Bottle size */}
      <div style={{ fontSize: 12, fontWeight: 600, color: '#16242e', marginBottom: 10 }}>Bottle size</div>
      <div style={{ display: 'flex', gap: 9, marginBottom: 17 }}>
        {BOTTLE_SIZES.map(v => {
          const active = bottle === v;
          return (
            <div
              key={v}
              onClick={() => onSetBottle(v)}
              className="ac-transition"
              style={{
                flex: 1, padding: '12px 8px 10px', borderRadius: 14,
                textAlign: 'center', cursor: 'pointer',
                border: active ? '2px solid #1f6fd4' : '1px solid rgba(120,150,165,.2)',
                background: active ? 'rgba(31,111,212,.06)' : 'rgba(248,251,252,.8)',
              }}
            >
              <span style={{
                display: 'inline-block', width: 16, height: 16, borderRadius: '50%',
                background: active ? '#1f6fd4' : 'transparent',
                border: active ? 'none' : '1.5px solid #c8d5db',
                fontSize: 9, color: '#fff', lineHeight: '16px', textAlign: 'center',
                marginBottom: 4,
              }}>{active ? '●' : ''}</span>
              <BottleGlyph size={v} active={active} />
              <div style={{ fontSize: 14, fontWeight: 700, color: active ? '#1559b0' : '#8aa0ab', marginTop: 7, lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: 10, color: '#8aa0ab', letterSpacing: '.05em', marginTop: 2 }}>ml</div>
            </div>
          );
        })}
      </div>

      {/* Sensors */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#16242e' }}>Sensors</span>
        <span style={{ fontSize: 11, color: '#8aa0ab' }}>{sensorSummary}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {SENSORS.map(([id, label]) => {
          const active = sensors.includes(id);
          return (
            <div
              key={id}
              onClick={() => onToggleSensor(id)}
              className="ac-transition"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                background: active ? 'rgba(31,111,212,.06)' : 'rgba(120,150,165,.05)',
                border: active ? '1px solid rgba(31,111,212,.15)' : '1px solid transparent',
              }}
            >
              <span style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                background: active ? '#1f6fd4' : '#fff',
                border: active ? 'none' : '1.5px solid #c8d5db',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: '#fff', transition: 'all .2s ease',
              }}>{active ? '✓' : ''}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#16242e' }}>{label}</span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
