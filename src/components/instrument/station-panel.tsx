import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { formatDms, parseAngle, toBearing } from "@/lib/survey/angles";
import { distanceDistance, findPoint, inverse } from "@/lib/survey/coords";
import { useJob, useSurvey } from "@/lib/survey/store";
import type { OrientationMode } from "@/lib/survey/types";
import { formatCoord, UNIT_LABEL } from "@/lib/survey/units";
import type { GpsFix } from "@/hooks/use-instrument";

interface Props {
  gps: { fix: GpsFix | null; status: "off" | "on" | "denied"; start: () => void };
}

export function StationPanel({ gps }: Props) {
  const job = useJob();
  const occupy = useSurvey((s) => s.occupy);
  const keyInPoint = useSurvey((s) => s.keyInPoint);
  const resect = useSurvey((s) => s.resect);
  const clearStation = useSurvey((s) => s.clearStation);
  const setDeclination = useSurvey((s) => s.setDeclination);
  const setUnits = useSurvey((s) => s.setUnits);
  const setGpsOrigin = useSurvey((s) => s.setGpsOrigin);

  const [mode, setMode] = useState<"occupy" | "resect">("occupy");
  const [msg, setMsg] = useState<string | null>(null);

  if (!job) return null;
  const u = UNIT_LABEL[job.units];
  const stationPt = job.station ? findPoint(job.points, job.station.pointId) : undefined;
  const bsPt = job.station?.backsightId ? findPoint(job.points, job.station.backsightId) : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
      <header>
        <p className="text-xs font-medium tracking-[0.16em] text-muted uppercase">Station setup</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Occupy or resect</h2>
        <p className="mt-1 text-sm text-muted">
          One known point + backsight, compass north, or free-station from two knowns.
        </p>
      </header>

      {stationPt && job.station ? (
        <div className="rounded-lg border border-border bg-raised p-4">
          <p className="text-xs tracking-[0.14em] text-muted uppercase">Occupied</p>
          <p className="mt-1 font-mono text-lg text-readout">{stationPt.name}</p>
          <p className="mt-2 font-mono text-sm text-fg">
            N {formatCoord(stationPt.n, job.units)}
            <br />E {formatCoord(stationPt.e, job.units)}
            <br />Z {formatCoord(stationPt.z, job.units)}
          </p>
          <p className="mt-2 text-sm text-muted">
            HI {job.station.hi.toFixed(3)} {u} · HT {job.station.ht.toFixed(3)} {u}
            {bsPt ? (
              <>
                <br />
                BS {bsPt.name} · circle 0 = {formatDms(job.station.azAtZero, 0)} {toBearing(job.station.azAtZero)}
              </>
            ) : job.station.orientationMode === "compass" ? (
              <>
                <br />
                Compass + decl {job.declination.toFixed(2)}°
              </>
            ) : null}
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => clearStation()}>
            Break station
          </Button>
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted">No station occupied.</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button variant={mode === "occupy" ? "primary" : "ghost"} onClick={() => setMode("occupy")}>
          Known point
        </Button>
        <Button variant={mode === "resect" ? "primary" : "ghost"} onClick={() => setMode("resect")}>
          Two knowns
        </Button>
      </div>

      {mode === "occupy" ? (
        <OccupyForm
          units={u}
          onOccupy={(args) => {
            occupy(args);
            setMsg(`Occupied ${findPoint(job.points, args.pointId)?.name ?? ""}`);
          }}
          onKeyIn={keyInPoint}
          onError={setMsg}
        />
      ) : (
        <ResectForm
          units={u}
          onGo={(args) => {
            const res = resect(args);
            if ("error" in res) setMsg(res.error);
            else setMsg(`Free station ${res.name} stored and occupied`);
          }}
        />
      )}

      {msg ? <p className="text-sm text-readout">{msg}</p> : null}

      <div className="mt-2 border-t border-border pt-4">
        <p className="text-xs font-medium tracking-[0.14em] text-muted uppercase">Job</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(["usft", "ift", "m"] as const).map((uOpt) => (
            <Button key={uOpt} variant={job.units === uOpt ? "primary" : "ghost"} size="sm" onClick={() => setUnits(uOpt)}>
              {uOpt === "usft" ? "US ft" : uOpt === "ift" ? "Int ft" : "m"}
            </Button>
          ))}
        </div>
        <div className="mt-3">
          <Field label="Magnetic declination (E+)" hint="Added to compass heading for true/grid azimuth">
            <Input
              defaultValue={String(job.declination)}
              onBlur={(e) => {
                const n = parseAngle(e.target.value);
                if (n != null) setDeclination(n);
              }}
            />
          </Field>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (gps.status !== "on") gps.start();
              if (gps.fix) setGpsOrigin(gps.fix.lat, gps.fix.lon);
            }}
          >
            {job.gpsOrigin ? "GPS origin set" : "GPS lock at station"}
          </Button>
          {gps.fix ? (
            <p className="font-mono text-xs text-muted">
              {gps.fix.lat.toFixed(6)}, {gps.fix.lon.toFixed(6)} ±{gps.fix.accuracy.toFixed(0)} m
            </p>
          ) : (
            <p className="text-xs text-subtle">Phone GPS is typically 3–8 m. Use for reconnaissance, not boundary.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function OccupyForm({
  units,
  onOccupy,
  onKeyIn,
  onError,
}: {
  units: string;
  onOccupy: (args: {
    pointId: string;
    hi: number;
    ht: number;
    mode: OrientationMode;
    azAtZero: number;
    backsightId: string | null;
    bsHa: number;
  }) => void;
  onKeyIn: ReturnType<typeof useSurvey.getState>["keyInPoint"];
  onError: (s: string) => void;
}) {
  const job = useJob();
  const [pointName, setPointName] = useState("100");
  const [n, setN] = useState("10000");
  const [e, setE] = useState("5000");
  const [z, setZ] = useState("850");
  const [hi, setHi] = useState("5.15");
  const [ht, setHt] = useState("5.00");
  const [orient, setOrient] = useState<OrientationMode | "azimuth">("circle");
  const [bsName, setBsName] = useState("101");
  const [azIn, setAzIn] = useState("0");

  const existing = job?.points.find((p) => p.name.trim() === pointName.trim());
  const bs = job?.points.find((p) => p.name.trim() === bsName.trim());

  const previewAz = useMemo(() => {
    if (!existing || !bs) return null;
    return inverse(existing, bs).az;
  }, [existing, bs]);

  if (!job) return null;

  return (
    <div className="flex flex-col gap-3">
      <Field label="Occupy point">
        <Input value={pointName} onChange={(ev) => setPointName(ev.target.value)} />
      </Field>
      <div className="grid grid-cols-3 gap-2">
        <Field label={`N ${units}`}>
          <Input value={n} onChange={(ev) => setN(ev.target.value)} inputMode="decimal" />
        </Field>
        <Field label={`E ${units}`}>
          <Input value={e} onChange={(ev) => setE(ev.target.value)} inputMode="decimal" />
        </Field>
        <Field label={`Z ${units}`}>
          <Input value={z} onChange={(ev) => setZ(ev.target.value)} inputMode="decimal" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label={`HI ${units}`}>
          <Input value={hi} onChange={(ev) => setHi(ev.target.value)} inputMode="decimal" />
        </Field>
        <Field label={`HT ${units}`}>
          <Input value={ht} onChange={(ev) => setHt(ev.target.value)} inputMode="decimal" />
        </Field>
      </div>

      <p className="text-xs font-medium tracking-[0.14em] text-muted uppercase">Orientation</p>
      <div className="grid grid-cols-3 gap-2">
        <Button variant={orient === "circle" ? "primary" : "ghost"} size="sm" onClick={() => setOrient("circle")}>
          Backsight
        </Button>
        <Button variant={orient === "compass" ? "primary" : "ghost"} size="sm" onClick={() => setOrient("compass")}>
          Compass
        </Button>
        <Button variant={orient === "azimuth" ? "primary" : "ghost"} size="sm" onClick={() => setOrient("azimuth")}>
          Set AZ
        </Button>
      </div>
      {orient === "circle" ? (
        <Field label="Backsight point" hint={previewAz != null ? `Computed AZ ${formatDms(previewAz, 0)} ${toBearing(previewAz)}` : "Key in a second known, or pick an existing name"}>
          <Input value={bsName} onChange={(ev) => setBsName(ev.target.value)} />
        </Field>
      ) : null}
      {orient === "azimuth" ? (
        <Field label="Azimuth at circle 0">
          <Input value={azIn} onChange={(ev) => setAzIn(ev.target.value)} />
        </Field>
      ) : null}

      <Button
        size="lg"
        onClick={() => {
          const nn = Number(n);
          const ee = Number(e);
          const zz = Number(z);
          const hiN = Number(hi);
          const htN = Number(ht);
          if (![nn, ee, zz, hiN, htN].every(Number.isFinite)) {
            onError("Check N/E/Z/HI/HT.");
            return;
          }
          let pointId = existing?.id;
          if (!pointId) {
            const created = onKeyIn({
              name: pointName.trim(),
              n: nn,
              e: ee,
              z: zz,
              code: "STA",
              desc: "Occupied station",
              kind: "control",
            });
            if ("error" in created) {
              onError(created.error);
              return;
            }
            pointId = created.id;
          }
          let azAtZero = 0;
          let backsightId: string | null = null;
          let mode: OrientationMode = "circle";
          if (orient === "compass") {
            mode = "compass";
            azAtZero = 0;
          } else if (orient === "azimuth") {
            const a = parseAngle(azIn);
            if (a == null) {
              onError("Bad azimuth.");
              return;
            }
            azAtZero = a;
          } else {
            const jobNow = useSurvey.getState().currentJob();
            const occ = jobNow?.points.find((p) => p.id === pointId);
            const back = jobNow?.points.find((p) => p.name.trim() === bsName.trim());
            if (!back) {
              onError("Backsight point not in the job — add it on Points first.");
              return;
            }
            if (!occ) {
              onError("Occupy point missing.");
              return;
            }
            azAtZero = inverse(occ, back).az;
            backsightId = back.id;
          }
          onOccupy({ pointId, hi: hiN, ht: htN, mode, azAtZero, backsightId, bsHa: 0 });
        }}
      >
        Occupy
      </Button>
    </div>
  );
}

function ResectForm({
  units,
  onGo,
}: {
  units: string;
  onGo: (args: {
    aId: string;
    bId: string;
    hdA: number;
    hdB: number;
    zaA: number;
    zaB: number;
    sdA: number;
    sdB: number;
    side: "left" | "right";
    hi: number;
    ht: number;
    name: string;
  }) => void;
}) {
  const job = useJob();
  const [aName, setAName] = useState("100");
  const [bName, setBName] = useState("101");
  const [hdA, setHdA] = useState("200");
  const [hdB, setHdB] = useState("350");
  const [zaA, setZaA] = useState("90");
  const [zaB, setZaB] = useState("90");
  const [hi, setHi] = useState("5.15");
  const [ht, setHt] = useState("5.00");
  const [name, setName] = useState("300");
  const [side, setSide] = useState<"left" | "right">("left");

  const a = job?.points.find((p) => p.name.trim() === aName.trim());
  const b = job?.points.find((p) => p.name.trim() === bName.trim());
  const preview = useMemo(() => {
    if (!a || !b) return null;
    const hd1 = Number(hdA);
    const hd2 = Number(hdB);
    if (![hd1, hd2].every((x) => x > 0)) return null;
    return distanceDistance(a, b, hd1, hd2);
  }, [a, b, hdA, hdB]);

  if (!job) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        Measure horizontal distance to two knowns (tape, EDM, or GPS). Pick the solution left or right of A→B.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Known A">
          <Input value={aName} onChange={(ev) => setAName(ev.target.value)} />
        </Field>
        <Field label={`HD A ${units}`}>
          <Input value={hdA} onChange={(ev) => setHdA(ev.target.value)} inputMode="decimal" />
        </Field>
        <Field label="Known B">
          <Input value={bName} onChange={(ev) => setBName(ev.target.value)} />
        </Field>
        <Field label={`HD B ${units}`}>
          <Input value={hdB} onChange={(ev) => setHdB(ev.target.value)} inputMode="decimal" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="ZA to A">
          <Input value={zaA} onChange={(ev) => setZaA(ev.target.value)} />
        </Field>
        <Field label="ZA to B">
          <Input value={zaB} onChange={(ev) => setZaB(ev.target.value)} />
        </Field>
        <Field label={`HI ${units}`}>
          <Input value={hi} onChange={(ev) => setHi(ev.target.value)} />
        </Field>
        <Field label={`HT ${units}`}>
          <Input value={ht} onChange={(ev) => setHt(ev.target.value)} />
        </Field>
      </div>
      <Field label="New station name">
        <Input value={name} onChange={(ev) => setName(ev.target.value)} />
      </Field>
      {preview ? (
        <p className="font-mono text-xs text-muted">
          Left N {preview.left.n.toFixed(3)} E {preview.left.e.toFixed(3)}
          <br />
          Right N {preview.right.n.toFixed(3)} E {preview.right.e.toFixed(3)}
        </p>
      ) : (
        <p className="text-xs text-subtle">Need two known points and valid distances.</p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Button variant={side === "left" ? "primary" : "ghost"} onClick={() => setSide("left")}>
          Left of A→B
        </Button>
        <Button variant={side === "right" ? "primary" : "ghost"} onClick={() => setSide("right")}>
          Right of A→B
        </Button>
      </div>
      <Button
        size="lg"
        disabled={!a || !b}
        onClick={() => {
          if (!a || !b) return;
          const za1 = parseAngle(zaA) ?? 90;
          const za2 = parseAngle(zaB) ?? 90;
          const hd1 = Number(hdA);
          const hd2 = Number(hdB);
          const sin1 = Math.sin((za1 * Math.PI) / 180);
          const sin2 = Math.sin((za2 * Math.PI) / 180);
          onGo({
            aId: a.id,
            bId: b.id,
            hdA: hd1,
            hdB: hd2,
            zaA: za1,
            zaB: za2,
            sdA: sin1 === 0 ? hd1 : hd1 / sin1,
            sdB: sin2 === 0 ? hd2 : hd2 / sin2,
            side,
            hi: Number(hi) || 0,
            ht: Number(ht) || 0,
            name: name.trim() || "STA",
          });
        }}
      >
        Compute & occupy
      </Button>
    </div>
  );
}
