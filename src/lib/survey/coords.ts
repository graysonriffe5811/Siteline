import { azimuthFromDeltas, clampZenith, DEG, normalizeDeg, zenithFromDeltas } from "./angles";
import type { DistMethod, Observation, Point, Station, Units } from "./types";
import { fromMeters, toMeters } from "./units";

export interface Nez {
  n: number;
  e: number;
  z: number;
}

export interface InverseResult extends Nez {
  dN: number;
  dE: number;
  dZ: number;
  hd: number;
  sd: number;
  az: number;
  za: number;
}

export function hypot2(a: number, b: number): number {
  return Math.hypot(a, b);
}

export function inverse(from: Nez, to: Nez): InverseResult {
  const dN = to.n - from.n;
  const dE = to.e - from.e;
  const dZ = to.z - from.z;
  const hd = Math.hypot(dN, dE);
  const sd = Math.hypot(hd, dZ);
  const az = azimuthFromDeltas(dN, dE);
  const za = zenithFromDeltas(hd, dZ);
  return { n: to.n, e: to.e, z: to.z, dN, dE, dZ, hd, sd, az, za };
}

export function instrumentHeight(station: Nez, hi: number): Nez {
  return { n: station.n, e: station.e, z: station.z + hi };
}

export function radiation(args: {
  station: Nez;
  hi: number;
  ht: number;
  az: number;
  za: number;
  distance: number;
  distIsHd: boolean;
}): { nez: Nez; hd: number; sd: number; vd: number } {
  const za = clampZenith(args.za);
  const sinZ = Math.sin(za * DEG);
  const cosZ = Math.cos(za * DEG);
  let sd: number;
  let hd: number;
  if (args.distIsHd) {
    hd = args.distance;
    sd = sinZ === 0 ? args.distance : args.distance / sinZ;
  } else {
    sd = args.distance;
    hd = sd * sinZ;
  }
  const vd = sd * cosZ;
  const az = normalizeDeg(args.az) * DEG;
  const n = args.station.n + hd * Math.cos(az);
  const e = args.station.e + hd * Math.sin(az);
  const z = args.station.z + args.hi + vd - args.ht;
  return { nez: { n, e, z }, hd, sd, vd };
}

export function depressionHd(hi: number, za: number): number | null {
  const zenith = clampZenith(za);
  if (zenith <= 90 + 1e-6 || hi <= 0) return null;
  const vaDown = (zenith - 90) * DEG;
  const hd = hi / Math.tan(vaDown);
  return Number.isFinite(hd) && hd > 0 ? hd : null;
}

export function liveAzimuth(station: Station | null, ha: number, magAz: number | null, declination: number): number {
  if (!station) {
    if (magAz != null) return normalizeDeg(magAz + declination);
    return normalizeDeg(ha);
  }
  if (station.orientationMode === "compass") {
    const mag = magAz ?? ha;
    return normalizeDeg(mag + declination);
  }
  return normalizeDeg(station.azAtZero + ha);
}

export function buildObservation(args: {
  stationName: string;
  ha: number;
  za: number;
  az: number;
  hd: number;
  sd: number;
  vd: number;
  hi: number;
  ht: number;
  method: DistMethod;
  gpsAccuracyM?: number;
}): Observation {
  return {
    stationName: args.stationName,
    ha: args.ha,
    za: args.za,
    az: args.az,
    hd: args.hd,
    sd: args.sd,
    vd: args.vd,
    hi: args.hi,
    ht: args.ht,
    method: args.method,
    gpsAccuracyM: args.gpsAccuracyM,
  };
}

export interface Intersection {
  left: Nez;
  right: Nez;
}

/**
 * Distance-distance intersection in the NE plane.
 * `left` is the solution to the left of directed line A→B.
 */
export function distanceDistance(a: Nez, b: Nez, rA: number, rB: number): Intersection | null {
  const dN = b.n - a.n;
  const dE = b.e - a.e;
  const d = Math.hypot(dN, dE);
  if (d < 1e-9) return null;
  if (d > rA + rB + 1e-9) return null;
  if (d < Math.abs(rA - rB) - 1e-9) return null;
  const aa = (rA * rA - rB * rB + d * d) / (2 * d);
  const h2 = rA * rA - aa * aa;
  const h = h2 <= 0 ? 0 : Math.sqrt(h2);
  const nHat = dN / d;
  const eHat = dE / d;
  const midN = a.n + aa * nHat;
  const midE = a.e + aa * eHat;
  // Rotate A→B 90° CCW for left: (e, n) → (−n, e) in (E,N)
  const left: Nez = { n: midN + h * eHat, e: midE - h * nHat, z: (a.z + b.z) / 2 };
  const right: Nez = { n: midN - h * eHat, e: midE + h * nHat, z: (a.z + b.z) / 2 };
  return { left, right };
}

export function stationZFromSight(targetZ: number, hi: number, ht: number, vd: number): number {
  return targetZ - hi - vd + ht;
}

export function gpsDeltaMeters(
  lat: number,
  lon: number,
  originLat: number,
  originLon: number,
): { dN: number; dE: number } {
  const mPerDegLat = 111320;
  const mPerDegLon = 111320 * Math.cos(originLat * DEG);
  return {
    dN: (lat - originLat) * mPerDegLat,
    dE: (lon - originLon) * mPerDegLon,
  };
}

export function gpsToLocal(
  lat: number,
  lon: number,
  origin: { lat: number; lon: number; n: number; e: number },
  units: Units,
): { n: number; e: number } {
  const { dN, dE } = gpsDeltaMeters(lat, lon, origin.lat, origin.lon);
  return {
    n: origin.n + fromMeters(dN, units),
    e: origin.e + fromMeters(dE, units),
  };
}

export function localToGpsDelta(
  n: number,
  e: number,
  origin: { lat: number; lon: number; n: number; e: number },
  units: Units,
): { lat: number; lon: number } {
  const dN = toMeters(n - origin.n, units);
  const dE = toMeters(e - origin.e, units);
  const mPerDegLat = 111320;
  const mPerDegLon = 111320 * Math.cos(origin.lat * DEG);
  return {
    lat: origin.lat + dN / mPerDegLat,
    lon: origin.lon + (mPerDegLon === 0 ? 0 : dE / mPerDegLon),
  };
}

export function nextPointName(current: string): string {
  const match = current.match(/^(.*?)(\d+)$/);
  if (!match) return current + "1";
  const [, prefix, digits] = match;
  const n = String(Number(digits) + 1).padStart(digits.length, "0");
  return `${prefix}${n}`;
}

export function findPoint(points: Point[], id: string | null | undefined): Point | undefined {
  if (!id) return undefined;
  return points.find((p) => p.id === id);
}

export function findPointByName(points: Point[], name: string): Point | undefined {
  const key = name.trim().toLowerCase();
  return points.find((p) => p.name.trim().toLowerCase() === key);
}

export function extents(points: Point[]): { minN: number; maxN: number; minE: number; maxE: number } | null {
  if (points.length === 0) return null;
  let minN = Infinity,
    maxN = -Infinity,
    minE = Infinity,
    maxE = -Infinity;
  for (const p of points) {
    if (p.n < minN) minN = p.n;
    if (p.n > maxN) maxN = p.n;
    if (p.e < minE) minE = p.e;
    if (p.e > maxE) maxE = p.e;
  }
  return { minN, maxN, minE, maxE };
}
