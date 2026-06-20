import React from 'react';
import type { Stage, Location } from '../../types';
import { CHAM_FRACTIONS, DEVICE_AREA, RUN_COLORS } from '../../constants';

interface Props {
  stage: Stage;
  locations: Location[];
  routeOrder: string[];
  runs: Location[][];
}

// Upper-right corner (Plan) → center large (Configure/Review)
// CSS transition on left/top/width/height drives the spatial swap
function getDeviceWrap(stage: Stage): React.CSSProperties {
  const transition = 'left .65s cubic-bezier(.2,.8,.2,1), top .65s cubic-bezier(.2,.8,.2,1), width .65s cubic-bezier(.2,.8,.2,1), height .65s cubic-bezier(.2,.8,.2,1), opacity .4s ease';
  const base: React.CSSProperties = { position: 'absolute', zIndex: 8, transition };

  if (stage === 'welcome') {
    // Hidden at plan position so it fades in cleanly on welcome→plan.
    // Device display on welcome screen is handled inside WelcomePanel (flex column, true center).
    return { ...base, left: 1062, top: 50, width: 178, height: 265, opacity: 0, pointerEvents: 'none' };
  }
  if (stage === 'plan') {
    // Small, upper-right corner — device is secondary while map dominates
    return { ...base, left: 1062, top: 50, width: 178, height: 265 };
  }
  if (stage === 'defaults' || stage === 'points') {
    // Large, centered — device becomes primary workspace
    // Left matches DEVICE_AREA.L so chamber badges align with the image
    return { ...base, left: 405, top: 58, width: 470, height: 565 };
  }
  if (stage === 'review') {
    return { ...base, left: 395, top: 44, width: 490, height: 585 };
  }
  // pair/confirm: keep position but invisible (no transition flicker)
  return { ...base, left: 405, top: 58, width: 470, height: 565, opacity: 0, pointerEvents: 'none' };
}

function ChamberBadge({ idx, loc, runIdx }: { idx: number; loc: Location | null; runIdx: number }) {
  const [fx, fy] = CHAM_FRACTIONS[idx];
  const x = DEVICE_AREA.L + fx * DEVICE_AREA.W;
  const y = DEVICE_AREA.T + fy * DEVICE_AREA.H;
  const assigned = loc !== null;
  const color = assigned ? RUN_COLORS[runIdx % RUN_COLORS.length] : 'rgba(120,150,165,.25)';

  return (
    <div style={{
      position: 'absolute',
      left: x - 14, top: y - 14,
      width: 28, height: 28,
      zIndex: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {assigned && (
        <div style={{
          position: 'absolute', inset: -4,
          borderRadius: '50%',
          background: color + '30',
          filter: 'blur(4px)',
        }} />
      )}
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: assigned ? color : 'rgba(120,150,165,.22)',
        color: assigned ? '#fff' : '#9fb2bc',
        fontSize: 11, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid rgba(255,255,255,.85)',
        boxShadow: assigned ? `0 4px 12px ${color}55` : '0 2px 6px rgba(40,70,90,.1)',
        position: 'relative', zIndex: 2,
      }}>
        {idx + 1}
      </div>
    </div>
  );
}

export function DeviceHero({ stage, runs }: Props) {
  const wrapStyle = getDeviceWrap(stage);

  // Build chamber assignments
  const chamberAssignments: { loc: Location | null; runIdx: number }[] = Array(6).fill(null).map(() => ({ loc: null, runIdx: 0 }));
  let chIdx = 0;
  runs.forEach((run, ri) => {
    run.forEach(loc => {
      loc.samples.forEach(() => {
        if (chIdx < 6) {
          chamberAssignments[chIdx] = { loc, runIdx: ri };
          chIdx++;
        }
      });
    });
  });

  return (
    <>
      {/* Chamber badges — canvas-absolute, only in configure/review stages */}
      {(['defaults', 'points', 'review'] as Stage[]).includes(stage) &&
        CHAM_FRACTIONS.map((_, i) => (
          <ChamberBadge
            key={i}
            idx={i}
            loc={chamberAssignments[i]?.loc ?? null}
            runIdx={chamberAssignments[i]?.runIdx ?? 0}
          />
        ))
      }

      {/* Device — position transitions drive the spatial swap */}
      <div style={wrapStyle}>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {/* Ground shadow — scales with wrapper */}
          <div style={{
            position: 'absolute', left: '50%', bottom: -20,
            transform: 'translateX(-50%)',
            width: '85%', height: 40, borderRadius: '50%',
            background: 'radial-gradient(closest-side,rgba(40,70,90,.18),rgba(40,70,90,0))',
            filter: 'blur(3px)',
          }} />
          {/* Floating device image */}
          <div className="ac-float" style={{ width: '100%', height: '100%' }}>
            <img
              src="/assets/aquacast-device.png"
              alt="AquaCast sampler"
              style={{
                width: '100%', height: '100%',
                objectFit: 'contain', display: 'block',
                filter: 'drop-shadow(0 22px 36px rgba(40,70,90,.15))',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
