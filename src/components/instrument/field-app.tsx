import { useEffect, useMemo, useRef, useState, type MutableRefObject, type PointerEvent } from "react";
import { Aperture, Compass, Crosshair, List, Map as MapIcon, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCamera, useGps, useInstrument } from "@/hooks/use-instrument";
import { formatDms, toBearing } from "@/lib/survey/angles";
import { FINDER_HFOV, SCOPE_HFOV } from "@/lib/survey/optics";
import { depressionHd, findPoint, liveAzimuth, radiation } from "@/lib/survey/coords";
import type { LaserHit } from "@/lib/survey/site-scene";
import { useJob, useSurvey } from "@/lib/survey/store";
import type { DistMethod, TabId } from "@/lib/survey/types";
import { FIELD_CODES } from "@/lib/survey/types";
import { formatCoord, formatDist, UNIT_LABEL } from "@/lib/survey/units";
import { cn } from "@/lib/utils";
import { Gm50Panel } from "./gm50-panel";
import { JobsSheet } from "./jobs-sheet";
import { NumPad } from "./num-pad";
import { PlanMap } from "./plan-map";
import { PointsPanel } from "./points-panel";
import { StationPanel } from "./station-panel";
import { Viewfinder } from "./viewfinder";

const TABS: { id: TabId; label: string; icon: typeof Crosshair }[] = [
  { id: "sight", label: "Meas", icon: Crosshair },
  { id: "station", label: "Station", icon: Compass },
  { id: "map", label: "Map", icon: MapIcon },
  { id: "points", label: "Points", icon: List },
];

export function FieldApp() {
  const hydrated = useSurvey((s) => s.hydrated);
  const job = useJob();
  const storeShot = useSurvey((s) => s.storeShot);
  const occupy = useSurvey((s) => s.occupy);
  const inst = useInstrument();
  const cam = useCamera();
  const gps = useGps();
  const [tab, setTab] = useState<TabId>("sight");
  const [jobsOpen, setJobsOpen] = useState(false);
  const [mode, setMode] = useState<DistMethod>("edm");
  const [distStr, setDistStr] = useState("");
  const [code, setCode] = useState("TP");
  const [desc, setDesc] = useState("");
  const [ptName, setPtName] = useState("");
  const [padOpen, setPadOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [laser, setLaser] = useState<LaserHit | null>(null);
  const [hfov, setHfov] = useState(FINDER_HFOV);
  const [distMode, setDistMode] = useState<"sd" | "hd">("sd");
  const [measuring, setMeasuring] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [firing, setFiring] = useState(false);
  const [fireNonce, setFireNonce] = useState(0);
  const [floatText, setFloatText] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const nudgeRef = useRef(inst.addDelta);
  nudgeRef.current = (dHa, dZa) => inst.addDelta(dHa, dZa);

  useEffect(() => {
    if (job) setPtName(job.nextName);
  }, [job?.id, job?.nextName]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("sightline-help") !== "1") setHelpOpen(true);
    } catch {
      setHelpOpen(true);
    }
  }, []);

  const stationPt = job?.station ? findPoint(job.points, job.station.pointId) : undefined;
  const reading = inst.reading();
  const az = job ? liveAzimuth(job.station, reading.ha, reading.magAz, job.declination) : reading.ha;
  const preview = useMemo(() => {
    if (!job?.station || !stationPt) return null;
    let dist = Number(distStr);
    let distIsHd = mode === "hd" || mode === "ground";
    if (mode === "ground") {
      const hd = depressionHd(job.station.hi, reading.za);
      if (hd == null) return null;
      dist = hd;
      distIsHd = true;
    }
    if (!(dist > 0) && mode !== "ground") return null;
    return radiation({
      station: stationPt,
      hi: job.station.hi,
      ht: laser?.kind === "prism" || laser?.kind === "pole" ? job.station.ht : 0,
      az,
      za: reading.za,
      distance: dist,
      distIsHd,
    });
  }, [job, stationPt, distStr, mode, az, reading.za, laser?.kind]);

  if (!hydrated) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg text-fg">
        <ReticleMark className="size-16 text-readout" />
        <p className="text-xs tracking-[0.28em] text-muted uppercase">Sightline</p>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-dvh bg-bg text-fg">
        <JobsSheet onClose={() => undefined} />
      </main>
    );
  }

  const active = job;
  const u = UNIT_LABEL[active.units];
  const plateOff = Math.abs(inst.roll) > 6;

  function flash(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(null), 2200);
  }

  function store() {
    if (mode === "gps" && gps.status !== "on") gps.start();
    const dist = Number(distStr) > 0 ? Number(distStr) : laser?.sd ?? 0;
    if (!(dist > 0) && mode !== "ground" && mode !== "gps") {
      flash("Aim at something in the scope first — wait for LOCK");
      return;
    }
    const prism = laser?.kind === "prism" || laser?.kind === "pole";
    const res = storeShot({
      name: ptName.trim() || active.nextName,
      code: laser?.code || code,
      desc: laser?.label || desc,
      ha: reading.ha,
      za: reading.za,
      magAz: reading.magAz,
      distance: dist,
      mode,
      ht: prism ? active.station?.ht : 0,
      gps:
        mode === "gps" && gps.fix
          ? { lat: gps.fix.lat, lon: gps.fix.lon, accuracy: gps.fix.accuracy, alt: gps.fix.alt }
          : undefined,
    });
    if ("error" in res) {
      if (res.error.includes("distance")) setPadOpen(true);
      flash(res.error);
      return;
    }
    flash(`Meas ${res.name}  ${res.desc || res.code}  SD ${dist.toFixed(3)}`);
    setFloatText(`${res.name}  ${dist.toFixed(3)} ${u}`);
    window.setTimeout(() => setFloatText(null), 1400);
    setScore((s) => s + 1);
    setPtName(useSurvey.getState().currentJob()?.nextName ?? "");
    setDesc("");
    setSelectedId(res.id);
  }

  function fire() {
    if (firing) return;
    if (!laser) {
      flash("Nothing in the beam — point the crosshair at an object");
      return;
    }
    setFiring(true);
    setMeasuring(true);
    setFireNonce((n) => n + 1);
    window.setTimeout(() => {
      store();
      setFiring(false);
      setMeasuring(false);
    }, 220);
  }

  const pane =
    tab === "station" ? (
      <StationPanel gps={gps} />
    ) : tab === "points" ? (
      <PointsPanel selectedId={selectedId} onSelect={setSelectedId} />
    ) : (
      <PlanMap
        job={job}
        selectedId={selectedId}
        onSelect={setSelectedId}
        preview={
          preview
            ? { n: preview.nez.n, e: preview.nez.e, label: laser?.label || ptName || "SHOT" }
            : null
        }
      />
    );

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-bg text-fg">
      <header className="flex items-center gap-2 border-b border-border bg-[#e8eaed] px-3 py-1.5 pt-[max(0.4rem,env(safe-area-inset-top))] text-[#1a1a1a]">
        <button type="button" onClick={() => setJobsOpen(true)} className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-sm bg-[#ffcd00] text-xs font-bold">☰</span>
          <span className="text-left">
            <span className="block text-[10px] font-semibold tracking-[0.14em] text-[#555] uppercase">Trimble Access · Meas</span>
            <span className="block max-w-[11rem] truncate text-sm font-semibold">{job.name}</span>
          </span>
        </button>
        <div className="ml-auto flex items-center gap-3 font-mono text-[11px] text-[#333]">
          <span>GM-50</span>
          {job.station ? (
            <span>
              HI {job.station.hi.toFixed(2)} · HT {job.station.ht.toFixed(2)}
            </span>
          ) : null}
          <span className="text-[#2e7d32]">● TS</span>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-sm border border-[#c8c8c8] bg-white text-sm font-bold text-[#333]"
            aria-label="How to use"
            onClick={() => setHelpOpen(true)}
          >
            ?
          </button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Enable compass"
            onClick={() => void inst.enableSensors()}
            className={inst.sensorsOn ? "text-[#1565c0]" : "text-[#777]"}
          >
            <Radio className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open telescope camera"
            onClick={() => (cam.status === "on" ? cam.stop() : void cam.start())}
            className={cam.status === "on" ? "text-[#1565c0]" : "text-[#777]"}
          >
            <Aperture className="size-4" />
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <section className={cn("flex min-h-0 min-w-0 flex-col", tab === "sight" ? "flex-1" : "hidden md:flex md:w-1/2 md:flex-none lg:w-5/12")}>
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="relative min-h-0 flex-1">
              <Viewfinder
                videoRef={cam.videoRef}
                cameraOn={cam.status === "on"}
                ha={reading.ha}
                za={reading.za}
                az={az}
                roll={inst.roll}
                held={inst.held}
                job={job}
                stationPt={stationPt ?? null}
                hi={job.station?.hi ?? 5.15}
                hfov={hfov}
                onHfov={setHfov}
                onAim={(dHa, dZa) => inst.addDelta(dHa, dZa)}
                fireNonce={fireNonce}
                firing={firing}
                preview={preview ? { n: preview.nez.n, e: preview.nez.e } : null}
                onRange={(hit) => {
                  setLaser(hit);
                  if (hit && (mode === "edm" || mode === "hd")) {
                    const sd = hit.sd;
                    const zaRad = (reading.za * Math.PI) / 180;
                    setDistStr((mode === "hd" ? sd * Math.sin(zaRad) : sd).toFixed(3));
                  }
                }}
              />
              <button
                type="button"
                className={
                  "absolute top-2 left-2 z-10 h-9 rounded-md border border-border bg-glass px-3 " +
                  "font-mono text-xs tracking-wide text-readout outline-none select-none " +
                  "[-webkit-tap-highlight-color:transparent]"
                }
                onClick={() => setHfov(hfov <= SCOPE_HFOV + 0.2 ? FINDER_HFOV : SCOPE_HFOV)}
              >
                {hfov <= SCOPE_HFOV + 0.2 ? "FIND" : "30×"}
              </button>
              {floatText ? (
                <p className="pointer-events-none absolute inset-x-0 top-1/3 z-20 text-center font-mono text-lg font-semibold text-[#ffcd00] drop-shadow">
                  {floatText}
                </p>
              ) : null}
              <Objectives points={job.points} />
              <LookStick nudgeRef={nudgeRef} hfov={hfov} />
              <MeasButton locked={Boolean(laser)} onMeas={fire} />
            </div>

            <Gm50Panel
              v={reading.za}
              hr={reading.ha}
              sd={distStr ? Number(distStr) : laser?.sd ?? null}
              hd={
                preview?.hd ??
                (distStr ? Number(distStr) * Math.sin((reading.za * Math.PI) / 180) : laser ? laser.sd * Math.sin((reading.za * Math.PI) / 180) : null)
              }
              distMode={distMode}
              prism={laser?.kind === "prism"}
              held={inst.held}
              measuring={measuring}
              units={job.units}
              levelOk={!plateOff}
              hit={laser}
              onMeas={fire}
              onToggleDist={() => {
                setDistMode((d) => (d === "sd" ? "hd" : "sd"));
                setMode((m) => (m === "hd" ? "edm" : m));
              }}
              onZero={() => {
                if (!job.station) {
                  flash("Occupy first");
                  return;
                }
                occupy({
                  pointId: job.station.pointId,
                  hi: job.station.hi,
                  ht: job.station.ht,
                  mode: job.station.orientationMode,
                  azAtZero: az,
                  backsightId: job.station.backsightId,
                  bsHa: 0,
                });
                inst.setManual({ ha: 0 });
                flash("0SET — HR 0°00'00\"");
              }}
              onHold={() => inst.hold()}
              onBs={() => {
                const bs = job.station?.backsightId ? findPoint(job.points, job.station.backsightId) : undefined;
                flash(bs ? `B.S. ${bs.name}` : "No backsight");
              }}
              onEnter={fire}
              enterDisabled={!job.station && mode !== "gps"}
            />

            {preview && stationPt ? (
              <p className="border-b border-border bg-surface px-3 py-1 font-mono text-[11px] text-muted">
                AZ {formatDms(az, 0)} {toBearing(az)} · ΔZ {preview.nez.z - stationPt.z >= 0 ? "+" : ""}
                {(preview.nez.z - stationPt.z).toFixed(3)} · N {formatCoord(preview.nez.n, job.units)} E {formatCoord(preview.nez.e, job.units)}
              </p>
            ) : null}

            <div className="grid grid-cols-12 gap-2 bg-surface px-3 py-2">
              <label className="col-span-4">
                <span className="sr-only">Point</span>
                <Input value={ptName} onChange={(e) => setPtName(e.target.value)} aria-label="Point number" />
              </label>
              <label className="col-span-4">
                <span className="sr-only">Code</span>
                <select
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-11 w-full rounded-md border border-border bg-bg px-2 text-sm text-fg"
                  aria-label="Feature code"
                >
                  {FIELD_CODES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <Button variant="primary" className="col-span-4" onClick={fire} disabled={!job.station && mode !== "gps"}>
                Meas
              </Button>
            </div>
          </div>
        </section>
        <aside
          className={cn(
            "min-h-0 min-w-0 flex-col bg-surface",
            tab === "sight" ? "hidden md:flex md:flex-1 md:border-l md:border-border" : "flex flex-1 md:border-l md:border-border",
          )}
        >
          {pane}
        </aside>
      </div>

      {tab === "sight" || tab === "map" ? (
        <div className="flex items-center gap-2 border-t border-border bg-raised px-3 py-2">
          <p className="min-w-0 flex-1 font-mono text-xs text-readout">
            {laser
              ? `EDM ${laser.kind === "prism" ? "IR" : "RL"}  ${laser.label}  SD ${laser.sd.toFixed(3)} ${u}`
              : "Point the gun at a pole, building, or ground — EDM ranges what you aim at"}
          </p>
          <Button variant="primary" onClick={fire} disabled={!job.station && mode !== "gps"}>
            Meas
          </Button>
        </div>
      ) : null}

      <nav className="grid grid-cols-4 border-t border-border bg-surface pb-[max(0.4rem,env(safe-area-inset-bottom))]">
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn("flex flex-col items-center gap-0.5 py-2 text-xs tracking-wide uppercase", on ? "text-readout" : "text-muted")}
            >
              <Icon className="size-5" strokeWidth={1.75} />
              {t.label}
            </button>
          );
        })}
      </nav>

      {jobsOpen ? (
        <div className="absolute inset-0 z-40 bg-bg">
          <JobsSheet onClose={() => setJobsOpen(false)} />
        </div>
      ) : null}

      {padOpen ? (
        <div className="absolute inset-0 z-30 flex items-end justify-center bg-glass p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-4 shadow-panel">
            <NumPad
              label={mode === "hd" ? `Horizontal distance (${u})` : `Slope distance (${u})`}
              value={distStr}
              onChange={setDistStr}
              onCommit={(n) => {
                setDistStr(String(n));
                setPadOpen(false);
              }}
            />
            <Button variant="subtle" className="mt-2 w-full" onClick={() => setPadOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {helpOpen ? (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/55 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-5 text-fg shadow-panel">
            <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">How to run this gun</p>
            <h2 className="mt-1 text-xl font-semibold">Point, measure, store</h2>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-fg">
              <li>
                <span className="font-semibold text-readout">1. Point the gun.</span> Drag the telescope or use the
                tangent stick until the crosshair is on the object — a prism pole, stake, house, hydrant, or the ground.
                Every pin on the map is a pole or stake out there.
              </li>
              <li>
                <span className="font-semibold text-readout">2. Meas.</span> F1 / MEAS / the yellow button fires the EDM.
                Slope distance is to whatever is under the crosshair (IR to a prism, reflectorless to everything else).
              </li>
              <li>
                <span className="font-semibold text-readout">3. Store.</span> That reading becomes a point (HA, ZA, SD →
                NEZ) on the map and a new stake in the world. FIND is the collimator; 30× is the scope.
              </li>
            </ol>
            <Button
              variant="primary"
              className="mt-5 w-full"
              onClick={() => {
                try {
                  sessionStorage.setItem("sightline-help", "1");
                } catch {
                  /* ignore */
                }
                setHelpOpen(false);
              }}
            >
              Got it — point the gun
            </Button>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="pointer-events-none absolute inset-x-0 top-16 z-50 flex justify-center px-4">
          <p className="rounded-md border border-border bg-raised px-3 py-2 font-mono text-xs text-readout shadow-panel">{toast}</p>
        </div>
      ) : null}
    </main>
  );
}

function horizonLabel(za: number): string {
  const va = 90 - za;
  if (Math.abs(va) < 1 / 3600) return "Horizon";
  return `${va > 0 ? "Up" : "Dn"} ${formatDms(Math.abs(va), 0)}`;
}

const GOALS: Array<{ id: string; label: string; test: (p: { code: string; desc: string }) => boolean }> = [
  { id: "fs", label: "FS prism", test: (p) => p.code === "FS" || /fs/i.test(p.desc) },
  { id: "house", label: "House", test: (p) => p.code === "BLDG" && /house|roof/i.test(p.desc) },
  { id: "barn", label: "Barn", test: (p) => /barn/i.test(p.desc) },
  { id: "silo", label: "Silo", test: (p) => /silo/i.test(p.desc) },
  { id: "tree", label: "Tree", test: (p) => p.code === "TREE" || /tree/i.test(p.desc) },
  { id: "gate", label: "Gate", test: (p) => /gate/i.test(p.desc) },
  { id: "mail", label: "Mailbox", test: (p) => /mail/i.test(p.desc) },
];

function Objectives({ points }: { points: { code: string; desc: string }[] }) {
  return (
    <div className="pointer-events-none absolute top-12 left-2 z-10 max-w-[11rem] rounded-md border border-border bg-glass px-2 py-1.5 text-[10px] text-fg">
      <p className="font-semibold tracking-wide text-readout uppercase">Lot points</p>
      <ul className="mt-1 space-y-0.5">
        {GOALS.map((g) => {
          const done = points.some((p) => g.test(p));
          return (
            <li key={g.id} className={done ? "text-ok line-through" : "text-muted"}>
              {done ? "✓" : "○"} {g.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function LookStick({
  nudgeRef,
  hfov,
}: {
  nudgeRef: MutableRefObject<(dHa: number, dZa: number) => void>;
  hfov: number;
}) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const vec = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const held = useRef(false);
  const last = useRef(0);
  const hfovRef = useRef(hfov);
  hfovRef.current = hfov;
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  function tick(now: number) {
    const dt = Math.min(0.05, (now - last.current) / 1000);
    last.current = now;
    const { x, y } = vec.current;
    const mag = Math.hypot(x, y);
    if (held.current && mag > 0.04) {
      const curved = mag * mag;
      const nx = (x / mag) * curved;
      const ny = (y / mag) * curved;
      const fov = Math.max(0.12, hfovRef.current / FINDER_HFOV);
      nudgeRef.current(nx * 17.2 * fov * dt, ny * 12.8 * fov * dt);
    }
    if (held.current) raf.current = requestAnimationFrame(tick);
  }

  function at(e: PointerEvent) {
    const el = wrap.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const mag = Math.hypot(dx, dy);
    const s = mag > 1 ? 1 / mag : 1;
    vec.current = { x: dx * s, y: dy * s };
    setKnob({ x: dx * s, y: dy * s });
  }

  function end() {
    held.current = false;
    vec.current = { x: 0, y: 0 };
    setKnob({ x: 0, y: 0 });
    cancelAnimationFrame(raf.current);
  }

  return (
    <div
      ref={wrap}
      className="absolute bottom-3 left-3 z-10 size-[5.75rem] touch-none rounded-full border border-[#3a403c] bg-[rgba(18,22,20,0.72)] shadow-[inset_0_0_0_1px_rgba(183,224,196,0.12)] outline-none select-none [-webkit-tap-highlight-color:transparent]"
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        at(e);
        held.current = true;
        last.current = performance.now();
        cancelAnimationFrame(raf.current);
        raf.current = requestAnimationFrame(tick);
      }}
      onPointerMove={(e) => {
        if (!held.current) return;
        at(e);
      }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="pointer-events-none absolute inset-2 rounded-full border border-[rgba(183,224,196,0.16)]" />
      <div className="pointer-events-none absolute top-1/2 left-2 right-2 h-px bg-[rgba(183,224,196,0.12)]" />
      <div className="pointer-events-none absolute top-2 bottom-2 left-1/2 w-px bg-[rgba(183,224,196,0.12)]" />
      <div
        className="absolute size-7 rounded-full border border-[#8aa090] bg-[#c5d4c8] shadow-[0_1px_4px_rgba(0,0,0,0.45)]"
        style={{
          left: `calc(50% + ${knob.x * 24}px - 0.875rem)`,
          top: `calc(50% + ${knob.y * 24}px - 0.875rem)`,
        }}
      />
    </div>
  );
}

function MeasButton({ locked, onMeas }: { locked: boolean; onMeas: () => void }) {
  return (
    <button
      type="button"
      aria-label="Measure"
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onMeas();
      }}
      className={cn(
        "absolute right-3 bottom-3 z-10 size-[4.4rem] rounded-full border-4 text-[12px] font-bold tracking-wide uppercase outline-none select-none",
        "[-webkit-tap-highlight-color:transparent]",
        locked
          ? "border-[#8a6a18] bg-[#d4a428] text-[#2a2208] shadow-[0_0_16px_rgba(212,164,40,0.45)]"
          : "border-[#5a5030] bg-[#8a7428] text-[#2a2208]",
      )}
    >
      Meas
    </button>
  );
}

function ReadoutCell({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div className="bg-surface px-3 py-2">
      <p className="text-xs font-medium tracking-[0.16em] text-muted uppercase">{k}</p>
      <p className="readout text-lg leading-tight">{v}</p>
      {sub ? <p className="text-xs text-subtle">{sub}</p> : null}
    </div>
  );
}

export function ReticleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="3" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path d="M16 2.5v7M16 22.5v7M2.5 16h7M22.5 16h7" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
