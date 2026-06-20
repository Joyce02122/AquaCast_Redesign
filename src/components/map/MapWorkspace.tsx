import React from 'react';
import type { Stage, Location, Area } from '../../types';
import { MAP_HERO, ORIGIN, RUN_COLORS } from '../../constants';
import { letter, buildRuns } from '../../utils/runs';

// Plan position: map fills main workspace; panel right-edge is ~370, so start at 400
const PLAN_LEFT = 400;
const PLAN_TOP  = 128;

// Mini-map scale (configure + review use same size so map never jumps)
const MAP_S_MINI = 0.50;

// Both configure and review land at the same corner — spatial consistency
// left=904: device review right-edge is 885 → 19px gap before mini-map
const CORNER = { left: 904, top: 155 };

interface Props {
  stage: Stage;
  locations: Location[];
  routeOrder: string[];
  selLocId: string | null;
  area: Area;
  onMapClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onRemoveLoc: (id: string) => void;
  onSelectLoc: (id: string) => void;
}

function getMapStyle(stage: Stage): React.CSSProperties {
  // Common: the inner content is always MAP_HERO size.
  // We animate left/top (the plan position) and use transform: translate+scale
  // to fly it to corner positions.  transformOrigin='top left' means scale
  // shrinks from the top-left corner, matching the translate target exactly.
  const trans = 'left .65s cubic-bezier(.2,.8,.2,1), top .65s cubic-bezier(.2,.8,.2,1), transform .65s cubic-bezier(.2,.8,.2,1), border-radius .4s ease, box-shadow .4s ease, border .3s ease';

  if (stage === 'plan') {
    return {
      left: PLAN_LEFT, top: PLAN_TOP,
      width: MAP_HERO.w, height: MAP_HERO.h,
      transform: 'none', transformOrigin: 'top left',
      borderRadius: 0,
      pointerEvents: 'auto',
      boxShadow: 'none',
      border: 'none',
      transition: trans,
    };
  }

  if (stage === 'defaults' || stage === 'points' || stage === 'review') {
    const tx = CORNER.left - PLAN_LEFT;
    const ty = CORNER.top  - PLAN_TOP;
    return {
      left: PLAN_LEFT, top: PLAN_TOP,
      width: MAP_HERO.w, height: MAP_HERO.h,
      transform: `translate(${tx}px,${ty}px) scale(${MAP_S_MINI})`,
      transformOrigin: 'top left',
      borderRadius: 18,
      pointerEvents: 'none',
      boxShadow: '0 14px 34px rgba(40,80,120,.13)',
      border: '1px solid rgba(120,150,165,.22)',
      transition: trans,
    };
  }

  return { display: 'none' };
}

function RouteSVG({ locations, routeOrder, w, h }: { locations: Location[]; routeOrder: string[]; w: number; h: number }) {
  const runs = buildRuns(locations, routeOrder);
  if (!runs.length) return null;
  const O = { x: ORIGIN.mx * w, y: ORIGIN.my * h };

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
      {runs.map((run, ri) => {
        const col = RUN_COLORS[ri % RUN_COLORS.length];
        const pts = [O, ...run.map(l => ({ x: l.mx * w, y: l.my * h })), O];
        const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
        return (
          <React.Fragment key={ri}>
            <path d={d} fill="none" stroke={col} strokeOpacity={0.16} strokeWidth={16}
              strokeLinejoin="round" strokeLinecap="round" />
            <path d={d} fill="none" stroke={col} strokeWidth={6}
              strokeLinejoin="round" strokeLinecap="round"
              strokeDasharray="3 13"
              style={{ animation: 'acDash 14s linear infinite' }} />
          </React.Fragment>
        );
      })}
    </svg>
  );
}

export function MapWorkspace({ stage, locations, routeOrder, selLocId, area, onMapClick, onRemoveLoc, onSelectLoc }: Props) {
  const showMap = !['welcome', 'pair', 'confirm'].includes(stage);
  const isPlan = stage === 'plan';
  const isReview = stage === 'review';
  const showRoutes = isReview && locations.length > 0;
  const W = MAP_HERO.w, H = MAP_HERO.h;

  if (!showMap) return null;

  const mapStyle = getMapStyle(stage);

  return (
    <div
      onClick={isPlan ? onMapClick : undefined}
      style={{
        position: 'absolute',
        overflow: 'hidden',
        zIndex: 6,
        cursor: isPlan ? 'crosshair' : 'default',
        background: 'radial-gradient(120% 90% at 26% 14%,rgba(255,255,255,.6),transparent 60%), rgba(244,248,250,.96)',
        ...mapStyle,
      }}
    >
      {/* Grid lines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(120,150,165,.10) 1px,transparent 1px),linear-gradient(90deg,rgba(120,150,165,.10) 1px,transparent 1px)',
        backgroundSize: '64px 64px',
      }} />

      {/* Decorative ellipses */}
      <div style={{ position: 'absolute', left: -60, top: 120, width: 520, height: 420, border: '1px solid rgba(80,120,150,.18)', borderRadius: '52% 48% 46% 54%/48% 52% 48% 52%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: -40, bottom: -60, width: 420, height: 360, border: '1px solid rgba(80,120,150,.14)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* Labels */}
      {isPlan ? (
        <>
          <div style={{ position: 'absolute', top: 16, left: 18, fontFamily: "'Roboto Mono',monospace", fontSize: 10.5, letterSpacing: '.1em', color: '#6f8794', textTransform: 'uppercase', pointerEvents: 'none' }}>
            Sampling map · {area.name}
          </div>
          <div style={{ position: 'absolute', top: 15, right: 18, fontSize: 11.5, color: '#7c93a0', pointerEvents: 'none' }}>
            Click to place a point
          </div>
        </>
      ) : null}

      {/* Route SVG */}
      {showRoutes && <RouteSVG locations={locations} routeOrder={routeOrder} w={W} h={H} />}

      {/* Origin */}
      {showRoutes && (
        <div style={{ position: 'absolute', left: ORIGIN.mx * W - 13, top: ORIGIN.my * H - 13, zIndex: 3 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: '#16242e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, boxShadow: '0 6px 16px rgba(20,50,90,.35)', border: '2px solid #fff' }}>⌂</div>
          <div style={{ position: 'absolute', left: '50%', top: 29, transform: 'translateX(-50%)', fontFamily: "'Roboto Mono',monospace", fontSize: 9.5, color: '#3a4f5c', background: 'rgba(255,255,255,.92)', borderRadius: 6, padding: '1px 6px', whiteSpace: 'nowrap' }}>Base</div>
        </div>
      )}

      {/* Map markers */}
      {locations.map((loc, i) => {
        const ltr = letter(i);
        const coords = `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
        const isSelected = loc.id === selLocId;
        return (
          <div key={loc.id} style={{ position: 'absolute', left: loc.mx * W - 14, top: loc.my * H - 14, zIndex: 4 }}>
            <div
              onClick={e => { e.stopPropagation(); onSelectLoc(loc.id); }}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isSelected ? '#16242e' : 'linear-gradient(155deg,#3f95f0,#1559b0)',
                color: '#fff', fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #fff',
                boxShadow: '0 4px 14px rgba(31,89,176,.3)',
                cursor: 'pointer',
              }}
            >{ltr}</div>
            <div style={{ position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)', fontFamily: "'Roboto Mono',monospace", fontSize: 9.5, color: '#3a4f5c', background: 'rgba(255,255,255,.92)', borderRadius: 6, padding: '2px 6px', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
              {coords}
            </div>
            {isPlan && (
              <div
                onClick={e => { e.stopPropagation(); onRemoveLoc(loc.id); }}
                style={{ position: 'absolute', top: -8, right: -8, width: 18, height: 18, borderRadius: '50%', background: '#fff', border: '1px solid rgba(120,150,165,.3)', color: '#8aa0ab', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', lineHeight: 1 }}
              >×</div>
            )}
          </div>
        );
      })}

      {/* Empty state */}
      {isPlan && locations.length === 0 && (
        <div style={{ position: 'absolute', left: '50%', top: '54%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#5a7283' }}>Click anywhere to drop your first sampling point</div>
          <div style={{ fontSize: 12, color: '#86a0ad', marginTop: 5 }}>Points A, B, C… live on the map and become chambers in Configure.</div>
        </div>
      )}
    </div>
  );
}
