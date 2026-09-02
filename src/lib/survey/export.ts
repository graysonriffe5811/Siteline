import { formatDms, toBearing } from "./angles";
import type { Job } from "./types";
import { UNIT_LABEL } from "./units";

export function pnezdCsv(job: Job): string {
  const header = "Point,Northing,Easting,Elevation,Description";
  const rows = job.points.map((p) => {
    const desc = [p.code, p.desc].filter(Boolean).join(" ").replace(/,/g, " ");
    return [p.name, p.n.toFixed(4), p.e.toFixed(4), p.z.toFixed(4), desc].join(",");
  });
  return [header, ...rows].join("\n") + "\n";
}

export function fieldBookText(job: Job): string {
  const u = UNIT_LABEL[job.units];
  const lines: string[] = [
    `SIGHTLINE  ${job.name}`,
    `Units: ${u}    Declination: ${job.declination.toFixed(2)}°`,
    "",
    "POINT     NORTHING        EASTING         ELEV            CODE   DESC",
  ];
  for (const p of job.points) {
    lines.push(
      `${p.name.padEnd(9)}${p.n.toFixed(4).padStart(14)}  ${p.e.toFixed(4).padStart(14)}  ${p.z.toFixed(4).padStart(12)}    ${p.code.padEnd(6)}${p.desc}`,
    );
  }
  lines.push("", "OBSERVATIONS");
  for (const p of job.points) {
    if (!p.obs) continue;
    const o = p.obs;
    lines.push(
      `  ${p.name} from ${o.stationName}  HA ${formatDms(o.ha, 1)}  AZ ${formatDms(o.az, 1)} (${toBearing(o.az)})  ZA ${formatDms(o.za, 1)}  SD ${o.sd.toFixed(3)}  HD ${o.hd.toFixed(3)}  ${o.method}`,
    );
  }
  return lines.join("\n") + "\n";
}

export function downloadText(filename: string, text: string, mime = "text/plain"): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
