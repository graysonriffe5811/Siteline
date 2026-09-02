import type { Units } from "./types";

/** Meters per unit. US survey foot is 1200/3937 m. */
export const METERS_PER: Record<Units, number> = {
  m: 1,
  ift: 0.3048,
  usft: 1200 / 3937,
};

export const UNIT_LABEL: Record<Units, string> = {
  m: "m",
  ift: "ft",
  usft: "sft",
};

export const UNIT_NAME: Record<Units, string> = {
  m: "Meters",
  ift: "International feet",
  usft: "US survey feet",
};

export function toMeters(value: number, units: Units): number {
  return value * METERS_PER[units];
}

export function fromMeters(meters: number, units: Units): number {
  return meters / METERS_PER[units];
}

export function convert(value: number, from: Units, to: Units): number {
  if (from === to) return value;
  return fromMeters(toMeters(value, from), to);
}

export function formatDist(value: number, units: Units, decimals?: number): string {
  if (!Number.isFinite(value)) return "—";
  const d = decimals ?? (units === "m" ? 3 : 3);
  return `${value.toFixed(d)} ${UNIT_LABEL[units]}`;
}

export function formatCoord(value: number, units: Units): string {
  if (!Number.isFinite(value)) return "—";
  const d = units === "m" ? 3 : 4;
  return value.toFixed(d);
}

export function parseNumber(input: string): number | null {
  const n = Number(input.trim().replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}
