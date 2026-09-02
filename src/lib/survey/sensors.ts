export interface OrientationSample {
  magAz: number | null;
  za: number;
  roll: number;
  compassAccuracy: number | null;
}

type PermissionFn = () => Promise<"granted" | "denied">;

function doe(): { requestPermission?: PermissionFn } {
  return DeviceOrientationEvent as unknown as { requestPermission?: PermissionFn };
}

export async function requestOrientationPermission(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const ctor = doe();
  if (typeof ctor.requestPermission === "function") {
    try {
      const res = await ctor.requestPermission();
      return res === "granted";
    } catch {
      return false;
    }
  }
  return true;
}

export async function requestMotionPermission(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const ctor = DeviceMotionEvent as unknown as { requestPermission?: PermissionFn };
  if (typeof ctor.requestPermission === "function") {
    try {
      const res = await ctor.requestPermission();
      return res === "granted";
    } catch {
      return false;
    }
  }
  return true;
}

function portrait(): boolean {
  if (typeof window === "undefined") return true;
  const type = window.screen?.orientation?.type ?? "";
  if (type.includes("landscape")) return false;
  return window.innerHeight >= window.innerWidth;
}

/**
 * Back-camera zenith angle (0 = zenith, 90 = horizon) from W3C deviceorientation.
 * Portrait: ZA ≈ 180 − beta. Landscape uses gamma as the camera pitch proxy.
 */
export function readingFromEvent(ev: DeviceOrientationEvent): OrientationSample {
  const beta = ev.beta ?? 90;
  const gamma = ev.gamma ?? 0;
  const ios = ev as DeviceOrientationEvent & {
    webkitCompassHeading?: number;
    webkitCompassAccuracy?: number;
  };
  const magAz =
    typeof ios.webkitCompassHeading === "number" && Number.isFinite(ios.webkitCompassHeading)
      ? ios.webkitCompassHeading
      : typeof ev.alpha === "number"
        ? (360 - ev.alpha) % 360
        : null;

  const isPortrait = portrait();
  let za: number;
  let roll: number;
  if (isPortrait) {
    za = 180 - beta;
    roll = gamma;
  } else {
    za = 90 - gamma;
    roll = beta - 90;
  }
  za = Math.min(179.9, Math.max(0.1, za));

  const compassAccuracy =
    typeof ios.webkitCompassAccuracy === "number" ? ios.webkitCompassAccuracy : null;

  return { magAz, za, roll, compassAccuracy };
}
