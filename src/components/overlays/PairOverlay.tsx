import React from 'react';
import type { PairState } from '../../types';
import { DEVICES } from '../../constants';

interface Props {
  pairState: PairState;
  selectedDeviceId: string;
  onSelectDevice: (id: string) => void;
  onConnect: () => void;
  onContinue: () => void;
  onBack: () => void;
}

export function PairOverlay({ pairState, selectedDeviceId, onSelectDevice, onConnect, onContinue, onBack }: Props) {
  const selDev = DEVICES.find(d => d.id === selectedDeviceId) || DEVICES[0];
  const psConnecting = pairState === 'connecting';
  const psConnected = pairState === 'connected';
  const psScan = psConnecting;
  const enoughChambers = selDev.chambers >= 6;

  const ringBase: React.CSSProperties = {
    position: 'absolute', left: '50%', top: '50%',
    width: 300, height: 300, marginLeft: -150, marginTop: -150,
    borderRadius: '50%', border: '1.5px solid rgba(31,111,212,.45)',
  };

  return (
    <div className="ac-fade" style={{
      position: 'absolute', inset: 0, zIndex: 44,
      background: 'radial-gradient(130% 100% at 50% 6%,#ffffff,#eef3f5 58%,#e4ebed)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 44, width: 1020 }}>

        {/* Device with rings */}
        <div style={{ position: 'relative', width: 300, height: 392, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {psScan && (
            <>
              <div style={{ ...ringBase, animation: 'acPulse 2.6s ease-out infinite' }} />
              <div style={{ ...ringBase, animation: 'acPulse 2.6s ease-out infinite 0.9s' }} />
              <div style={{ ...ringBase, animation: 'acPulse 2.6s ease-out infinite 1.8s' }} />
            </>
          )}
          <img
            src="/assets/aquacast-device.png"
            alt="AquaCast device"
            style={{ position: 'relative', width: '75%', objectFit: 'contain', filter: 'drop-shadow(0 24px 42px rgba(40,70,90,.18))' }}
          />
          {/* Status dot */}
          <div style={{
            position: 'absolute', right: 46, top: 60,
            width: 14, height: 14, borderRadius: '50%',
            border: '3px solid #fff',
            background: psConnected ? '#1aa06a' : '#1f6fd4',
            boxShadow: '0 2px 8px rgba(20,50,90,.3)',
            ...(psScan ? { animation: 'acGlow 1.6s ease-in-out infinite' } : {}),
          }} />
        </div>

        {/* Card */}
        <div style={{
          flex: 1,
          background: 'rgba(255,255,255,.97)', border: '1px solid rgba(120,150,165,.22)',
          borderRadius: 22, boxShadow: '0 28px 64px rgba(40,80,120,.16)',
          padding: '26px 28px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.22em', color: '#9fb2bc', textTransform: 'uppercase' }}>
            Deployment preparation
          </div>
          <h2 style={{ margin: '8px 0 4px', fontSize: 23, fontWeight: 600, letterSpacing: '-.5px', color: '#16242e' }}>
            {psConnected
              ? `${selDev.name} connected`
              : psConnecting
                ? `Connecting to ${selDev.name}…`
                : 'Select a device to pair'}
          </h2>
          <div style={{ fontSize: 13, color: '#7c8c98', lineHeight: 1.5, marginBottom: 18 }}>
            {psConnected
              ? 'Linked over Bluetooth. Chambers verified and the mission is loaded — ready to confirm deployment.'
              : psConnecting
                ? 'Establishing a secure link and verifying onboard chambers.'
                : 'AquaCast scanned for nearby devices. Choose one to load this mission onto.'}
          </div>

          {/* Device list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
            {DEVICES.map(d => {
              const isSelected = d.id === selectedDeviceId;
              const fits = d.chambers >= 6;
              const batCol = d.battery > 60 ? '#1aa06a' : d.battery > 30 ? '#df9620' : '#e04a3a';
              return (
                <div
                  key={d.id}
                  onClick={() => { if (!psConnected) onSelectDevice(d.id); }}
                  className="ac-transition"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 13, cursor: psConnected ? 'default' : 'pointer',
                    border: isSelected ? '2px solid #1f6fd4' : '1px solid rgba(120,150,165,.2)',
                    background: isSelected ? 'rgba(31,111,212,.05)' : 'rgba(248,251,252,.8)',
                  }}
                >
                  {/* Radio */}
                  <span style={{
                    width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                    background: isSelected ? '#1f6fd4' : 'transparent',
                    border: isSelected ? 'none' : '1.5px solid #c8d5db',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, color: '#fff',
                  }}>{isSelected ? '●' : ''}</span>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <span style={{ fontWeight: 600, fontSize: 13.5, color: '#16242e' }}>{d.name}</span>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap',
                        color: isSelected ? (psConnected ? '#1aa06a' : '#1559b0') : (fits ? '#1559b0' : '#9a6a10'),
                        background: isSelected ? (psConnected ? 'rgba(26,160,106,.12)' : 'rgba(31,111,212,.1)') : (fits ? 'rgba(31,111,212,.1)' : 'rgba(245,158,11,.14)'),
                      }}>
                        {isSelected && psConnected ? 'Connected' : d.signal}
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 10.5, color: '#8aa0ab', marginTop: 2 }}>
                      {d.bars === 3 ? '▂▄█' : d.bars === 2 ? '▂▄░' : '▂░░'} · Last sync {d.sync}
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, textAlign: 'right' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: batCol }}>{d.battery}%</div>
                      <div style={{ fontSize: 9, color: '#9fb2bc', textTransform: 'uppercase', letterSpacing: '.05em' }}>Battery</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: fits ? '#16242e' : '#c2791f' }}>{d.chambers}/6</div>
                      <div style={{ fontSize: 9, color: '#9fb2bc', textTransform: 'uppercase', letterSpacing: '.05em' }}>Chambers</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: d.fwOk ? '#16242e' : '#c2791f', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {d.firmware}{!d.fwOk && ' ⚠'}
                      </div>
                      <div style={{ fontSize: 9, color: '#9fb2bc', textTransform: 'uppercase', letterSpacing: '.05em' }}>Firmware</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Warning */}
          {(!enoughChambers || !selDev.fwOk) && !psConnected && (
            <div style={{
              display: 'flex', gap: 9, padding: '11px 13px',
              borderRadius: 12, background: 'rgba(245,158,11,.08)',
              border: '1px solid rgba(245,158,11,.28)', marginBottom: 16,
            }}>
              <span style={{ fontSize: 14, lineHeight: 1.3 }}>⚠</span>
              <span style={{ fontSize: 12, color: '#9a6a10', lineHeight: 1.45 }}>
                {!enoughChambers
                  ? `${selDev.name} has only ${selDev.chambers} chambers — this mission needs 6 per run. Pick a device with full capacity.`
                  : `${selDev.name} is on ${selDev.firmware}. Update firmware before field deployment.`}
              </span>
            </div>
          )}

          {/* Connect button */}
          {!psConnected && (
            <button
              onClick={psConnecting ? undefined : onConnect}
              className="ac-transition"
              style={{
                width: '100%', padding: 14, border: 'none', borderRadius: 13,
                fontWeight: 600, fontSize: 14.5, color: '#fff',
                background: psConnecting ? 'rgba(22,36,46,.4)' : 'linear-gradient(150deg,#3f95f0,#1559b0)',
                boxShadow: psConnecting ? 'none' : '0 12px 28px rgba(31,89,176,.24)',
                cursor: psConnecting ? 'default' : 'pointer',
                pointerEvents: psConnecting ? 'none' : 'auto',
                fontFamily: 'inherit',
              }}
            >
              {psConnecting ? 'Connecting…' : `Connect ${selDev.name}`}
            </button>
          )}

          {/* Continue */}
          {psConnected && (
            <button
              onClick={onContinue}
              className="ac-transition"
              style={{
                width: '100%', padding: 14, border: 'none', borderRadius: 13,
                background: '#16242e', color: '#fff',
                fontWeight: 600, fontSize: 14.5, cursor: 'pointer',
                boxShadow: '0 14px 30px rgba(20,40,55,.26)', fontFamily: 'inherit',
              }}
            >Continue to deployment →</button>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 13 }}>
            <span onClick={onBack} style={{ fontSize: 12, color: '#8aa0ab', cursor: 'pointer' }}>← Back to review</span>
          </div>
        </div>
      </div>
    </div>
  );
}

