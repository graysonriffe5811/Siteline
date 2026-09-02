/** Collimator / finder field, degrees — acquire, then 30× telescope. */
export const FINDER_HFOV = 16;

/** True telescope field. Typical 30× total station is 1°30′. */
export const SCOPE_HFOV = 1.5;

/** Half-angle of stadia hairs for k = 100 (staff intercept × 100 ≈ HD). */
export const STADIA_HALF_DEG = (1 / 200) * (180 / Math.PI);

export function clampHfov(h: number): number {
  return Math.min(FINDER_HFOV, Math.max(SCOPE_HFOV, h));
}

/** PerspectiveCamera.fov is vertical; convert from a locked horizontal FOV. */
export function verticalFovDeg(hFovDeg: number, aspect: number): number {
  const h = (hFovDeg * Math.PI) / 180;
  const v = 2 * Math.atan(Math.tan(h / 2) / Math.max(aspect, 0.2));
  return (v * 180) / Math.PI;
}

export function magLabel(hFovDeg: number): string {
  if (hFovDeg <= SCOPE_HFOV + 0.15) return "30×";
  if (hFovDeg >= FINDER_HFOV - 0.2) return "FIND";
  const mag = FINDER_HFOV / hFovDeg;
  return `${mag.toFixed(0)}×`;
}
