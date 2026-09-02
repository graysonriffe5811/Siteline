export type Units = "usft" | "ift" | "m";

export type DistMethod = "edm" | "hd" | "gps" | "ground" | "keyin" | "resection";

export type PointKind = "control" | "topo" | "calc";

export type TabId = "sight" | "station" | "map" | "points";

export type OrientationMode = "circle" | "compass";

export interface Observation {
  stationName: string;
  ha: number;
  za: number;
  sd: number;
  hd: number;
  vd: number;
  hi: number;
  ht: number;
  az: number;
  method: DistMethod;
  gpsAccuracyM?: number;
}

export interface Point {
  id: string;
  name: string;
  n: number;
  e: number;
  z: number;
  code: string;
  desc: string;
  kind: PointKind;
  obs?: Observation;
  createdAt: number;
}

export interface Station {
  pointId: string;
  hi: number;
  ht: number;
  orientationMode: OrientationMode;
  azAtZero: number;
  backsightId: string | null;
  bsHa: number;
  setupAt: number;
}

export interface GpsOrigin {
  lat: number;
  lon: number;
  n: number;
  e: number;
}

export interface Job {
  id: string;
  name: string;
  units: Units;
  declination: number;
  gpsOrigin: GpsOrigin | null;
  points: Point[];
  station: Station | null;
  nextName: string;
  createdAt: number;
}

export interface LiveReading {
  ha: number;
  za: number;
  magAz: number | null;
  roll: number;
  source: "sensors" | "manual";
  compassAccuracy: number | null;
}

export const FIELD_CODES = [
  "CP",
  "TP",
  "BM",
  "IP",
  "FS",
  "BS",
  "STA",
  "EOP",
  "CL",
  "TOE",
  "TOP",
  "FL",
  "FH",
  "INV",
  "GRATE",
  "POLE",
  "FENCE",
  "TREE",
  "WALK",
  "BLDG",
  "COR",
  "PIN",
  "MON",
] as const;
