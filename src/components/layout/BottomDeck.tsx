import type { Stage } from '../../types';

interface Props {
  stage: Stage;
  canContinue: boolean;
  continueLabel: string;
  draftSaved: boolean;
  onBack: () => void;
  onContinue: () => void;
  onSaveDraft: () => void;
}

const STAGE_TO_DOT: Record<string, number> = {
  plan: 0, defaults: 1, points: 2, review: 3, pair: 4,
};

export function BottomDeck({ stage, canContinue, continueLabel, draftSaved, onBack, onContinue, onSaveDraft }: Props) {
  const showDeck = ['plan', 'defaults', 'points', 'review'].includes(stage);
  const showSaveDraft = stage === 'review';
  const currentDot = STAGE_TO_DOT[stage] ?? -1;

  if (!showDeck) return null;

  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 30,
      zIndex: 30, display: 'flex', justifyContent: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Back */}
        <button
          onClick={onBack}
          className="ac-transition"
          style={{
            width: 42, height: 42, borderRadius: '50%',
            border: '1px solid rgba(120,150,165,.28)',
            background: 'rgba(255,255,255,.7)', color: '#16242e',
            fontSize: 16, cursor: 'pointer', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >←</button>

        {/* Dots */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '8px 14px', borderRadius: 24,
          background: 'rgba(255,255,255,.7)', border: '1px solid rgba(120,150,165,.2)',
          backdropFilter: 'blur(10px)',
        }}>
          {[0, 1, 2, 3, 4].map(i => (
            <span key={i} style={{
              width: i === currentDot ? 20 : 7,
              height: 7, borderRadius: 4,
              background: i === currentDot ? '#16242e' : i < currentDot ? '#a0b4bd' : 'rgba(120,150,165,.3)',
              transition: 'all .35s ease',
              display: 'inline-block',
            }} />
          ))}
        </div>

        {/* Save draft */}
        {showSaveDraft && (
          <button
            onClick={onSaveDraft}
            className="ac-transition"
            style={{
              padding: '13px 22px', border: '1px solid rgba(120,150,165,.32)',
              borderRadius: 13, background: 'rgba(255,255,255,.8)',
              color: '#16242e', fontWeight: 600, fontSize: 13.5,
              cursor: 'pointer', backdropFilter: 'blur(10px)',
            }}
          >
            {draftSaved ? '✓ Draft saved' : 'Save draft'}
          </button>
        )}

        {/* Continue */}
        <button
          onClick={canContinue ? onContinue : undefined}
          className="ac-transition"
          style={{
            padding: '13px 24px', border: 'none', borderRadius: 13,
            fontSize: 14, fontWeight: 600, cursor: canContinue ? 'pointer' : 'default',
            color: '#fff',
            background: canContinue ? '#16242e' : 'rgba(22,36,46,.34)',
            boxShadow: canContinue ? '0 12px 28px rgba(20,40,55,.22)' : 'none',
            pointerEvents: canContinue ? 'auto' : 'none',
          }}
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
}
