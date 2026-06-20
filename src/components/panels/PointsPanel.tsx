import React from 'react';
import type { Location } from '../../types';
import { MAXCH, RUN_COLORS } from '../../constants';
import { letter, flatten, totalSamples } from '../../utils/runs';
import { GlassCard } from '../ui/GlassCard';

interface Props {
  locations: Location[];
  selLocId: string | null;
  routeOrder: string[];
  onSelectLoc: (id: string) => void;
  onIncSample: (locId: string) => void;
  onDecSample: (locId: string) => void;
  onSetDepth: (sampleId: string, depth: number) => void;
}

export function PointsPanel({ locations, selLocId, routeOrder, onSelectLoc, onIncSample, onDecSample, onSetDepth }: Props) {
  const selIdx = locations.findIndex(l => l.id === selLocId);
  const selLoc = selIdx >= 0 ? locations[selIdx] : null;
  const flat = flatten(locations, routeOrder);
  const total = totalSamples(locations);
  const pointProgress = selIdx >= 0 ? `${selIdx + 1} of ${locations.length}` : '';

  // Build a run color map per sample
  const chColorMap: Record<string, string> = {};
  flat.forEach(f => { chColorMap[f.sampleId] = RUN_COLORS[(f.run - 1) % RUN_COLORS.length]; });
  const chMap: Record<string, { ch: number; run: number }> = {};
  flat.forEach(f => { chMap[f.sampleId] = { ch: f.ch, run: f.run }; });

  return (
    <GlassCard className="ac-fade" style={{
      position: 'absolute', left: 40, top: 200,
      width: 344, maxHeight: 474, overflowY: 'auto',
      zIndex: 22, padding: 22,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 13 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.05em', color: '#9fb2bc', textTransform: 'uppercase' }}>Configure each point</span>
        <span style={{ fontSize: 11, color: '#8aa0ab' }}>{pointProgress}</span>
      </div>

      {/* Point pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }}>
        {locations.map((loc, i) => {
          const ltr = letter(i);
          const isActive = loc.id === selLocId;
          const isDone = selIdx >= 0 && i < selIdx;
          return (
            <React.Fragment key={loc.id}>
              <div
                onClick={() => onSelectLoc(loc.id)}
                className="ac-transition"
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                <span style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: isActive ? '#16242e' : isDone ? '#1f6fd4' : 'rgba(120,150,165,.15)',
                  color: isActive || isDone ? '#fff' : '#8aa0ab',
                  fontSize: 13, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: isActive ? 'none' : isDone ? 'none' : '1.5px solid rgba(120,150,165,.3)',
                  boxShadow: isActive ? '0 4px 12px rgba(20,40,55,.2)' : 'none',
                  transition: 'all .3s ease',
                }}>
                  {isDone ? '✓' : ltr}
                </span>
              </div>
              {i < locations.length - 1 && (
                <span style={{ flex: 1, height: 1, background: isDone ? '#1f6fd4' : 'rgba(120,150,165,.22)', minWidth: 12, margin: '0 4px' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {selLoc && (
        <>
          {/* Point header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 15 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(155deg,#3f95f0,#1559b0)',
              color: '#fff', fontSize: 19, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 14px rgba(31,89,176,.3)',
            }}>{letter(selIdx)}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#16242e', letterSpacing: '-.2px' }}>Point {letter(selIdx)}</div>
              <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 10, color: '#8aa0ab' }}>
                {selLoc.lat.toFixed(4)}, {selLoc.lng.toFixed(4)}
              </div>
            </div>
          </div>

          {/* Sample count stepper */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(120,150,165,.07)', borderRadius: 12,
            padding: '11px 14px', marginBottom: 16,
          }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#16242e' }}>Number of samples</div>
              <div style={{ fontSize: 10.5, color: '#8aa0ab' }}>each fills one chamber</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <div
                onClick={() => onDecSample(selLoc.id)}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: selLoc.samples.length <= 1 ? 'rgba(120,150,165,.1)' : 'rgba(31,111,212,.12)',
                  color: selLoc.samples.length <= 1 ? '#c8d5db' : '#1f6fd4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, cursor: selLoc.samples.length > 1 ? 'pointer' : 'default',
                  fontWeight: 400, lineHeight: 1,
                }}
              >−</div>
              <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 17, fontWeight: 600, color: '#16242e', width: 18, textAlign: 'center' }}>
                {selLoc.samples.length}
              </span>
              <div
                onClick={() => {
                  if (selLoc.samples.length < MAXCH && total < 18) onIncSample(selLoc.id);
                }}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: selLoc.samples.length >= MAXCH || total >= 18 ? 'rgba(120,150,165,.1)' : 'rgba(31,111,212,.12)',
                  color: selLoc.samples.length >= MAXCH || total >= 18 ? '#c8d5db' : '#1f6fd4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, cursor: selLoc.samples.length < MAXCH && total < 18 ? 'pointer' : 'default',
                  fontWeight: 400, lineHeight: 1,
                }}
              >+</div>
            </div>
          </div>

          {/* Depth sliders */}
          {selLoc.samples.map((sm, si) => {
            const info = chMap[sm.id];
            const runColor = info ? RUN_COLORS[(info.run - 1) % RUN_COLORS.length] : '#1f6fd4';
            const chLabel = info ? `CH${info.ch}` : '';
            return (
              <div key={sm.id} style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 13 }}>
                <div style={{ width: 84, flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#16242e' }}>Sample {si + 1}</div>
                  <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 9.5, color: runColor }}>{chLabel}</div>
                </div>
                <input
                  type="range" min={0} max={10} step={0.5}
                  value={sm.depth}
                  onChange={e => onSetDepth(sm.id, +e.target.value)}
                  style={{ flex: 1 }}
                />
                <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 12.5, fontWeight: 600, color: '#16242e', width: 46, textAlign: 'right' }}>
                  {sm.depth.toFixed(1)}m
                </span>
              </div>
            );
          })}
        </>
      )}
    </GlassCard>
  );
}
