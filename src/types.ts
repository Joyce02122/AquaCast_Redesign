export type Stage = 'welcome' | 'plan' | 'defaults' | 'points' | 'review' | 'pair' | 'confirm';
export type PairState = 'idle' | 'connecting' | 'connected';

export interface Sample {
  id: string;
  depth: number;
}

export interface Location {
  id: string;
  lat: number;
  lng: number;
  mx: number;
  my: number;
  samples: Sample[];
}

export interface Area {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  swatch: string;
  tint: string;
}

export interface Device {
  id: string;
  name: string;
  battery: number;
  chambers: number;
  firmware: string;
  fwOk: boolean;
  signal: string;
  bars: number;
  sync: string;
}

export interface FlatSample {
  locId: string;
  locIdx: number;
  letter: string;
  sampleId: string;
  depth: number;
  globalIdx: number;
  round: number;
  run: number;
  ch: number;
}

export interface AquaCastState {
  stage: Stage;
  areaId: string;
  locations: Location[];
  selLocId: string | null;
  routeOrder: string[];
  bottle: 250 | 400 | 1000;
  sensors: string[];
  formLat: string;
  formLng: string;
  aiApplied: boolean;
  draftSaved: boolean;
  deployed: boolean;
  pairState: PairState;
  selectedDeviceId: string;
  scale: number;
}

export type AquaCastAction =
  | { type: 'SET_SCALE'; scale: number }
  | { type: 'GET_STARTED' }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'PICK_AREA'; id: string }
  | { type: 'SET_FORM_LAT'; value: string }
  | { type: 'SET_FORM_LNG'; value: string }
  | { type: 'ADD_LOC'; lat: number; lng: number; mx: number; my: number }
  | { type: 'REMOVE_LOC'; id: string }
  | { type: 'SELECT_LOC'; id: string | null }
  | { type: 'SET_POINT_LAT'; id: string; value: string }
  | { type: 'SET_POINT_LNG'; id: string; value: string }
  | { type: 'INC_SAMPLE'; locId: string }
  | { type: 'DEC_SAMPLE'; locId: string }
  | { type: 'SET_DEPTH'; sampleId: string; depth: number }
  | { type: 'SET_BOTTLE'; bottle: 250 | 400 | 1000 }
  | { type: 'TOGGLE_SENSOR'; id: string }
  | { type: 'AI_APPLY' }
  | { type: 'SAVE_DRAFT' }
  | { type: 'CONNECT_DEVICE' }
  | { type: 'DEVICE_CONNECTED' }
  | { type: 'SELECT_DEVICE'; id: string }
  | { type: 'DEPLOY' }
  | { type: 'RESTART' }
  | { type: 'MOVE_LOC'; id: string; dir: 1 | -1 };
