import type { Area } from '../types';

export function latToMy(lat: number, area: Area): number {
  return Math.max(0.08, Math.min(0.92, 0.5 - (lat - area.lat) / 0.02));
}

export function lngToMx(lng: number, area: Area): number {
  return Math.max(0.05, Math.min(0.95, 0.5 + (lng - area.lng) / 0.03));
}

export function mxToLng(mx: number, area: Area): number {
  return +(area.lng + (mx - 0.5) * 0.03).toFixed(4);
}

export function myToLat(my: number, area: Area): number {
  return +(area.lat + (0.5 - my) * 0.02).toFixed(4);
}
