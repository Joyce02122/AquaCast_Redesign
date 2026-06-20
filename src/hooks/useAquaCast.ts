import { useReducer, useEffect, useCallback } from 'react';
import type { AquaCastState, AquaCastAction } from '../types';
import { AREAS, MAXPERLOC, MAXTOTAL, SCENE_W, SCENE_H } from '../constants';
import { uid, totalSamples, buildRuns } from '../utils/runs';
import { latToMy, lngToMx } from '../utils/geo';

const SPREAD = [1, 3, 5, 7, 9, 10];
const a0 = AREAS[0];

const initialState: AquaCastState = {
  stage: 'welcome',
  areaId: 'green',
  locations: [],
  selLocId: null,
  routeOrder: [],
  bottle: 400,
  sensors: ['temp', 'do'],
  formLat: a0.lat.toFixed(4),
  formLng: a0.lng.toFixed(4),
  aiApplied: false,
  draftSaved: false,
  deployed: false,
  pairState: 'idle',
  selectedDeviceId: '023',
  scale: 1,
};

let pairTimer: ReturnType<typeof setTimeout> | null = null;

function calcScale(): number {
  if (typeof window === 'undefined') return 1;
  const w = window.innerWidth, h = window.innerHeight;
  if (!w || !h) return 1;
  return Math.min(w / SCENE_W, h / SCENE_H) * 0.98;
}

function getArea(state: AquaCastState) {
  if (state.areaId === 'custom') {
    return {
      id: 'custom', name: 'Custom location', region: 'Manual coordinates',
      lat: parseFloat(state.formLat) || 47.6, lng: parseFloat(state.formLng) || -122.3,
      swatch: '#8a72ff', tint: 'rgba(138,114,255,.1)',
    };
  }
  return AREAS.find(a => a.id === state.areaId) || AREAS[0];
}

function reducer(state: AquaCastState, action: AquaCastAction): AquaCastState {
  switch (action.type) {
    case 'SET_SCALE':
      return { ...state, scale: action.scale };

    case 'GET_STARTED':
      return { ...state, stage: 'plan' };

    case 'NEXT': {
      const st = state.stage;
      if (st === 'welcome') return { ...state, stage: 'plan' };
      if (st === 'plan') {
        if (totalSamples(state.locations) === 0) return state;
        return { ...state, stage: 'defaults', selLocId: null };
      }
      if (st === 'defaults') {
        return { ...state, stage: 'points', selLocId: state.locations[0]?.id ?? null };
      }
      if (st === 'points') {
        const idx = state.locations.findIndex(l => l.id === state.selLocId);
        if (idx >= 0 && idx < state.locations.length - 1) {
          return { ...state, selLocId: state.locations[idx + 1].id };
        }
        return { ...state, stage: 'review' };
      }
      if (st === 'review') return { ...state, stage: 'pair' };
      if (st === 'pair') return { ...state, stage: 'confirm' };
      return state;
    }

    case 'BACK': {
      const st = state.stage;
      if (st === 'plan') return { ...state, stage: 'welcome' };
      if (st === 'defaults') return { ...state, stage: 'plan' };
      if (st === 'points') {
        const idx = state.locations.findIndex(l => l.id === state.selLocId);
        if (idx > 0) return { ...state, selLocId: state.locations[idx - 1].id };
        return { ...state, stage: 'defaults', selLocId: null };
      }
      if (st === 'review') {
        const last = state.locations[state.locations.length - 1];
        return { ...state, stage: 'points', selLocId: last?.id ?? null };
      }
      if (st === 'pair') return { ...state, stage: 'review' };
      if (st === 'confirm') return { ...state, stage: 'pair' };
      return state;
    }

    case 'PICK_AREA': {
      if (action.id === 'custom') return { ...state, areaId: 'custom' };
      const a = AREAS.find(x => x.id === action.id);
      if (!a) return state;
      return { ...state, areaId: action.id, formLat: a.lat.toFixed(4), formLng: a.lng.toFixed(4) };
    }

    case 'SET_FORM_LAT': return { ...state, formLat: action.value };
    case 'SET_FORM_LNG': return { ...state, formLng: action.value };

    case 'ADD_LOC': {
      if (state.locations.length >= 4 || totalSamples(state.locations) >= MAXTOTAL) return state;
      const id = uid();
      const newLoc = { id, lat: action.lat, lng: action.lng, mx: action.mx, my: action.my, samples: [{ id: uid(), depth: 2.0 }] };
      return {
        ...state,
        locations: [...state.locations, newLoc],
        routeOrder: [...state.routeOrder, id],
        selLocId: id,
      };
    }

    case 'REMOVE_LOC':
      return {
        ...state,
        locations: state.locations.filter(l => l.id !== action.id),
        routeOrder: state.routeOrder.filter(x => x !== action.id),
        selLocId: state.selLocId === action.id ? null : state.selLocId,
      };

    case 'SELECT_LOC':
      return { ...state, selLocId: action.id };

    case 'SET_POINT_LAT': {
      const v = parseFloat(action.value);
      const area = getArea(state);
      return {
        ...state,
        locations: state.locations.map(l => {
          if (l.id !== action.id) return l;
          if (isNaN(v)) return l;
          const my = latToMy(v, area);
          return { ...l, lat: v, my };
        }),
      };
    }

    case 'SET_POINT_LNG': {
      const v = parseFloat(action.value);
      const area = getArea(state);
      return {
        ...state,
        locations: state.locations.map(l => {
          if (l.id !== action.id) return l;
          if (isNaN(v)) return l;
          const mx = lngToMx(v, area);
          return { ...l, lng: v, mx };
        }),
      };
    }

    case 'INC_SAMPLE': {
      if (totalSamples(state.locations) >= MAXTOTAL) return state;
      return {
        ...state,
        locations: state.locations.map(l => {
          if (l.id !== action.locId || l.samples.length >= MAXPERLOC) return l;
          const d = SPREAD[l.samples.length % SPREAD.length];
          return { ...l, samples: [...l.samples, { id: uid(), depth: d }] };
        }),
      };
    }

    case 'DEC_SAMPLE':
      return {
        ...state,
        locations: state.locations.map(l => {
          if (l.id !== action.locId || l.samples.length <= 1) return l;
          return { ...l, samples: l.samples.slice(0, -1) };
        }),
      };

    case 'SET_DEPTH':
      return {
        ...state,
        locations: state.locations.map(l => ({
          ...l,
          samples: l.samples.map(s => s.id === action.sampleId ? { ...s, depth: action.depth } : s),
        })),
      };

    case 'SET_BOTTLE':
      return { ...state, bottle: action.bottle };

    case 'TOGGLE_SENSOR':
      return {
        ...state,
        sensors: state.sensors.includes(action.id)
          ? state.sensors.filter(x => x !== action.id)
          : [...state.sensors, action.id],
      };

    case 'AI_APPLY':
      return { ...state, aiApplied: true };

    case 'SAVE_DRAFT':
      return { ...state, draftSaved: true };

    case 'CONNECT_DEVICE':
      return { ...state, pairState: 'connecting' };

    case 'DEVICE_CONNECTED':
      return { ...state, pairState: 'connected' };

    case 'SELECT_DEVICE':
      return { ...state, selectedDeviceId: action.id, pairState: 'idle' };

    case 'DEPLOY':
      return { ...state, deployed: true };

    case 'RESTART': {
      if (pairTimer) clearTimeout(pairTimer);
      return { ...initialState, scale: state.scale };
    }

    case 'MOVE_LOC': {
      const ordered = (() => {
        const byId: Record<string, boolean> = {};
        state.locations.forEach(l => { byId[l.id] = true; });
        const out: string[] = [];
        state.routeOrder.forEach(id => { if (byId[id]) { out.push(id); delete byId[id]; } });
        state.locations.forEach(l => { if (byId[l.id]) out.push(l.id); });
        return out;
      })();
      const i = ordered.indexOf(action.id);
      const j = i + action.dir;
      if (i < 0 || j < 0 || j >= ordered.length) return state;
      const arr = [...ordered];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...state, routeOrder: arr };
    }

    default:
      return state;
  }
}

export function useAquaCast() {
  const [state, dispatch] = useReducer(reducer, { ...initialState, scale: calcScale() });

  const handleResize = useCallback(() => {
    dispatch({ type: 'SET_SCALE', scale: calcScale() });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // pairing timer
  useEffect(() => {
    if (state.pairState === 'connecting') {
      if (pairTimer) clearTimeout(pairTimer);
      pairTimer = setTimeout(() => {
        dispatch({ type: 'DEVICE_CONNECTED' });
      }, 1600);
    }
    return () => { if (pairTimer) clearTimeout(pairTimer); };
  }, [state.pairState]);

  const runs = buildRuns(state.locations, state.routeOrder);

  return { state, dispatch, runs, getArea: () => getArea(state) };
}
