import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/utils";
import {
  buildObservation,
  depressionHd,
  distanceDistance,
  findPoint,
  gpsToLocal,
  inverse,
  liveAzimuth,
  nextPointName,
  radiation,
  stationZFromSight,
} from "./coords";
import { createBlankJob, createDemoJob } from "./demo";
import type { DistMethod, Job, OrientationMode, Point, PointKind, Units } from "./types";
import { convert } from "./units";

export type DistMode = DistMethod;

interface SurveyState {
  jobs: Job[];
  currentJobId: string | null;
  seeded: boolean;
  hydrated: boolean;
  setHydrated: () => void;
  currentJob: () => Job | null;
  createJob: (name: string) => string;
  deleteJob: (id: string) => void;
  renameJob: (id: string, name: string) => void;
  selectJob: (id: string | null) => void;
  setUnits: (units: Units) => void;
  setDeclination: (deg: number) => void;
  setNextName: (name: string) => void;
  addPoint: (partial: Omit<Point, "id" | "createdAt"> & { id?: string }) => Point;
  updatePoint: (id: string, patch: Partial<Point>) => void;
  deletePoint: (id: string) => void;
  occupy: (args: {
    pointId: string;
    hi: number;
    ht: number;
    mode: OrientationMode;
    azAtZero: number;
    backsightId: string | null;
    bsHa: number;
  }) => void;
  clearStation: () => void;
  storeShot: (args: {
    name: string;
    code: string;
    desc: string;
    ha: number;
    za: number;
    magAz: number | null;
    distance: number;
    mode: DistMode;
    ht?: number;
    gps?: { lat: number; lon: number; accuracy: number; alt?: number | null };
  }) => Point | { error: string };
  keyInPoint: (args: {
    name: string;
    n: number;
    e: number;
    z: number;
    code: string;
    desc: string;
    kind: PointKind;
  }) => Point | { error: string };
  resect: (args: {
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
  }) => Point | { error: string };
  setGpsOrigin: (lat: number, lon: number) => void;
}

function patchJob(jobs: Job[], id: string | null, fn: (job: Job) => Job): Job[] {
  if (!id) return jobs;
  return jobs.map((j) => (j.id === id ? fn(j) : j));
}

const demoJob = createDemoJob();

export const useSurvey = create<SurveyState>()(
  persist(
    (set, get) => ({
      jobs: [demoJob],
      currentJobId: demoJob.id,
      seeded: true,
      hydrated: true,
      setHydrated: () => {
        const s = get();
        if (!s.seeded && s.jobs.length === 0) {
          const demo = createDemoJob();
          set({ jobs: [demo], currentJobId: demo.id, seeded: true, hydrated: true });
          return;
        }
        set({ hydrated: true });
      },
      currentJob: () => {
        const { jobs, currentJobId } = get();
        return jobs.find((j) => j.id === currentJobId) ?? null;
      },
      createJob: (name) => {
        const job = createBlankJob(name);
        set((s) => ({ jobs: [job, ...s.jobs], currentJobId: job.id }));
        return job.id;
      },
      deleteJob: (id) => {
        set((s) => {
          const jobs = s.jobs.filter((j) => j.id !== id);
          return {
            jobs,
            currentJobId: s.currentJobId === id ? (jobs[0]?.id ?? null) : s.currentJobId,
          };
        });
      },
      renameJob: (id, name) => {
        set((s) => ({
          jobs: patchJob(s.jobs, id, (j) => ({ ...j, name: name.trim() || j.name })),
        }));
      },
      selectJob: (id) => set({ currentJobId: id }),
      setUnits: (units) => {
        const job = get().currentJob();
        if (!job || job.units === units) return;
        set((s) => ({
          jobs: patchJob(s.jobs, s.currentJobId, (j) => ({
            ...j,
            units,
            points: j.points.map((p) => ({
              ...p,
              n: convert(p.n, j.units, units),
              e: convert(p.e, j.units, units),
              z: convert(p.z, j.units, units),
              obs: p.obs
                ? {
                    ...p.obs,
                    sd: convert(p.obs.sd, j.units, units),
                    hd: convert(p.obs.hd, j.units, units),
                    vd: convert(p.obs.vd, j.units, units),
                    hi: convert(p.obs.hi, j.units, units),
                    ht: convert(p.obs.ht, j.units, units),
                  }
                : p.obs,
            })),
            station: j.station
              ? {
                  ...j.station,
                  hi: convert(j.station.hi, j.units, units),
                  ht: convert(j.station.ht, j.units, units),
                }
              : j.station,
          })),
        }));
      },
      setDeclination: (deg) => {
        set((s) => ({
          jobs: patchJob(s.jobs, s.currentJobId, (j) => ({ ...j, declination: deg })),
        }));
      },
      setNextName: (name) => {
        set((s) => ({
          jobs: patchJob(s.jobs, s.currentJobId, (j) => ({ ...j, nextName: name })),
        }));
      },
      addPoint: (partial) => {
        const point: Point = {
          id: partial.id ?? uid("pt"),
          createdAt: Date.now(),
          name: partial.name,
          n: partial.n,
          e: partial.e,
          z: partial.z,
          code: partial.code,
          desc: partial.desc,
          kind: partial.kind,
          obs: partial.obs,
        };
        set((s) => ({
          jobs: patchJob(s.jobs, s.currentJobId, (j) => ({
            ...j,
            points: [...j.points, point],
            nextName: nextPointName(point.name),
          })),
        }));
        return point;
      },
      updatePoint: (id, patch) => {
        set((s) => ({
          jobs: patchJob(s.jobs, s.currentJobId, (j) => ({
            ...j,
            points: j.points.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          })),
        }));
      },
      deletePoint: (id) => {
        set((s) => ({
          jobs: patchJob(s.jobs, s.currentJobId, (j) => ({
            ...j,
            points: j.points.filter((p) => p.id !== id),
            station: j.station?.pointId === id ? null : j.station,
          })),
        }));
      },
      occupy: ({ pointId, hi, ht, mode, azAtZero, backsightId, bsHa }) => {
        set((s) => ({
          jobs: patchJob(s.jobs, s.currentJobId, (j) => ({
            ...j,
            station: {
              pointId,
              hi,
              ht,
              orientationMode: mode,
              azAtZero,
              backsightId,
              bsHa,
              setupAt: Date.now(),
            },
          })),
        }));
      },
      clearStation: () => {
        set((s) => ({
          jobs: patchJob(s.jobs, s.currentJobId, (j) => ({ ...j, station: null })),
        }));
      },
      storeShot: ({ name, code, desc, ha, za, magAz, distance, mode, ht, gps }) => {
        const job = get().currentJob();
        if (!job) return { error: "No job open." };
        let shotName = name.trim() || job.nextName;
        while (job.points.some((p) => p.name.trim().toLowerCase() === shotName.toLowerCase())) {
          shotName = nextPointName(shotName);
        }

        const stationPt = job.station ? findPoint(job.points, job.station.pointId) : undefined;

        if (mode === "gps") {
          if (!gps) return { error: "No GPS fix." };
          let origin = job.gpsOrigin;
          if (!origin && stationPt) {
            return { error: "Set GPS origin at the station first (Station → GPS lock)." };
          }
          if (!origin) {
            origin = { lat: gps.lat, lon: gps.lon, n: 10000, e: 5000 };
            set((s) => ({
              jobs: patchJob(s.jobs, s.currentJobId, (j) => ({ ...j, gpsOrigin: origin })),
            }));
          }
          const liveOrigin = get().currentJob()?.gpsOrigin ?? origin;
          if (!liveOrigin) return { error: "No GPS origin." };
          const local = gpsToLocal(gps.lat, gps.lon, liveOrigin, job.units);
          let elev = stationPt?.z ?? 0;
          let hd = 0;
          let sd = 0;
          let vd = 0;
          let az = 0;
          if (stationPt && job.station) {
            const inv = inverse(stationPt, { n: local.n, e: local.e, z: stationPt.z });
            hd = inv.hd;
            az = inv.az;
            const shot = radiation({
              station: stationPt,
              hi: job.station.hi,
              ht: job.station.ht,
              az,
              za,
              distance: hd,
              distIsHd: true,
            });
            elev = shot.nez.z;
            sd = shot.sd;
            vd = shot.vd;
          } else {
            az = liveAzimuth(null, ha, magAz, job.declination);
            elev = 0;
          }
          return get().addPoint({
            name: shotName,
            n: local.n,
            e: local.e,
            z: elev,
            code,
            desc,
            kind: "topo",
            obs: stationPt
              ? buildObservation({
                  stationName: stationPt.name,
                  ha,
                  za,
                  az,
                  hd,
                  sd,
                  vd,
                  hi: job.station?.hi ?? 0,
                  ht: job.station?.ht ?? 0,
                  method: "gps",
                  gpsAccuracyM: gps.accuracy,
                })
              : undefined,
          });
        }

        if (!job.station || !stationPt) return { error: "Occupy a station first." };

        const az = liveAzimuth(job.station, ha, magAz, job.declination);
        let dist = distance;
        let distIsHd = mode === "hd" || mode === "ground";

        if (mode === "ground") {
          const hd = depressionHd(job.station.hi, za);
          if (hd == null) return { error: "Aim below horizon and set HI to use ground ranging." };
          dist = hd;
          distIsHd = true;
        }

        if (mode !== "ground" && !(dist > 0)) return { error: "Enter a distance greater than zero." };

        const rod = ht ?? job.station.ht;
        const shot = radiation({
          station: stationPt,
          hi: job.station.hi,
          ht: rod,
          az,
          za,
          distance: dist,
          distIsHd,
        });

        return get().addPoint({
          name: shotName,
          n: shot.nez.n,
          e: shot.nez.e,
          z: shot.nez.z,
          code,
          desc,
          kind: "topo",
          obs: buildObservation({
            stationName: stationPt.name,
            ha,
            za,
            az,
            hd: shot.hd,
            sd: shot.sd,
            vd: shot.vd,
            hi: job.station.hi,
            ht: rod,
            method: mode,
          }),
        });
      },
      keyInPoint: ({ name, n, e, z, code, desc, kind }) => {
        const job = get().currentJob();
        if (!job) return { error: "No job open." };
        if (job.points.some((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase())) {
          return { error: `Point ${name.trim()} already exists.` };
        }
        return get().addPoint({ name: name.trim(), n, e, z, code, desc, kind });
      },
      resect: ({ aId, bId, hdA, hdB, zaA, zaB, sdA, sdB, side, hi, ht, name }) => {
        const job = get().currentJob();
        if (!job) return { error: "No job open." };
        const a = findPoint(job.points, aId);
        const b = findPoint(job.points, bId);
        if (!a || !b) return { error: "Pick two known points." };
        if (a.id === b.id) return { error: "Known points must be different." };
        const ix = distanceDistance(a, b, hdA, hdB);
        if (!ix) return { error: "No intersection — check the two distances." };
        const pick = side === "left" ? ix.left : ix.right;
        const vdA = sdA * Math.cos((zaA * Math.PI) / 180);
        const vdB = sdB * Math.cos((zaB * Math.PI) / 180);
        const zA = stationZFromSight(a.z, hi, ht, vdA);
        const zB = stationZFromSight(b.z, hi, ht, vdB);
        const z = (zA + zB) / 2;
        const nez = { n: pick.n, e: pick.e, z };
        if (job.points.some((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase())) {
          return { error: `Point ${name.trim()} already exists.` };
        }
        const point = get().addPoint({
          name: name.trim(),
          n: nez.n,
          e: nez.e,
          z: nez.z,
          code: "STA",
          desc: `Resection from ${a.name} & ${b.name}`,
          kind: "calc",
        });
        const invB = inverse(nez, b);
        get().occupy({
          pointId: point.id,
          hi,
          ht,
          mode: "circle",
          azAtZero: invB.az,
          backsightId: b.id,
          bsHa: 0,
        });
        return point;
      },
      setGpsOrigin: (lat, lon) => {
        const job = get().currentJob();
        const sta = job?.station ? findPoint(job.points, job.station.pointId) : undefined;
        const n = sta?.n ?? 10000;
        const e = sta?.e ?? 5000;
        set((s) => ({
          jobs: patchJob(s.jobs, s.currentJobId, (j) => ({
            ...j,
            gpsOrigin: { lat, lon, n, e },
          })),
        }));
      },
    }),
    {
      name: "sightline-ts",
      skipHydration: true,
      partialize: (s) => ({
        jobs: s.jobs,
        currentJobId: s.currentJobId,
        seeded: s.seeded,
      }),
    },
  ),
);

export function useJob(): Job | null {
  return useSurvey((s) => s.jobs.find((j) => j.id === s.currentJobId) ?? null);
}
