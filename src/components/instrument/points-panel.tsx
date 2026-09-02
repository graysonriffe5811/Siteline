import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { formatDms, toBearing } from "@/lib/survey/angles";
import { downloadText, fieldBookText, pnezdCsv } from "@/lib/survey/export";
import { useJob, useSurvey } from "@/lib/survey/store";
import { FIELD_CODES } from "@/lib/survey/types";
import { formatCoord, UNIT_LABEL } from "@/lib/survey/units";

export function PointsPanel({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const job = useJob();
  const keyInPoint = useSurvey((s) => s.keyInPoint);
  const deletePoint = useSurvey((s) => s.deletePoint);
  const [name, setName] = useState("301");
  const [n, setN] = useState("");
  const [e, setE] = useState("");
  const [z, setZ] = useState("");
  const [code, setCode] = useState("CP");
  const [desc, setDesc] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    if (!job) return [];
    const query = q.trim().toLowerCase();
    return job.points
      .filter((p) => {
        if (!query) return true;
        return `${p.name} ${p.code} ${p.desc}`.toLowerCase().includes(query);
      })
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [job, q]);

  if (!job) return null;
  const u = UNIT_LABEL[job.units];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-muted uppercase">Coordinate list</p>
          <h2 className="text-lg font-semibold">{job.points.length} points</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadText(`${slug(job.name)}.csv`, pnezdCsv(job), "text/csv")}
          >
            CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => downloadText(`${slug(job.name)}-book.txt`, fieldBookText(job))}
          >
            Book
          </Button>
        </div>
      </div>

      <div className="border-b border-border px-4 py-3">
        <Input placeholder="Search name, code, desc" value={q} onChange={(ev) => setQ(ev.target.value)} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted">No points yet. Key in control or store a shot.</p>
        ) : (
          <ul>
            {rows.map((p) => {
              const active = p.id === selectedId;
              const isSta = job.station?.pointId === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(active ? null : p.id)}
                    className={`flex w-full items-start justify-between gap-3 border-b border-border px-4 py-3 text-left ${
                      active ? "bg-raised" : ""
                    }`}
                  >
                    <span>
                      <span className="font-mono text-sm text-readout">{p.name}</span>
                      <span className="ml-2 text-xs tracking-wide text-muted">{p.code}</span>
                      {isSta ? <span className="ml-2 text-xs text-warn">STA</span> : null}
                      <span className="mt-0.5 block text-xs text-subtle">{p.desc || "—"}</span>
                    </span>
                    <span className="font-mono text-xs text-muted tabular-nums">
                      N {formatCoord(p.n, job.units)}
                      <br />E {formatCoord(p.e, job.units)}
                      <br />Z {formatCoord(p.z, job.units)}
                    </span>
                  </button>
                  {active ? (
                    <div className="space-y-2 border-b border-border bg-bg px-4 py-3">
                      {p.obs ? (
                        <p className="font-mono text-xs text-muted">
                          From {p.obs.stationName} · HA {formatDms(p.obs.ha, 0)} · AZ {formatDms(p.obs.az, 0)}{" "}
                          {toBearing(p.obs.az)} · ZA {formatDms(p.obs.za, 0)} · SD {p.obs.sd.toFixed(3)} · HD{" "}
                          {p.obs.hd.toFixed(3)} · {p.obs.method}
                        </p>
                      ) : (
                        <p className="text-xs text-subtle">Keyed-in coordinate — no observation.</p>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          deletePoint(p.id);
                          onSelect(null);
                        }}
                      >
                        Delete {p.name}
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <form
        className="grid grid-cols-2 gap-2 border-t border-border p-4"
        onSubmit={(ev) => {
          ev.preventDefault();
          const res = keyInPoint({
            name: name.trim(),
            n: Number(n),
            e: Number(e),
            z: Number(z),
            code,
            desc,
            kind: "control",
          });
          if ("error" in res) setMsg(res.error);
          else {
            setMsg(`Stored ${res.name}`);
            setName(String(Number(name.replace(/\D/g, "")) + 1 || name));
            setN("");
            setE("");
            setZ("");
            setDesc("");
          }
        }}
      >
        <p className="col-span-2 text-xs font-medium tracking-[0.14em] text-muted uppercase">Key in control</p>
        <Field label="Point">
          <Input value={name} onChange={(ev) => setName(ev.target.value)} required />
        </Field>
        <Field label="Code">
          <select
            value={code}
            onChange={(ev) => setCode(ev.target.value)}
            className="h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg"
          >
            {FIELD_CODES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`N ${u}`}>
          <Input value={n} onChange={(ev) => setN(ev.target.value)} inputMode="decimal" required />
        </Field>
        <Field label={`E ${u}`}>
          <Input value={e} onChange={(ev) => setE(ev.target.value)} inputMode="decimal" required />
        </Field>
        <Field label={`Z ${u}`}>
          <Input value={z} onChange={(ev) => setZ(ev.target.value)} inputMode="decimal" required />
        </Field>
        <Field label="Desc">
          <Input value={desc} onChange={(ev) => setDesc(ev.target.value)} />
        </Field>
        <Button type="submit" className="col-span-2">
          Store control
        </Button>
        {msg ? <p className="col-span-2 text-sm text-readout">{msg}</p> : null}
      </form>
    </div>
  );
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "job";
}
