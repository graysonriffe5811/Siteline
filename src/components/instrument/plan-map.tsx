import { useEffect, useMemo, useRef, useState } from "react";
import { formatDms, toBearing } from "@/lib/survey/angles";
import { extents, findPoint, inverse } from "@/lib/survey/coords";
import type { Job, Point } from "@/lib/survey/types";
import { formatCoord, UNIT_LABEL } from "@/lib/survey/units";

interface View {
  scale: number;
  e0: number;
  n0: number;
}

interface Props {
  job: Job;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  preview?: { n: number; e: number; label?: string } | null;
}

const LOT_ORDER = ["205", "201", "202", "204"];

export function PlanMap({ job, selectedId, onSelect, preview }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState<View | null>(null);
  const [pair, setPair] = useState<[string, string] | null>(null);
  const drag = useRef<{ x: number; y: number; e0: number; n0: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; scale: number; eAt: number; nAt: number } | null>(null);

  const stationPt = job.station ? findPoint(job.points, job.station.pointId) : undefined;
  const selected = findPoint(job.points, selectedId);
  const bsPt = job.station?.backsightId ? findPoint(job.points, job.station.backsightId) : undefined;

  const invSel = useMemo(() => {
    if (!stationPt || !selected || selected.id === stationPt.id) return null;
    return inverse(stationPt, selected);
  }, [stationPt, selected]);

  const pairInv = useMemo(() => {
    if (!pair) return null;
    const a = findPoint(job.points, pair[0]);
    const b = findPoint(job.points, pair[1]);
    if (!a || !b) return null;
    return { a, b, inv: inverse(a, b) };
  }, [pair, job.points]);

  function fit() {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const box = extents(job.points);
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (!box || w < 8 || h < 8) {
      setView({ scale: 1, e0: 5000, n0: 10000 });
      return;
    }
    const pad = 56;
    const spanE = Math.max(20, box.maxE - box.minE);
    const spanN = Math.max(20, box.maxN - box.minN);
    const scale = Math.min((w - pad * 2) / spanE, (h - pad * 2) / spanN);
    const cx = (box.minE + box.maxE) / 2;
    const cy = (box.minN + box.maxN) / 2;
    setView({
      scale,
      e0: cx - w / 2 / scale,
      n0: cy + h / 2 / scale,
    });
  }

  function zoomAt(factor: number) {
    if (!view) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    const newScale = Math.max(0.002, Math.min(400, view.scale * factor));
    const eAt = view.e0 + w / 2 / view.scale;
    const nAt = view.n0 - h / 2 / view.scale;
    setView({
      scale: newScale,
      e0: eAt - w / 2 / newScale,
      n0: nAt + h / 2 / newScale,
    });
  }

  useEffect(() => {
    fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.id]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !view || !selected) return;
    const x = (selected.e - view.e0) * view.scale;
    const y = (view.n0 - selected.n) * view.scale;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    const m = 48;
    if (x >= m && y >= m && x <= w - m && y <= h - m) return;
    setView({
      ...view,
      e0: selected.e - w / 2 / view.scale,
      n0: selected.n + h / 2 / view.scale,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !view) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const paint = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#f4f5f2";
      ctx.fillRect(0, 0, w, h);

      const toX = (e: number) => (e - view.e0) * view.scale;
      const toY = (n: number) => (view.n0 - n) * view.scale;

      drawGrid(ctx, w, h, view, job.units === "m" ? 10 : 50);

      if (stationPt && bsPt) {
        ctx.strokeStyle = "#c45c1a";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([7, 4]);
        ctx.beginPath();
        ctx.moveTo(toX(stationPt.e), toY(stationPt.n));
        ctx.lineTo(toX(bsPt.e), toY(bsPt.n));
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (stationPt) {
        ctx.strokeStyle = "rgba(80,90,88,0.28)";
        ctx.lineWidth = 1;
        for (const p of job.points) {
          if (!p.obs) continue;
          ctx.beginPath();
          ctx.moveTo(toX(stationPt.e), toY(stationPt.n));
          ctx.lineTo(toX(p.e), toY(p.n));
          ctx.stroke();
        }
      }

      const byName = new Map(job.points.map((p) => [p.name, p]));
      const lot = LOT_ORDER.map((n) => byName.get(n)).filter(Boolean) as Point[];
      if (lot.length >= 3) {
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        lot.forEach((p, i) => {
          const x = toX(p.e);
          const y = toY(p.n);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();
      }

      drawBuilding(ctx, toX, toY, stationPt);

      if (pairInv) {
        ctx.strokeStyle = "#1565c0";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(toX(pairInv.a.e), toY(pairInv.a.n));
        ctx.lineTo(toX(pairInv.b.e), toY(pairInv.b.n));
        ctx.stroke();
      }

      for (const p of job.points) {
        const x = toX(p.e);
        const y = toY(p.n);
        const isSta = stationPt?.id === p.id;
        const isSel = selectedId === p.id;
        const isBs = bsPt?.id === p.id;
        drawSymbol(ctx, x, y, p, isSta, isBs, isSel);
        ctx.font = "600 11px 'Barlow', sans-serif";
        ctx.fillStyle = "#111";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(p.name, x + 8, y - 3);
        ctx.font = "400 9px 'Barlow', sans-serif";
        ctx.fillStyle = "#4a4a4a";
        ctx.fillText(p.code, x + 8, y + 10);
      }

      if (preview && stationPt) {
        const px = toX(preview.e);
        const py = toY(preview.n);
        ctx.strokeStyle = "#c45c1a";
        ctx.setLineDash([4, 3]);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(toX(stationPt.e), toY(stationPt.n));
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#ff8a00";
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(px, py - 8);
        ctx.lineTo(px + 8, py);
        ctx.lineTo(px, py + 8);
        ctx.lineTo(px - 8, py);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.font = "600 11px 'Barlow', sans-serif";
        ctx.fillStyle = "#c45c1a";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(preview.label || "SHOT", px + 10, py - 4);
      }

      drawNorth(ctx, w - 28, 36);
      drawScale(ctx, w, h, view, job.units);
    };

    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [view, job, selectedId, stationPt, bsPt, pairInv, preview]);

  function hit(clientX: number, clientY: number): Point | null {
    const wrap = wrapRef.current;
    if (!wrap || !view) return null;
    const r = wrap.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;
    let best: Point | null = null;
    let bestD = 18;
    for (const p of job.points) {
      const px = (p.e - view.e0) * view.scale;
      const py = (view.n0 - p.n) * view.scale;
      const d = Math.hypot(px - x, py - y);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best;
  }

  const u = UNIT_LABEL[job.units];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#ececec] text-[#1a1a1a]">
      <div className="flex items-center gap-2 border-b border-[#c8c8c8] bg-[#e8eaed] px-2 py-1.5 text-[11px]">
        <span className="font-semibold tracking-wide text-[#333]">MAP</span>
        <span className="text-[#666]">Drag to pan · pinch to zoom</span>
        <span className="ml-auto font-mono text-[#333]">
          {job.station && stationPt ? `Occ ${stationPt.name}  HI ${job.station.hi.toFixed(2)}  HT ${job.station.ht.toFixed(2)}` : "No station"}
        </span>
      </div>
      <div
        ref={wrapRef}
        className="relative min-h-0 flex-1 touch-none overflow-hidden bg-[#f4f5f2]"
        onPointerDown={(e) => {
          if (!view) return;
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
          if (pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()];
            const wrap = wrapRef.current;
            if (!wrap) return;
            const r = wrap.getBoundingClientRect();
            const mx = (a.x + b.x) / 2 - r.left;
            const my = (a.y + b.y) / 2 - r.top;
            pinch.current = {
              dist: Math.hypot(b.x - a.x, b.y - a.y),
              scale: view.scale,
              eAt: view.e0 + mx / view.scale,
              nAt: view.n0 - my / view.scale,
            };
            drag.current = null;
          } else {
            drag.current = { x: e.clientX, y: e.clientY, e0: view.e0, n0: view.n0 };
          }
        }}
        onPointerMove={(e) => {
          if (!view) return;
          if (pointers.current.has(e.pointerId)) {
            pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          }
          if (pointers.current.size >= 2 && pinch.current) {
            const pts = [...pointers.current.values()];
            const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
            if (pinch.current.dist < 8) return;
            const wrap = wrapRef.current;
            if (!wrap) return;
            const r = wrap.getBoundingClientRect();
            const mx = (pts[0].x + pts[1].x) / 2 - r.left;
            const my = (pts[0].y + pts[1].y) / 2 - r.top;
            const newScale = Math.max(0.002, Math.min(400, pinch.current.scale * (dist / pinch.current.dist)));
            setView({
              scale: newScale,
              e0: pinch.current.eAt - mx / newScale,
              n0: pinch.current.nAt + my / newScale,
            });
            return;
          }
          if (!drag.current) return;
          const dx = e.clientX - drag.current.x;
          const dy = e.clientY - drag.current.y;
          setView({
            ...view,
            e0: drag.current.e0 - dx / view.scale,
            n0: drag.current.n0 + dy / view.scale,
          });
        }}
        onPointerUp={(e) => {
          pointers.current.delete(e.pointerId);
          if (pointers.current.size < 2) pinch.current = null;
          const start = drag.current;
          drag.current = null;
          if (!start || pointers.current.size > 0) return;
          if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) return;
          const p = hit(e.clientX, e.clientY);
          if (p) {
            if (selectedId && selectedId !== p.id && e.shiftKey) {
              setPair([selectedId, p.id]);
            } else {
              onSelect(p.id);
            }
          } else {
            onSelect(null);
            setPair(null);
          }
        }}
        onPointerCancel={(e) => {
          pointers.current.delete(e.pointerId);
          pinch.current = null;
          drag.current = null;
        }}
        onWheel={(e) => {
          if (!view) return;
          e.preventDefault();
          const wrap = wrapRef.current;
          if (!wrap) return;
          const r = wrap.getBoundingClientRect();
          const mx = e.clientX - r.left;
          const my = e.clientY - r.top;
          const factor = e.deltaY > 0 ? 0.9 : 1.1;
          const newScale = Math.max(0.002, Math.min(400, view.scale * factor));
          const eAt = view.e0 + mx / view.scale;
          const nAt = view.n0 - my / view.scale;
          setView({
            scale: newScale,
            e0: eAt - mx / newScale,
            n0: nAt + my / newScale,
          });
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
        <div className="absolute top-2 left-2 flex flex-col overflow-hidden rounded-sm border border-[#c0c0c0] bg-white shadow-sm">
          <ToolBtn label="+" onClick={() => zoomAt(1.25)} />
          <ToolBtn label="−" onClick={() => zoomAt(0.8)} />
          <ToolBtn label="Fit" onClick={fit} />
        </div>
      </div>
      <div className="border-t border-[#c8c8c8] bg-white px-3 py-1.5 font-mono text-[11px] text-[#333] tabular-nums">
        {pairInv ? (
          <p>
            Inverse {pairInv.a.name}→{pairInv.b.name}: HD {pairInv.inv.hd.toFixed(3)} {u} · AZ {formatDms(pairInv.inv.az, 0)}{" "}
            {toBearing(pairInv.inv.az)} · ΔZ {pairInv.inv.dZ.toFixed(3)}
          </p>
        ) : invSel && selected ? (
          <p>
            {stationPt?.name}→{selected.name}: HD {invSel.hd.toFixed(3)} {u} · AZ {formatDms(invSel.az, 0)} {toBearing(invSel.az)} · N{" "}
            {formatCoord(selected.n, job.units)} E {formatCoord(selected.e, job.units)}
          </p>
        ) : selected ? (
          <p>
            {selected.name} · N {formatCoord(selected.n, job.units)} · E {formatCoord(selected.e, job.units)} · Z{" "}
            {formatCoord(selected.z, job.units)} · {selected.code}
          </p>
        ) : (
          <p>Drag to pan · pinch (or +/−) to zoom · Fit shows the whole lot · tap a point for inverse</p>
        )}
      </div>
      <div className="grid grid-cols-4 bg-[#2c2f36] text-center text-[11px] font-medium tracking-wide text-white">
        <button type="button" className="py-2.5 hover:bg-[#3a3e46]" onClick={() => onSelect(null)}>
          Esc
        </button>
        <button type="button" className="py-2.5 hover:bg-[#3a3e46]" onClick={() => zoomAt(1.25)}>
          Zoom+
        </button>
        <button type="button" className="py-2.5 hover:bg-[#3a3e46]" onClick={() => zoomAt(0.8)}>
          Zoom−
        </button>
        <button type="button" className="bg-[#1565c0] py-2.5 font-semibold" onClick={fit}>
          Fit
        </button>
      </div>
    </div>
  );
}

function ToolBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-8 w-10 border-b border-[#e0e0e0] text-xs font-semibold text-[#222] last:border-b-0 hover:bg-[#fff8d0]"
    >
      {label}
    </button>
  );
}

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, view: View, step: number) {
  const startE = Math.floor(view.e0 / step) * step;
  const startN = Math.floor((view.n0 - h / view.scale) / step) * step;
  const endE = view.e0 + w / view.scale;
  const endN = view.n0;
  const major = step * 4;
  for (let e = startE; e <= endE; e += step) {
    const x = (e - view.e0) * view.scale;
    ctx.strokeStyle = Math.abs(e % major) < 0.001 ? "#d0d2cc" : "#e6e7e2";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let n = startN; n <= endN; n += step) {
    const y = (view.n0 - n) * view.scale;
    ctx.strokeStyle = Math.abs(n % major) < 0.001 ? "#d0d2cc" : "#e6e7e2";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  toX: (e: number) => number,
  toY: (n: number) => number,
  stationPt?: Point,
) {
  if (!stationPt) return;
  const cn = stationPt.n - 145;
  const ce = stationPt.e + 200;
  const hw = 21;
  const hd = 14;
  const corners: Array<[number, number]> = [
    [cn + hd, ce - hw],
    [cn + hd, ce + hw],
    [cn - hd, ce + hw],
    [cn - hd, ce - hw],
  ];
  ctx.fillStyle = "rgba(200,198,188,0.55)";
  ctx.strokeStyle = "#5a5854";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  corners.forEach(([n, e], i) => {
    const x = toX(e);
    const y = toY(n);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawSymbol(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  p: Point,
  isSta: boolean,
  isBs: boolean,
  isSel: boolean,
) {
  if (isSta) {
    ctx.strokeStyle = "#1a1a1a";
    ctx.fillStyle = "#ffcd00";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 11, y);
    ctx.lineTo(x + 11, y);
    ctx.moveTo(x, y - 11);
    ctx.lineTo(x, y + 11);
    ctx.stroke();
    return;
  }
  if (p.kind === "control" || isBs) {
    ctx.fillStyle = isBs ? "#c45c1a" : "#111";
    ctx.beginPath();
    ctx.moveTo(x, y - 7);
    ctx.lineTo(x + 6.5, y + 5);
    ctx.lineTo(x - 6.5, y + 5);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.strokeStyle = "#111";
    ctx.fillStyle = "#fff";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 3, y);
    ctx.lineTo(x + 3, y);
    ctx.moveTo(x, y - 3);
    ctx.lineTo(x, y + 3);
    ctx.stroke();
  }
  if (isSel) {
    ctx.strokeStyle = "#1565c0";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 11, y - 11, 22, 22);
  }
}

function drawNorth(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.moveTo(x, y - 16);
  ctx.lineTo(x + 6, y + 8);
  ctx.lineTo(x, y + 3);
  ctx.lineTo(x - 6, y + 8);
  ctx.closePath();
  ctx.fill();
  ctx.font = "700 11px 'Barlow', sans-serif";
  ctx.fillStyle = "#111";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("N", x, y + 10);
}

function drawScale(ctx: CanvasRenderingContext2D, w: number, h: number, view: View, units: Job["units"]) {
  const target = 80;
  const raw = target / view.scale;
  const nice = niceLength(raw);
  const px = nice * view.scale;
  const x = w - px - 18;
  const y = h - 18;
  ctx.strokeStyle = "#111";
  ctx.fillStyle = "#111";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + px, y);
  ctx.moveTo(x, y - 4);
  ctx.lineTo(x, y + 4);
  ctx.moveTo(x + px, y - 4);
  ctx.lineTo(x + px, y + 4);
  ctx.stroke();
  ctx.font = "500 10px 'Barlow', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(`${nice} ${UNIT_LABEL[units]}`, x + px / 2, y - 4);
}

function niceLength(raw: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  const nice = n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10;
  return nice * pow;
}
