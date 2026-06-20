import type { Area, Device } from './types';

export const AREAS: Area[] = [
  { id: 'green', name: 'Green Lake', region: 'Seattle, WA', lat: 47.6803, lng: -122.2620, swatch: '#2bb3a3', tint: 'rgba(43,179,163,.12)' },
  { id: 'wash', name: 'Lake Washington', region: 'King County, WA', lat: 47.6101, lng: -122.2615, swatch: '#5a78c0', tint: 'rgba(90,120,200,.12)' },
  { id: 'puget', name: 'Puget Sound', region: 'Salish Sea, WA', lat: 47.6062, lng: -122.3321, swatch: '#2f6fd4', tint: 'rgba(47,111,212,.12)' },
];

export const SENSORS: [string, string][] = [
  ['temp', 'Temperature'],
  ['ph', 'pH'],
  ['do', 'Dissolved O₂'],
  ['cond', 'Conductivity'],
  ['turb', 'Turbidity'],
];

export const DEVICES: Device[] = [
  { id: '023', name: 'AquaCast-023', battery: 82, chambers: 6, firmware: 'v3.4.1', fwOk: true, signal: 'Strong', bars: 3, sync: '2h ago' },
  { id: '009', name: 'AquaCast-009', battery: 96, chambers: 6, firmware: 'v3.4.1', fwOk: true, signal: 'Fair', bars: 2, sync: '5m ago' },
  { id: '017', name: 'AquaCast-017', battery: 54, chambers: 4, firmware: 'v3.2.0', fwOk: false, signal: 'Good', bars: 2, sync: '1d ago' },
];

export const MAXCH = 6;
export const MAXPERLOC = 6;
export const MAXTOTAL = 18;

export const SCENE_W = 1280;
export const SCENE_H = 740;

export const MAP_HERO = { x: 356, y: 160, w: 700, h: 510 };
export const MAP_CORNER = { x: 1098, y: 182 };
export const MAP_S = 0.36;
export const MAP_REVIEW_S = 0.70;

export const ORIGIN = { mx: 0.12, my: 0.88 };

export const RUN_COLORS = ['#1f6fd4', '#df9620', '#2bb3a3', '#9b59b6'];
export const RUN_NAMES = ['Run 1', 'Run 2', 'Run 3', 'Run 4'];

export const CHAM_FRACTIONS: [number, number][] = [
  [0.16, 0.66], [0.34, 0.50], [0.40, 0.80],
  [0.62, 0.80], [0.68, 0.50], [0.86, 0.66],
];

export const DEVICE_AREA = { L: 405, T: 150, W: 470, H: 437 };

export const LSLOT = [
  { x: 962, y: 248 }, { x: 1018, y: 430 }, { x: 828, y: 598 }, { x: 470, y: 602 },
];

export const NAV_STAGES = ['welcome', 'plan', 'defaults', 'points', 'review', 'pair', 'confirm'] as const;
export const STEP_STAGES = ['plan', 'defaults', 'points', 'review', 'pair'] as const;
export const STEP_LABELS = ['Locations', 'Defaults', 'Configure', 'Review', 'Pair'];

export const BOTTLE_SIZES: (250 | 400 | 1000)[] = [250, 400, 1000];
