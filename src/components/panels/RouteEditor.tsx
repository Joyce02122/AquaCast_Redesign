import React from 'react';
import type { Location } from '../../types';
import { RUN_COLORS, RUN_NAMES } from '../../constants';
import { letter, buildRuns } from '../../utils/runs';

interface Props {
  locations: Location[];
  routeOrder: string[];
  onMoveLoc: (id: string, dir: 1 | -1) => void;
}

export function RouteEditor({ locations, routeOrder, onMoveLoc }: Props) {
  const runs = buildRuns(locations, routeOrder);
  const total = locations.reduce((n, l) => n + l.samples.length, 0);
  const nRounds = Math.max(1, runs.length);
  const routeSummary = nRounds === 1 ? `1 run · ${total} samples` : `${nRounds} runs · ${total} samples`;
  const routeNote = nRounds > 1 ? 'Reorder locations to minimize run-count.' : 'Optimal route — single deployment run.';

  return (
    <div className="ac-fade" style={{
      position: 'absolute', left: 904, top: 420,
      width: 350, zIndex: 24,
      background: 'rgba(255,255,255,.95)',
      border: '1px solid rgba(120,150,165,.22)',
      borderRadius: 16, boxShadow: '0 14px 34px rgba(40,80,120,.12)',
      backdropFilter: 'blur(12px)',
      padding: '13px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '-.1px', color: '#16242e' }}>Route plan</span>
        <span style={{ fontSize: 10.5, color: '#8aa0ab' }}>{routeSummary}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {runs.map((run, ri) => {
          const color = RUN_COLORS[ri % RUN_COLORS.length];
          const cnt = run.reduce((n, l) => n + l.samples.length, 0);
          return (
            <div key={ri} style={{
              padding: '9px 11px', borderRadius: 11,
              background: `${color}12`,
              border: `1px solid ${color}33`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 11, fontWeight: 600, color,
                  background: `${color}20`, borderRadius: 6, padding: '2px 7px',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
                  {RUN_NAMES[ri]}
                </span>
                <span style={{ fontSize: 10.5, color: '#8aa0ab', fontFamily: "'Roboto Mono',monospace" }}>{cnt}/6 CH</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: '#b0bcc4', background: 'rgba(120,150,165,.12)', borderRadius: 6, padding: '2px 7px' }}>Base</span>
                {run.map((loc, li) => {
                  const locIdx = locations.indexOf(loc);
                  const ltr = letter(locIdx);
                  const canLeft = li > 0;
                  const canRight = li < run.length - 1;
                  return (
                    <React.Fragment key={loc.id}>
                      <span style={{ fontSize: 11, color: '#b0bcc4' }}>→</span>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 2,
                        background: '#fff', borderRadius: 6,
                        border: '1px solid rgba(120,150,165,.2)',
                        fontSize: 11, overflow: 'hidden',
                      }}>
                        <span
                          onClick={() => { if (li > 0) onMoveLoc(loc.id, -1); }}
                          style={{ padding: '2px 5px', color: canLeft ? '#5a7283' : '#c8d5db', cursor: canLeft ? 'pointer' : 'default', fontSize: 12 }}
                        >‹</span>
                        <span style={{ padding: '2px 1px', fontWeight: 700, color: '#16242e' }}>{ltr}</span>
                        <span
                          onClick={() => { if (li < run.length - 1) onMoveLoc(loc.id, 1); }}
                          style={{ padding: '2px 5px', color: canRight ? '#5a7283' : '#c8d5db', cursor: canRight ? 'pointer' : 'default', fontSize: 12 }}
                        >›</span>
                      </span>
                    </React.Fragment>
                  );
                })}
                <span style={{ fontSize: 11, color: '#b0bcc4' }}>→</span>
                <span style={{ fontSize: 11, color: '#b0bcc4', background: 'rgba(120,150,165,.12)', borderRadius: 6, padding: '2px 7px' }}>Base</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 10, color: '#9fb2bc', lineHeight: 1.4, marginTop: 9 }}>{routeNote}</div>
    </div>
  );
}
