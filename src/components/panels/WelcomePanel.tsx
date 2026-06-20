interface Props {
  onGetStarted: () => void;
}

const STEPS = [
  { label: 'Planning', desc: 'Choose survey sites, drop sampling points, and set sample depths.', color: '#1f6fd4' },
  { label: 'Deployment', desc: 'Pair your AquaCast device and confirm the deployment runs.', color: '#df9620' },
  { label: 'Review', desc: 'Validate coverage, inspect routes, and review mission results.', color: '#2bb3a3' },
];

export function WelcomePanel({ onGetStarted }: Props) {
  return (
    <div
      className="ac-fade"
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: 72,
        zIndex: 22, pointerEvents: 'none',
      }}
    >
      {/* Device image — rendered here so it shares the same center axis as all text */}
      <div
        className="ac-float"
        style={{ width: 220, height: 300, flexShrink: 0, marginTop: 0 }}
      >
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

      {/* Text + CTA block */}
      <div
        style={{
          textAlign: 'center', width: 560,
          flexShrink: 0, marginTop: 14,
          pointerEvents: 'auto',
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.28em', color: '#9fb2bc', textTransform: 'uppercase' }}>
          AquaCast · Field operations
        </div>
        <h1 style={{
          margin: '10px 0 0', fontSize: 28, lineHeight: 1.12,
          fontWeight: 400, letterSpacing: '-.5px', color: '#16242e',
        }}>
          AquaCast Mission Workspace
        </h1>
        <p style={{ margin: '10px auto 0', fontSize: 13, lineHeight: 1.6, color: '#7c8c98', maxWidth: 420 }}>
          Plan deployments, configure devices, and review mission results — all from one workspace.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '16px 0 20px' }}>
          {STEPS.map(s => (
            <div key={s.label} style={{
              flex: 1, textAlign: 'left',
              padding: '12px 14px', borderRadius: 14,
              background: 'rgba(255,255,255,.8)', border: '1px solid rgba(120,150,165,.22)',
              backdropFilter: 'blur(8px)', boxShadow: '0 8px 22px rgba(40,80,120,.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: s.color, display: 'inline-block' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#16242e' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 11, lineHeight: 1.48, color: '#7c8c98' }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onGetStarted}
          className="ac-transition"
          style={{
            padding: '11px 26px', border: 'none', borderRadius: 12,
            background: '#16242e', color: '#fff',
            fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
            boxShadow: '0 12px 28px rgba(20,40,55,.22)',
            fontFamily: 'inherit',
          }}
        >
          Get started →
        </button>
      </div>
    </div>
  );
}
