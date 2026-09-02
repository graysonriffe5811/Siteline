export const DEG = Math.PI / 180;
export const RAD = 180 / Math.PI;

export function normalizeDeg(deg: number): number {
  let x = deg % 360;
  if (x < 0) x += 360;
  return x;
}

export function clampZenith(deg: number): number {
  if (!Number.isFinite(deg)) return 90;
  return Math.min(179.999, Math.max(0.001, deg));
}

function pad2(n: number, decimals = 0): string {
  const v = decimals > 0 ? n.toFixed(decimals) : String(Math.round(n));
  const [whole, frac] = v.split(".");
  const body = whole.padStart(2, "0");
  return frac != null ? `${body}.${frac}` : body;
}

/** Format a decimal-degree angle as DDD°MM'SS" (seconds to `secDecimals`). */
export function formatDms(deg: number, secDecimals = 0): string {
  if (!Number.isFinite(deg)) return "—";
  const wrapped = normalizeDeg(deg);
  const factor = 10 ** secDecimals;
  let totalSeconds = Math.round(wrapped * 3600 * factor) / factor;
  if (totalSeconds >= 360 * 3600) totalSeconds = 0;
  let d = Math.floor(totalSeconds / 3600);
  let rem = totalSeconds - d * 3600;
  let m = Math.floor(rem / 60);
  let s = rem - m * 60;
  if (s >= 60 - 1e-9) {
    s = 0;
    m += 1;
  }
  if (m >= 60) {
    m = 0;
    d += 1;
  }
  if (d >= 360) d = 0;
  return `${d}°${pad2(m)}'${pad2(s, secDecimals)}"`;
}

export function formatDmsSigned(deg: number, secDecimals = 0): string {
  if (!Number.isFinite(deg)) return "—";
  const sign = deg < 0 ? "-" : "+";
  return sign + formatDms(Math.abs(deg), secDecimals);
}

/** Parse 45.21052, 45 12 38, or 45°12'38" into decimal degrees. */
export function parseAngle(input: string): number | null {
  const raw = input.trim();
  if (!raw) return null;
  const compact = raw.replace(/[°º]/g, " ").replace(/[′']/g, " ").replace(/[″"]/g, " ").replace(/,/g, " ");
  const parts = compact.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const n = Number(parts[0]);
    return Number.isFinite(n) ? n : null;
  }
  if (parts.length >= 2) {
    const d = Number(parts[0]);
    const m = Number(parts[1]);
    const s = parts.length >= 3 ? Number(parts[2]) : 0;
    if (![d, m, s].every(Number.isFinite)) return null;
    const sign = d < 0 || raw.trim().startsWith("-") ? -1 : 1;
    return sign * (Math.abs(d) + Math.abs(m) / 60 + Math.abs(s) / 3600);
  }
  return null;
}

export function toBearing(azDeg: number): string {
  const a = normalizeDeg(azDeg);
  const close = (x: number) => Math.abs(a - x) < 1 / 3600;
  if (close(0) || close(360)) return "Due N";
  if (close(90)) return "Due E";
  if (close(180)) return "Due S";
  if (close(270)) return "Due W";
  if (a < 90) return `N ${formatDms(a)} E`;
  if (a < 180) return `S ${formatDms(180 - a)} E`;
  if (a < 270) return `S ${formatDms(a - 180)} W`;
  return `N ${formatDms(360 - a)} W`;
}

/** Survey azimuth: north = 0, east = 90, clockwise. */
export function azimuthFromDeltas(dN: number, dE: number): number {
  return normalizeDeg(Math.atan2(dE, dN) * RAD);
}

export function zenithFromDeltas(hd: number, dZ: number): number {
  return normalizeDeg(Math.atan2(hd, dZ) * RAD);
}

export function vaFromZenith(za: number): number {
  return 90 - za;
}
