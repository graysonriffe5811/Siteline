import { inverse, radiation } from "./coords";
import type { Job, Point, Station } from "./types";

const T0 = 1_725_000_000_000;

function pt(
  id: string,
  name: string,
  n: number,
  e: number,
  z: number,
  code: string,
  desc: string,
  kind: Point["kind"],
): Point {
  return { id, name, n, e, z, code, desc, kind, createdAt: T0 };
}

/** A closed lot around station 100, US survey feet, already occupied and oriented. */
export function createDemoJob(): Job {
  const p100 = pt("pt-100", "100", 10000, 5000, 850, "CP", "Occupy — iron pin", "control");
  const p101 = pt("pt-101", "101", 10200, 5000, 851.2, "CP", "Backsight — mag nail N", "control");

  const station: Station = {
    pointId: p100.id,
    hi: 5.15,
    ht: 5.0,
    orientationMode: "circle",
    azAtZero: 0,
    backsightId: p101.id,
    bsHa: 0,
    setupAt: T0,
  };

  const hi = station.hi;
  const ht = station.ht;
  const sta = { n: p100.n, e: p100.e, z: p100.z };

  const raw: Array<{ id: string; name: string; n: number; e: number; z: number; code: string; desc: string }> = [
    { id: "pt-201", name: "201", n: 10000, e: 5350, z: 849.42, code: "PIN", desc: "NE lot corner" },
    { id: "pt-202", name: "202", n: 9760, e: 5350, z: 848.9, code: "PIN", desc: "SE lot corner" },
    { id: "pt-203", name: "203", n: 9760, e: 5000, z: 849.15, code: "TP", desc: "S property line" },
    { id: "pt-204", name: "204", n: 9760, e: 4620, z: 850.35, code: "PIN", desc: "SW lot corner" },
    { id: "pt-205", name: "205", n: 10000, e: 4620, z: 850.88, code: "PIN", desc: "NW lot corner" },
    { id: "pt-206", name: "206", n: 9880, e: 5180, z: 849.2, code: "FH", desc: "Fire hydrant" },
    { id: "pt-207", name: "207", n: 9925, e: 4888, z: 850.05, code: "POLE", desc: "Power pole" },
  ];

  const shots: Point[] = raw.map((r) => {
    const inv = inverse(sta, r);
    const shot = radiation({
      station: sta,
      hi,
      ht,
      az: inv.az,
      za: inv.za,
      distance: inv.sd,
      distIsHd: false,
    });
    const hd = inv.hd;
    const sd = inv.sd;
    const vd = inv.sd * Math.cos((inv.za * Math.PI) / 180);
    return {
      id: r.id,
      name: r.name,
      n: shot.nez.n,
      e: shot.nez.e,
      z: r.z,
      code: r.code,
      desc: r.desc,
      kind: "topo" as const,
      createdAt: T0,
      obs: {
        stationName: "100",
        ha: inv.az,
        za: inv.za,
        az: inv.az,
        hd,
        sd,
        vd,
        hi,
        ht,
        method: "edm",
      },
    };
  });

  return {
    id: "job-demo",
    name: "Demo — Lot 12",
    units: "usft",
    declination: 0,
    gpsOrigin: null,
    points: [p100, p101, ...shots],
    station,
    nextName: "208",
    createdAt: T0,
  };
}

export function createBlankJob(name: string): Job {
  return {
    id: `job-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim() || "Untitled job",
    units: "usft",
    declination: 0,
    gpsOrigin: null,
    points: [],
    station: null,
    nextName: "1",
    createdAt: Date.now(),
  };
}
