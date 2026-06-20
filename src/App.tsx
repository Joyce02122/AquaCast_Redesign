import React, { useState } from 'react';
import { useAquaCast } from './hooks/useAquaCast';
import { ReviewPage } from './components/review/ReviewPage';
import { totalSamples } from './utils/runs';
import { SCENE_W, SCENE_H } from './constants';

import { TopChrome } from './components/layout/TopChrome';
import { BottomDeck } from './components/layout/BottomDeck';
import { MapWorkspace } from './components/map/MapWorkspace';
import { DeviceHero } from './components/device/DeviceHero';

import { WelcomePanel } from './components/panels/WelcomePanel';
import { PlanPanel } from './components/panels/PlanPanel';
import { DefaultsPanel } from './components/panels/DefaultsPanel';
import { PointsPanel } from './components/panels/PointsPanel';
import { ReviewPanel } from './components/panels/ReviewPanel';
import { RouteEditor } from './components/panels/RouteEditor';

import { PairOverlay } from './components/overlays/PairOverlay';
import { ConfirmModal } from './components/overlays/ConfirmModal';
import { DeployedOverlay } from './components/overlays/DeployedOverlay';

export default function App() {
  const [appView, setAppView] = useState<'create' | 'review'>('create');
  const { state, dispatch, runs, getArea } = useAquaCast();
  const { stage, locations, selLocId, routeOrder, bottle, sensors, aiApplied, draftSaved, deployed, pairState, selectedDeviceId, scale, areaId, formLat, formLng } = state;

  const area = getArea();
  const total = totalSamples(locations);

  const isWelcome = stage === 'welcome';
  const isPlan = stage === 'plan';
  const isDefaults = stage === 'defaults';
  const isPoints = stage === 'points';
  const isReview = stage === 'review';
  const isPair = stage === 'pair';
  const isConfirm = stage === 'confirm';

  // Determine continue label
  let continueLabel = 'Continue →';
  if (isPlan) continueLabel = 'Mission defaults →';
  else if (isDefaults) continueLabel = 'Configure each point →';
  else if (isPoints) {
    const selIdx = locations.findIndex(l => l.id === selLocId);
    const isLast = selIdx >= 0 && selIdx === locations.length - 1;
    const nextLtr = selIdx >= 0 && !isLast ? String.fromCharCode(65 + selIdx + 1) : '';
    continueLabel = isLast ? 'Review mission →' : `Next: Point ${nextLtr} →`;
  } else if (isReview) continueLabel = 'Pair device →';

  const canContinue = isPlan ? total > 0 : true;

  // Map click handler
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stage !== 'plan') return;
    const rect = e.currentTarget.getBoundingClientRect();
    let fx = (e.clientX - rect.left) / rect.width;
    let fy = (e.clientY - rect.top) / rect.height;
    fx = Math.max(0.05, Math.min(0.95, fx));
    fy = Math.max(0.08, Math.min(0.92, fy));
    const lat = +(area.lat + (0.5 - fy) * 0.02).toFixed(4);
    const lng = +(area.lng + (fx - 0.5) * 0.03).toFixed(4);
    dispatch({ type: 'ADD_LOC', lat, lng, mx: +fx.toFixed(4), my: +fy.toFixed(4) });
  };

  if (appView === 'review') {
    return (
      <div style={{ position: 'fixed', inset: 0, overflow: 'auto', background: '#fff' }}>
        <ReviewPage
          justDeployed={deployed}
          onNavigateCreate={() => setAppView('create')}
        />
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      overflow: 'hidden',
      background: 'radial-gradient(130% 100% at 50% 8%,#ffffff 0%,#f3f6f7 46%,#e7ecee 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Area tint ambient */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        transform: 'translate(-50%,-50%)',
        width: 620, height: 520, borderRadius: '50%',
        background: `radial-gradient(closest-side,${area.tint},transparent)`,
        transition: 'background .6s ease',
        opacity: (isWelcome || isDefaults || isPoints || isReview) ? 1 : 0,
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Ambient water rings (not plan) */}
      {!isPlan && !isWelcome && (
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '50%', marginTop: 80, width: 760, height: 300, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(193,214,222,.4),rgba(193,214,222,0))', pointerEvents: 'none', zIndex: 1 }} />
      )}

      {/* 1280×740 scene canvas */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        width: SCENE_W, height: SCENE_H,
        transform: `translate(-50%,-50%) scale(${scale})`,
        transformOrigin: 'center center',
      }}>

        {/* Ambient decorative ellipse in configure/review */}
        {(isDefaults || isPoints || isReview) && (
          <div style={{ position: 'absolute', left: 140, top: 150, width: 1000, height: 470, border: '1px solid rgba(120,150,165,.13)', borderRadius: '48% 52% 55% 45%/52% 46% 54% 48%', pointerEvents: 'none', zIndex: 1 }} />
        )}

        {/* MAP */}
        <MapWorkspace
          stage={stage}
          locations={locations}
          routeOrder={routeOrder}
          selLocId={selLocId}
          area={area}
          onMapClick={handleMapClick}
          onRemoveLoc={id => dispatch({ type: 'REMOVE_LOC', id })}
          onSelectLoc={id => dispatch({ type: 'SELECT_LOC', id })}
        />

        {/* DEVICE HERO */}
        <DeviceHero
          stage={stage}
          locations={locations}
          routeOrder={routeOrder}
          runs={runs}
        />

        {/* TOP CHROME */}
        <TopChrome stage={stage} onNavigateReview={() => setAppView('review')} />

        {/* AREA LABEL (configure/review) */}
        {(isDefaults || isPoints || isReview) && (
          <div style={{ position: 'absolute', left: '50%', top: 88, transform: 'translateX(-50%)', textAlign: 'center', zIndex: 18 }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: '#9fb2bc' }}>Survey area</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#16242e', letterSpacing: '-.2px', marginTop: 3 }}>{area.name}</div>
          </div>
        )}

        {/* HEADING (plan/defaults/points) */}
        {(isPlan || isDefaults || isPoints) && (
          <div style={{ position: 'absolute', left: 40, top: 94, width: 300, zIndex: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.28em', color: '#9fb2bc', textTransform: 'uppercase' }}>
              {isPlan ? 'Step 1 of 5' : isDefaults ? 'Step 2 of 5' : 'Step 3 of 5'}
            </div>
            <h1 style={{ margin: '9px 0 0', fontSize: 27, lineHeight: 1.1, fontWeight: 500, letterSpacing: '-.6px', color: '#16242e' }}>
              {isPlan ? 'Plan your mission' : isDefaults ? 'Mission defaults' : 'Configure each point'}
            </h1>
            <p style={{ margin: '9px 0 0', fontSize: 12.5, lineHeight: 1.5, color: '#7c8c98', maxWidth: 272 }}>
              {isPlan
                ? 'Choose a survey area and drop sampling points on the map.'
                : isDefaults
                  ? 'Set bottle size and sensors applied to every sample.'
                  : 'Set the number of samples and target depths for each site.'}
            </p>
          </div>
        )}

        {/* PANELS */}
        {isWelcome && (
          <WelcomePanel onGetStarted={() => dispatch({ type: 'GET_STARTED' })} />
        )}

        {isPlan && (
          <PlanPanel
            areaId={areaId}
            area={area}
            locations={locations}
            selLocId={selLocId}
            formLat={formLat}
            formLng={formLng}
            onPickArea={id => dispatch({ type: 'PICK_AREA', id })}
            onSetFormLat={v => dispatch({ type: 'SET_FORM_LAT', value: v })}
            onSetFormLng={v => dispatch({ type: 'SET_FORM_LNG', value: v })}
            onRemoveLoc={id => dispatch({ type: 'REMOVE_LOC', id })}
            onSelectLoc={id => dispatch({ type: 'SELECT_LOC', id })}
            onSetPointLat={(id, v) => dispatch({ type: 'SET_POINT_LAT', id, value: v })}
            onSetPointLng={(id, v) => dispatch({ type: 'SET_POINT_LNG', id, value: v })}
          />
        )}

        {isDefaults && (
          <DefaultsPanel
            bottle={bottle}
            sensors={sensors}
            onSetBottle={b => dispatch({ type: 'SET_BOTTLE', bottle: b })}
            onToggleSensor={id => dispatch({ type: 'TOGGLE_SENSOR', id })}
          />
        )}

        {isPoints && (
          <PointsPanel
            locations={locations}
            selLocId={selLocId}
            routeOrder={routeOrder}
            onSelectLoc={id => dispatch({ type: 'SELECT_LOC', id })}
            onIncSample={locId => dispatch({ type: 'INC_SAMPLE', locId })}
            onDecSample={locId => dispatch({ type: 'DEC_SAMPLE', locId })}
            onSetDepth={(sampleId, depth) => dispatch({ type: 'SET_DEPTH', sampleId, depth })}
          />
        )}

        {isReview && (
          <>
            <ReviewPanel
              locations={locations}
              selLocId={selLocId}
              routeOrder={routeOrder}
              area={area}
              bottle={bottle}
              sensors={sensors}
              aiApplied={aiApplied}
              onSelectLoc={id => dispatch({ type: 'SELECT_LOC', id: id ?? null })}
              onSetDepth={(sampleId, depth) => dispatch({ type: 'SET_DEPTH', sampleId, depth })}
              onAiApply={() => dispatch({ type: 'AI_APPLY' })}
            />
            {locations.length > 0 && (
              <RouteEditor
                locations={locations}
                routeOrder={routeOrder}
                onMoveLoc={(id, dir) => dispatch({ type: 'MOVE_LOC', id, dir })}
              />
            )}
          </>
        )}

        {/* BOTTOM DECK */}
        <BottomDeck
          stage={stage}
          canContinue={canContinue}
          continueLabel={continueLabel}
          draftSaved={draftSaved}
          onBack={() => dispatch({ type: 'BACK' })}
          onContinue={() => dispatch({ type: 'NEXT' })}
          onSaveDraft={() => dispatch({ type: 'SAVE_DRAFT' })}
        />

        {/* PAIR OVERLAY */}
        {isPair && (
          <PairOverlay
            pairState={pairState}
            selectedDeviceId={selectedDeviceId}
            onSelectDevice={id => dispatch({ type: 'SELECT_DEVICE', id })}
            onConnect={() => dispatch({ type: 'CONNECT_DEVICE' })}
            onContinue={() => dispatch({ type: 'NEXT' })}
            onBack={() => dispatch({ type: 'BACK' })}
          />
        )}

        {/* CONFIRM MODAL */}
        {isConfirm && (
          <ConfirmModal
            locations={locations}
            routeOrder={routeOrder}
            area={area}
            bottle={bottle}
            sensors={sensors}
            aiApplied={aiApplied}
            onBack={() => dispatch({ type: 'BACK' })}
            onDeploy={() => dispatch({ type: 'DEPLOY' })}
          />
        )}

        {/* DEPLOYED */}
        {deployed && (
          <DeployedOverlay
            area={area}
            locations={locations}
            routeOrder={routeOrder}
            onRestart={() => dispatch({ type: 'RESTART' })}
          />
        )}

      </div>
    </div>
  );
}
