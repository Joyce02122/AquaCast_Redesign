import type { Location, Area } from '../../types';
import { AREAS, MAXCH } from '../../constants';
import { letter, totalSamples } from '../../utils/runs';
import { GlassCard } from '../ui/GlassCard';

interface Props {
  areaId: string;
  area: Area;
  locations: Location[];
  selLocId: string | null;
  formLat: string;
  formLng: string;
  onPickArea: (id: string) => void;
  onSetFormLat: (v: string) => void;
  onSetFormLng: (v: string) => void;
  onRemoveLoc: (id: string) => void;
  onSelectLoc: (id: string) => void;
  onSetPointLat: (id: string, v: string) => void;
  onSetPointLng: (id: string, v: string) => void;
}

const AREA_OPTIONS = [...AREAS, { id: 'custom', name: 'Custom', region: 'Set coordinates', swatch: '#8a72ff', lat: 0, lng: 0, tint: '' }];

export function PlanPanel({ areaId, locations, selLocId, formLat, formLng, onPickArea, onSetFormLat, onSetFormLng, onRemoveLoc, onSelectLoc, onSetPointLat, onSetPointLng }: Props) {
  const total = totalSamples(locations);
  const customMode = areaId === 'custom';
  const chamberText = total <= MAXCH ? `${total} / ${MAXCH} chambers` : `${total} samples · ${Math.ceil(total / MAXCH)} rounds`;

  return (
    <GlassCard className="ac-fade" style={{
      position: 'absolute', left: 40, top: 222,
      width: 330, maxHeight: 460, overflowY: 'auto',
      zIndex: 22, padding: 22,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.05em', color: '#9fb2bc', textTransform: 'uppercase', marginBottom: 12 }}>
        Survey location
      </div>

      {/* Area grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
        {AREA_OPTIONS.map(o => {
          const selected = areaId === o.id;
          return (
            <div
              key={o.id}
              onClick={() => onPickArea(o.id)}
              className="ac-transition"
              style={{
                padding: '12px 12px 10px',
                borderRadius: 14, cursor: 'pointer',
                border: selected ? '2px solid #1f6fd4' : '1px solid rgba(120,150,165,.2)',
                background: selected ? 'rgba(31,111,212,.06)' : 'rgba(248,251,252,.8)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 11, height: 11, borderRadius: '50%', flexShrink: 0, background: (o as any).swatch ?? '#8a72ff', display: 'inline-block' }} />
                <span style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: selected ? '#1f6fd4' : 'transparent',
                  border: selected ? 'none' : '1.5px solid #c8d5db',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: '#fff', flexShrink: 0,
                  transition: 'all .2s ease',
                }}>
                  {selected ? '✓' : ''}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#16242e', marginTop: 7, lineHeight: 1.2 }}>{o.name}</div>
              <div style={{ fontSize: 10.5, color: '#8aa0ab', marginTop: 2 }}>{o.region}</div>
            </div>
          );
        })}
      </div>

      {/* Custom inputs */}
      {customMode && (
        <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, color: '#8aa0ab', marginBottom: 4 }}>Latitude</div>
            <input value={formLat} onChange={e => onSetFormLat(e.target.value)} className="ac-inp" placeholder="47.6543" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, color: '#8aa0ab', marginBottom: 4 }}>Longitude</div>
            <input value={formLng} onChange={e => onSetFormLng(e.target.value)} className="ac-inp" placeholder="-122.3078" />
          </div>
        </div>
      )}

      {/* Sampling points */}
      <div style={{ borderTop: '1px solid rgba(120,150,165,.16)', marginTop: 18, paddingTop: 15 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, letterSpacing: '.05em', color: '#9fb2bc', textTransform: 'uppercase', marginBottom: 11 }}>
          <span>Sampling points</span>
          <span>{chamberText}</span>
        </div>

        {locations.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {locations.map((loc, i) => {
              const ltr = letter(i);
              const isSelected = loc.id === selLocId;
              return (
                <div key={loc.id} style={{
                  padding: '10px 12px', borderRadius: 12,
                  background: isSelected ? 'rgba(31,111,212,.06)' : 'rgba(120,150,165,.05)',
                  border: isSelected ? '1px solid rgba(31,111,212,.2)' : '1px solid transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => onSelectLoc(loc.id)}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: 'linear-gradient(155deg,#3f95f0,#1559b0)',
                      color: '#fff', fontSize: 12, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>{ltr}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#16242e' }}>Point {ltr}</div>
                      <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 10, color: '#8aa0ab' }}>
                        {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                      </div>
                    </div>
                    <div onClick={e => { e.stopPropagation(); onRemoveLoc(loc.id); }} style={{ color: '#b0bcc4', fontSize: 16, cursor: 'pointer', padding: '2px 4px' }}>×</div>
                  </div>

                  {isSelected && (
                    <div style={{ marginTop: 10, paddingTop: 11, borderTop: '1px dashed rgba(120,150,165,.28)' }}>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.04em', color: '#9fb2bc', textTransform: 'uppercase', marginBottom: 7 }}>Fine-tune coordinates</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: '#8aa0ab', marginBottom: 3 }}>Lat</div>
                          <input defaultValue={loc.lat.toFixed(4)} onChange={e => onSetPointLat(loc.id, e.target.value)} className="ac-inp" style={{ padding: '7px 9px' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: '#8aa0ab', marginBottom: 3 }}>Lng</div>
                          <input defaultValue={loc.lng.toFixed(4)} onChange={e => onSetPointLng(loc.id, e.target.value)} className="ac-inp" style={{ padding: '7px 9px' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: '#aebcc4', padding: '4px 0', lineHeight: 1.5 }}>
            Click the map to drop a point, then select it here to fine-tune its exact latitude and longitude.
          </div>
        )}
      </div>
    </GlassCard>
  );
}
