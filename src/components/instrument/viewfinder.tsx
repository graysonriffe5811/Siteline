import { type RefObject, useEffect, useRef, useState } from "react";
import { clampHfov, magLabel, STADIA_HALF_DEG } from "@/lib/survey/optics";
import { SiteScene, type LaserHit } from "@/lib/survey/site-scene";
import type { Job, Point } from "@/lib/survey/types";
import { UNIT_LABEL } from "@/lib/survey/units";

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>;
  cameraOn: boolean;
  ha: number;
  za: number;
  az: number;
  roll: number;
  held: boolean;
  job: Job;
  stationPt: Point | null;
  hi: number;
  hfov: number;
  onHfov: (h: number) => void;
  onAim: (dHa: number, dZa: number) => void;
  onRange: (hit: LaserHit | null) => void;
  fireNonce?: number;
  firing?: boolean;
  preview?: { n: number; e: number } | null;
}

export function Viewfinder({
  videoRef,
  cameraOn,
  ha,
  za,
  az,
  roll,
  held,
  job,
  stationPt,
  hi,
  hfov,
  onHfov,
  onAim,
  onRange,
  fireNonce = 0,
  firing = false,
  preview = null,
}: Props) {
  const hudRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [hit, setHit] = useState<LaserHit | null>(null);

  const view = useRef({
    az,
    za,
    roll,
    n: 0,
    e: 0,
    z: 0,
    hi,
    hfov,
    points: job.points,
    occ: stationPt?.id ?? null,
  });
  view.current = {
    az,
    za,
    roll,
    n: stationPt?.n ?? 10000,
    e: stationPt?.e ?? 5000,
    z: stationPt?.z ?? 850,
    hi,
    hfov,
    points: job.points,
    occ: stationPt?.id ?? null,
  };
  const onRangeRef = useRef(onRange);
  onRangeRef.current = onRange;
  const onHfovRef = useRef(onHfov);
  onHfovRef.current = onHfov;
  const onAimRef = useRef(onAim);
  onAimRef.current = onAim;
  const siteRef = useRef<SiteScene | null>(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (cameraOn) return;
    const canvas = worldRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const origin = { n: view.current.n, e: view.current.e };
    const site = new SiteScene(canvas, origin, view.current.z);
    siteRef.current = site;
    let lastKey = "";
    let raf = 0;
    let last = performance.now();

    const resize = () => {
      site.resize(wrap.clientWidth, wrap.clientHeight);
      site.setHfov(view.current.hfov, wrap.clientWidth / Math.max(wrap.clientHeight, 1));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const v = view.current;
      const aspect = wrap.clientWidth / Math.max(wrap.clientHeight, 1);
      site.setHfov(v.hfov, aspect);
      site.setView(v.az, v.za, v.roll, v.n, v.e, v.z + v.hi);
      site.syncPoints(v.points, v.occ);
      site.tick(dt);
      const ranged = site.range();
      if (!dragging.current) {
        const pull = site.nearest(v.az, v.za, Math.min(0.85, v.hfov * 0.08));
        if (pull && Math.hypot(pull.dAz, pull.dZa) > 0.03) {
          onAimRef.current(pull.dAz * Math.min(0.08, dt * 2.2), pull.dZa * Math.min(0.08, dt * 2.2));
        }
      }
      const key = ranged ? `${ranged.label}:${ranged.kind}:${ranged.sd.toFixed(2)}` : "";
      if (key !== lastKey) {
        lastKey = key;
        setHit(ranged);
        onRangeRef.current(ranged);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      siteRef.current = null;
      site.dispose();
    };
  }, [cameraOn, stationPt?.id, job.id]);

  useEffect(() => {
    if (!fireNonce) return;
    siteRef.current?.fire();
  }, [fireNonce]);

  useEffect(() => {
    const canvas = hudRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (w < 2 || h < 2) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      drawHud(ctx, w, h, {
        ha,
        za,
        az,
        roll,
        held,
        units: UNIT_LABEL[job.units],
        hit,
        hfov,
        firing,
        points: job.points,
        station: stationPt,
        preview,
      });
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [ha, za, az, roll, held, job.units, hit, hfov, firing, job.points, stationPt, preview]);

  const ptr = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      ref={wrapRef}
      className="relative min-h-64 flex-1 touch-none overflow-hidden bg-bg select-none"
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        e.preventDefault();
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        ptr.current = { x: e.clientX, y: e.clientY };
        dragging.current = true;
      }}
      onPointerMove={(e) => {
        if (!ptr.current) return;
        const wrap = wrapRef.current;
        if (!wrap) return;
        const degPerPx = hfov / Math.max(wrap.clientWidth, 1);
        const dx = e.clientX - ptr.current.x;
        const dy = e.clientY - ptr.current.y;
        ptr.current = { x: e.clientX, y: e.clientY };
        onAim(dx * degPerPx, dy * degPerPx);
      }}
      onPointerUp={() => {
        ptr.current = null;
        dragging.current = false;
      }}
      onPointerCancel={() => {
        ptr.current = null;
        dragging.current = false;
      }}
      onWheel={(e) => {
        e.preventDefault();
        const next = clampHfov(hfov * (e.deltaY > 0 ? 1.12 : 0.89));
        onHfovRef.current(next);
      }}
    >
      <video
        ref={videoRef}
        className={cameraOn ? "pointer-events-none absolute inset-0 size-full object-cover opacity-100" : "pointer-events-none absolute inset-0 size-full object-cover opacity-0"}
        playsInline
        muted
        autoPlay
      />
      <canvas ref={worldRef} className={cameraOn ? "hidden" : "pointer-events-none absolute inset-0 size-full"} />
      <canvas ref={hudRef} className="pointer-events-none absolute inset-0 size-full" />
    </div>
  );
}

function wrapDelta(a: number, b: number): number {
  let d = a - b;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

function drawHud(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  args: {
    ha: number;
    za: number;
    az: number;
    roll: number;
    held: boolean;
    units: string;
    hit: LaserHit | null;
    hfov: number;
    firing: boolean;
    points: Point[];
    station: Point | null;
    preview: { n: number; e: number } | null;
  },
) {
  const { az, roll, held, units, hit, hfov, firing, points, station, preview } = args;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.48;

  ctx.fillStyle = "rgba(6, 8, 7, 0.92)";
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
  ctx.clip();
  const tapeH = 30;
  ctx.fillStyle = "rgba(11,13,12,0.55)";
  ctx.fillRect(0, 0, w, tapeH + 2);
  ctx.font = "500 11px 'IBM Plex Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const px = w / hfov;
  for (let deg = Math.floor(az - hfov / 2 - 2); deg <= az + hfov / 2 + 2; deg++) {
    const d = ((deg % 360) + 360) % 360;
    const x = cx + wrapDelta(d, az) * px;
    const major = d % 10 === 0;
    ctx.strokeStyle = major ? "rgba(183,224,196,0.7)" : "rgba(183,224,196,0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 4);
    ctx.lineTo(x, major ? 15 : 10);
    ctx.stroke();
    if (d % 30 === 0) {
      const label = d === 0 ? "N" : d === 90 ? "E" : d === 180 ? "S" : d === 270 ? "W" : String(d);
      ctx.fillStyle = "#b7e0c4";
      ctx.fillText(label, x, 16);
    }
  }
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const vg = ctx.createRadialGradient(cx, cy, r * 0.38, cx, cy, r);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(0.7, "rgba(10,14,12,0.06)");
  vg.addColorStop(1, "rgba(4,6,5,0.55)");
  ctx.fillStyle = vg;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();

  ctx.strokeStyle = "rgba(183,224,196,0.22)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(11,13,12,0.92)";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 7, 0, Math.PI * 2);
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(cx, cy);
  ctx.rotate((-roll * Math.PI) / 180);

  const pxPerDeg = (r * 2) / hfov;
  const stadia = STADIA_HALF_DEG * pxPerDeg;
  const arm = r * 0.72;
  const gap = 7;

  ctx.strokeStyle = "rgba(12,14,13,0.92)";
  ctx.lineWidth = 1.35;
  ctx.beginPath();
  ctx.moveTo(-arm, 0);
  ctx.lineTo(-gap, 0);
  ctx.moveTo(gap, 0);
  ctx.lineTo(arm, 0);
  ctx.moveTo(0, -arm);
  ctx.lineTo(0, -gap);
  ctx.moveTo(0, gap);
  ctx.lineTo(0, arm);
  ctx.stroke();

  ctx.strokeStyle = "rgba(183,224,196,0.35)";
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(-arm, 0);
  ctx.lineTo(-gap, 0);
  ctx.moveTo(gap, 0);
  ctx.lineTo(arm, 0);
  ctx.moveTo(0, -arm);
  ctx.lineTo(0, -gap);
  ctx.moveTo(0, gap);
  ctx.lineTo(0, arm);
  ctx.stroke();

  const tick = 9;
  ctx.strokeStyle = "rgba(12,14,13,0.9)";
  ctx.lineWidth = 1.2;
  for (const s of [-stadia, stadia]) {
    ctx.beginPath();
    ctx.moveTo(-tick, s);
    ctx.lineTo(tick, s);
    ctx.stroke();
  }

  ctx.fillStyle = hit?.kind === "prism" ? "rgba(208,90,70,0.95)" : "#b7e0c4";
  ctx.beginPath();
  ctx.arc(0, 0, hit?.kind === "prism" ? 2.2 : 1.2, 0, Math.PI * 2);
  ctx.fill();
  if (hit?.kind === "prism") {
    ctx.fillStyle = "rgba(208,90,70,0.22)";
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const vialW = 64;
  const vialX = cx + r - 16;
  const vialY = cy;
  const rollPx = Math.max(-22, Math.min(22, roll * 1.8));
  ctx.strokeStyle = "rgba(183,224,196,0.4)";
  ctx.lineWidth = 1;
  ctx.strokeRect(vialX - 5, vialY - vialW / 2, 10, vialW);
  ctx.beginPath();
  ctx.moveTo(vialX - 7, vialY);
  ctx.lineTo(vialX + 7, vialY);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(vialX, vialY + rollPx, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = Math.abs(roll) > 4 ? "#d07a6a" : "#7dba8c";
  ctx.fill();

  ctx.textAlign = "center";
  ctx.font = "600 11px 'IBM Plex Mono', monospace";
  ctx.fillStyle = held ? "#c4b07a" : "rgba(183,224,196,0.85)";
  ctx.fillText(held ? "HOLD" : magLabel(hfov), cx, cy - r + 20);

  ctx.textAlign = "left";
  ctx.font = "500 10px 'IBM Plex Mono', monospace";
  ctx.fillStyle = "#8b948c";
  ctx.fillText(units, 12, 50);

  if (hit) {
    ctx.textAlign = "center";
    ctx.font = "500 12px 'IBM Plex Mono', monospace";
    ctx.fillStyle = hit.kind === "prism" ? "#b7e0c4" : "#c4b07a";
    const mode = hit.kind === "prism" ? "IR" : hit.kind === "ground" ? "RL" : "IR";
    ctx.fillText(`${mode}  ${hit.label}  ${hit.sd.toFixed(3)} ${units}`, cx, cy + r - 26);
    if (hit.kind === "prism") {
      ctx.font = "700 11px 'Barlow', sans-serif";
      ctx.fillStyle = "#7dba8c";
      ctx.fillText("LOCK", cx, cy + r - 12);
    }
  }

  if (hit && hit.kind !== "ground") {
    const s = 18;
    ctx.strokeStyle = hit.kind === "prism" ? "#ff4d3a" : "#ffcd00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - s, cy - s + 8);
    ctx.lineTo(cx - s, cy - s);
    ctx.lineTo(cx - s + 8, cy - s);
    ctx.moveTo(cx + s - 8, cy - s);
    ctx.lineTo(cx + s, cy - s);
    ctx.lineTo(cx + s, cy - s + 8);
    ctx.moveTo(cx + s, cy + s - 8);
    ctx.lineTo(cx + s, cy + s);
    ctx.lineTo(cx + s - 8, cy + s);
    ctx.moveTo(cx - s + 8, cy + s);
    ctx.lineTo(cx - s, cy + s);
    ctx.lineTo(cx - s, cy + s - 8);
    ctx.stroke();
  }

  if (firing) {
    ctx.strokeStyle = "rgba(183,224,196,0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawMinimap(ctx, w - 96, 38, 78, points, station, az, preview);
}

function drawMinimap(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  points: Point[],
  station: Point | null,
  az: number,
  preview: { n: number; e: number } | null,
) {
  const r = size / 2;
  const cx = x + r;
  const cy = y + r;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(12,16,14,0.72)";
  ctx.fill();
  ctx.strokeStyle = "rgba(183,224,196,0.45)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.clip();
  const span = 420;
  const sc = size / span;
  const n0 = station?.n ?? 10000;
  const e0 = station?.e ?? 5000;
  const toX = (e: number) => cx + (e - e0) * sc;
  const toY = (n: number) => cy - (n - n0) * sc;
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx, cy + r);
  ctx.stroke();
  for (const p of points) {
    ctx.fillStyle = p.kind === "control" ? "#ffcd00" : "#e8ece8";
    ctx.beginPath();
    ctx.arc(toX(p.e), toY(p.n), p.kind === "control" ? 2.4 : 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  if (preview) {
    ctx.fillStyle = "#ff8a00";
    ctx.beginPath();
    ctx.arc(toX(preview.e), toY(preview.n), 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#7dba8c";
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();
  const rad = ((az - 90) * Math.PI) / 180;
  ctx.strokeStyle = "#b7e0c4";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(rad) * (r - 6), cy + Math.sin(rad) * (r - 6));
  ctx.stroke();
  ctx.restore();
  ctx.font = "600 9px 'Barlow', sans-serif";
  ctx.fillStyle = "#b7e0c4";
  ctx.textAlign = "center";
  ctx.fillText("N", cx, y - 2);
}

