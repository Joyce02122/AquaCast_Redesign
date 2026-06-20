import React from 'react';
import type { Stage } from '../../types';
import { STEP_LABELS } from '../../constants';

interface Props {
  stage: Stage;
  onNavigateReview?: () => void;
}

const STEPS = STEP_LABELS;
const STAGE_TO_STEP: Partial<Record<Stage, number>> = {
  plan: 0, defaults: 1, points: 2, review: 3, pair: 4, confirm: 4,
};

export function TopChrome({ stage, onNavigateReview }: Props) {
  const isWelcome = stage === 'welcome';
  const currentStep = STAGE_TO_STEP[stage] ?? -1;

  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, top: 0, height: 72,
      zIndex: 30, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 40px',
    }}>
      {/* Left: logo + nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: 'linear-gradient(155deg,#5ea6e8,#1f6fd4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M12 3c3.5 4.2 6 7.3 6 10.4A6 6 0 0 1 6 13.4C6 10.3 8.5 7.2 12 3Z" fill="#fff" />
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-.3px', color: '#16242e' }}>AquaCast</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            fontSize: 12.5, fontWeight: 600, color: '#16242e',
            padding: '6px 12px', borderRadius: 9, background: 'rgba(31,111,212,.1)',
          }}>Create Mission</span>
          <span onClick={onNavigateReview} style={{
            fontSize: 12.5, fontWeight: 500, color: '#8aa0ab',
            padding: '6px 12px', borderRadius: 9, textDecoration: 'none',
            cursor: onNavigateReview ? 'pointer' : 'default',
          }}>Review</span>
        </div>
      </div>

      {/* Center: step indicator */}
      {!isWelcome && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {STEPS.map((label, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            const dotColor = done ? '#16242e' : active ? '#1f6fd4' : 'transparent';
            const dotBorder = done || active ? 'none' : '2px solid #c8d5db';
            const labelColor = done ? '#16242e' : active ? '#16242e' : '#a8bcc5';
            const labelWeight = active ? 600 : 500;
            return (
              <React.Fragment key={i}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: dotColor, border: dotBorder,
                    display: 'inline-block', flexShrink: 0,
                    boxShadow: active ? '0 0 0 3px rgba(31,111,212,.15)' : 'none',
                  }} />
                  <span style={{ fontSize: 12, fontWeight: labelWeight, color: labelColor }}>
                    {done ? '✓ ' : ''}{label}
                  </span>
                </span>
                {i < STEPS.length - 1 && (
                  <span style={{
                    width: 24, height: 1,
                    background: i < currentStep ? '#c8d5db' : 'rgba(120,150,165,.25)',
                    display: 'inline-block',
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Right: device status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 13px', borderRadius: 30,
        background: 'rgba(255,255,255,.7)', border: '1px solid rgba(120,150,165,.22)',
        backdropFilter: 'blur(10px)',
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1aa06a' }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#16242e' }}>AquaCast-023</span>
        <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 11.5, color: '#8aa0ab' }}>82%</span>
      </div>
    </div>
  );
}
