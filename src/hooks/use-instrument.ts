import { useCallback, useEffect, useRef, useState } from "react";
import { clampZenith, normalizeDeg } from "@/lib/survey/angles";
import { readingFromEvent, requestOrientationPermission } from "@/lib/survey/sensors";
import type { LiveReading } from "@/lib/survey/types";

interface InstrumentState extends LiveReading {
  sensorsOn: boolean;
  held: boolean;
  holdHa: number | null;
  holdZa: number | null;
  permission: "idle" | "denied" | "granted";
}

const INITIAL: InstrumentState = {
  ha: 90,
  za: 90,
  magAz: null,
  roll: 0,
  source: "manual",
  compassAccuracy: null,
  sensorsOn: false,
  held: false,
  holdHa: null,
  holdZa: null,
  permission: "idle",
};

export function useInstrument() {
  const [state, setState] = useState<InstrumentState>(INITIAL);
  const live = useRef({ ha: 90, za: 90, magAz: null as number | null, roll: 0 });
  const heldRef = useRef(false);

  useEffect(() => {
    if (!state.sensorsOn) return;
    const onOrient = (ev: DeviceOrientationEvent) => {
      const sample = readingFromEvent(ev);
      const ha = sample.magAz ?? live.current.ha;
      live.current = { ha, za: sample.za, magAz: sample.magAz, roll: sample.roll };
      if (heldRef.current) return;
      setState((s) => ({
        ...s,
        ha,
        za: sample.za,
        magAz: sample.magAz,
        roll: sample.roll,
        source: "sensors",
        compassAccuracy: sample.compassAccuracy,
      }));
    };
    window.addEventListener("deviceorientation", onOrient, true);
    return () => window.removeEventListener("deviceorientation", onOrient, true);
  }, [state.sensorsOn]);

  const enableSensors = useCallback(async () => {
    const ok = await requestOrientationPermission();
    setState((s) => ({
      ...s,
      permission: ok ? "granted" : "denied",
      sensorsOn: ok,
      source: ok ? "sensors" : "manual",
    }));
    return ok;
  }, []);

  const addDelta = useCallback((dHa: number, dZa: number) => {
    setState((s) => {
      if (s.held) return s;
      const ha = normalizeDeg(s.ha + dHa);
      const za = clampZenith(s.za + dZa);
      live.current.ha = ha;
      live.current.za = za;
      return { ...s, ha, za, source: "manual" as const, sensorsOn: false };
    });
  }, []);

  const setManual = useCallback((patch: { ha?: number; za?: number }) => {
    setState((s) => {
      const ha = patch.ha != null ? normalizeDeg(patch.ha) : s.ha;
      const za = patch.za != null ? clampZenith(patch.za) : s.za;
      live.current.ha = ha;
      live.current.za = za;
      return { ...s, ha, za, source: "manual" as const, sensorsOn: false };
    });
  }, []);

  const nudge = useCallback((axis: "ha" | "za", delta: number) => {
    setState((s) => {
      if (axis === "ha") {
        const ha = normalizeDeg(s.ha + delta);
        live.current.ha = ha;
        return { ...s, ha, source: "manual" };
      }
      const za = clampZenith(s.za + delta);
      live.current.za = za;
      return { ...s, za, source: "manual" };
    });
  }, []);

  const hold = useCallback((on?: boolean) => {
    setState((s) => {
      const next = on ?? !s.held;
      heldRef.current = next;
      return {
        ...s,
        held: next,
        holdHa: next ? s.ha : null,
        holdZa: next ? s.za : null,
      };
    });
  }, []);

  const reading = (): { ha: number; za: number; magAz: number | null; roll: number } => {
    if (state.held && state.holdHa != null && state.holdZa != null) {
      return { ha: state.holdHa, za: state.holdZa, magAz: state.magAz, roll: state.roll };
    }
    return { ha: state.ha, za: state.za, magAz: state.magAz, roll: state.roll };
  };

  return { ...state, enableSensors, setManual, addDelta, nudge, hold, reading };
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"off" | "on" | "denied">("off");

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => undefined);
      }
      setStatus("on");
      return true;
    } catch {
      setStatus("denied");
      return false;
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("off");
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { videoRef, status, start, stop };
}

export interface GpsFix {
  lat: number;
  lon: number;
  alt: number | null;
  accuracy: number;
  heading: number | null;
  stamp: number;
}

export function useGps() {
  const [fix, setFix] = useState<GpsFix | null>(null);
  const [status, setStatus] = useState<"off" | "on" | "denied">("off");
  const watchRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("denied");
      return;
    }
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setFix({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          alt: pos.coords.altitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          stamp: pos.timestamp,
        });
        setStatus("on");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
    );
  }, []);

  const stop = useCallback(() => {
    if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
    watchRef.current = null;
    setStatus("off");
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { fix, status, start, stop };
}
