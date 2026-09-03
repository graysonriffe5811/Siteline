import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { inverse, liveAzimuth, radiation, distanceDistance } from "./coords.ts";
import { createBlankJob } from "./demo.ts";
import { htForMeasMode, resolveKeyedObs, type MeasMode } from "./meas-store.ts";
import type { Station } from "./types.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const fieldApp = readFileSync(join(root, "src/components/instrument/field-app.tsx"), "utf8");
const gm50 = readFileSync(join(root, "src/components/instrument/gm50-panel.tsx"), "utf8");

const STA = { n: 5000, e: 2000, z: 800 };
const HI = 5.15;
const HT_IR = 5;
const HT_RL = 0;
const TOL = 0.01;

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

function circleStation(azAtZero = 0): Station {
  return {
    pointId: "pt-100",
    hi: HI,
    ht: HT_IR,
    orientationMode: "circle",
    azAtZero,
    backsightId: null,
    bsHa: 0,
    setupAt: 0,
  };
}

/** Same reduction STORE uses for a keyed EDM shot (magAz null, dist is SD). */
function keyedStore(args: { ha: number; za: number; sd: number; ht: number; azAtZero?: number }) {
  const station = circleStation(args.azAtZero ?? 0);
  const az = liveAzimuth(station, args.ha, null, 0);
  return radiation({
    station: STA,
    hi: station.hi,
    ht: args.ht,
    az,
    za: args.za,
    distance: args.sd,
    distIsHd: false,
  });
}

/** STORE HT from MEAS MODE, not the live EDM lock. */
function storeFromKeys(
  keyed: { ha: number; za: number; sd: number; measMode: MeasMode },
  live?: { za?: number; ha?: number; sd?: number | null; occupyHt?: number },
) {
  const obs = resolveKeyedObs({
    keyedZa: keyed.za,
    keyedHa: keyed.ha,
    keyedSd: keyed.sd,
    measMode: keyed.measMode,
    liveZa: live?.za ?? keyed.za,
    liveHa: live?.ha ?? keyed.ha,
    liveSd: live?.sd === undefined ? keyed.sd : live.sd,
    occupyHt: live?.occupyHt ?? HT_IR,
  });
  assert.equal(obs.measMode, keyed.measMode, "STORE must not change MEAS MODE");
  assert.ok(obs.sd != null && obs.sd > 0);
  const s = keyedStore({ ha: obs.ha, za: obs.za, sd: obs.sd, ht: obs.ht, azAtZero: 0 });
  return { obs, s };
}

function assertNez(
  shot: { nez: { n: number; e: number; z: number }; hd: number; vd: number },
  expected: { n: number; e: number; z: number; hd?: number; vd?: number },
) {
  assert.equal(r2(shot.nez.n), expected.n);
  assert.equal(r2(shot.nez.e), expected.e);
  assert.equal(r2(shot.nez.z), expected.z);
  if (expected.hd != null) assert.equal(r2(shot.hd), expected.hd);
  if (expected.vd != null) assert.equal(r2(shot.vd), expected.vd);
  assert.ok(Math.abs(shot.nez.n - expected.n) <= TOL);
  assert.ok(Math.abs(shot.nez.e - expected.e) <= TOL);
  assert.ok(Math.abs(shot.nez.z - expected.z) <= TOL);
}

test("default job units stay ftUS (usft), not international foot", () => {
  assert.equal(createBlankJob("GOLDENS").units, "usft");
});

test("MEAS LCD exposes keyed SD / ZA / HR on the existing gun, not a second screen", () => {
  assert.match(gm50, /onEditField\?: \(field: "za" \| "hr" \| "sd"\) => void/);
  assert.match(gm50, /onClick=\{\(\) => onEditField\?\.\("za"\)\}/);
  assert.match(gm50, /onClick=\{\(\) => onEditField\?\.\("hr"\)\}/);
  assert.match(gm50, /onClick=\{\(\) => onEditField\?\.\("sd"\)\}/);
  assert.match(fieldApp, /padField, setPadField\] = useState<"sd" \| "za" \| "hr">/);
  assert.match(fieldApp, /if \(padField === "za"\) \{/);
  assert.match(fieldApp, /setKeyedZa\(n\)/);
  assert.match(fieldApp, /if \(padField === "hr"\) \{/);
  assert.match(fieldApp, /setKeyedHa\(n\)/);
  assert.match(fieldApp, /if \(padField === "sd"\) \{/);
  assert.match(fieldApp, /setSdKeyed\(true\)/);
  assert.match(fieldApp, /resolveKeyedObs\(/);
  assert.match(fieldApp, /if \(sdKeyed\) return/);
  assert.match(fieldApp, /zaShown = keyedZa \?\? reading\.za/);
  assert.match(fieldApp, /haShown = keyedHa \?\? reading\.ha/);
  assert.doesNotMatch(fieldApp, /Calculate position/);
});

test("STORE HT follows MEAS MODE P/NP, not the live EDM lock, and STORE does not flip MEAS MODE", () => {
  assert.equal(htForMeasMode("P", HT_IR), HT_IR);
  assert.equal(htForMeasMode("NP", HT_IR), HT_RL);
  assert.match(fieldApp, /htForMeasMode\(/);
  assert.match(fieldApp, /prism=\{prismKeyed\}/);
  assert.match(fieldApp, /onTogglePrism=\{\(\) => setPrismKeyed\(\(v\) => !v\)\}/);
  assert.match(gm50, /MEAS MODE \{mode\}/);
  assert.doesNotMatch(fieldApp, /laser \? laser\.kind === "prism"/);
  assert.doesNotMatch(fieldApp, /setPrismKeyed\(false\)/);
  assert.doesNotMatch(fieldApp, /setPrismKeyed\(true\)/);
});

test("G01 level north", () => {
  const s = keyedStore({ ha: 0, za: 90, sd: 100, ht: HT_IR });
  assertNez(s, { n: 5100, e: 2000, z: 800.15, hd: 100, vd: 0 });
});

test("G02 zenith up", () => {
  const s = keyedStore({ ha: 0, za: 60, sd: 100, ht: HT_IR });
  assertNez(s, { n: 5086.6, e: 2000, z: 850.15, hd: 86.6, vd: 50 });
});

test("G03 zenith down stays P / HT 5.00 / Z 750.15; live ground lock does not apply HT 0", () => {
  const { obs, s } = storeFromKeys(
    { ha: 0, za: 120, sd: 100, measMode: "P" },
    { za: 120, ha: 0, sd: 100, occupyHt: HT_IR },
  );
  assert.equal(obs.measMode, "P");
  assert.equal(obs.ht, HT_IR);
  assertNez(s, { n: 5086.6, e: 2000, z: 750.15, hd: 86.6, vd: -50 });
  const qaMiss = keyedStore({ ha: 0, za: 120, sd: 100, ht: htForMeasMode("NP", HT_IR) });
  assert.equal(r2(qaMiss.nez.z), 755.15);
});

test("G04 east forward holds keyed V 90°00'00″; live 90°01'40″ is ignored", () => {
  const liveZa = 90 + 1 / 60 + 40 / 3600;
  const { obs, s } = storeFromKeys(
    { ha: 90, za: 90, sd: 50, measMode: "P" },
    { za: liveZa, ha: 90, sd: 50 },
  );
  assert.equal(obs.za, 90);
  assertNez(s, { n: 5000, e: 2050, z: 800.15, hd: 50, vd: 0 });
});

test("G05 SW quadrant", () => {
  const s = keyedStore({ ha: 225, za: 90, sd: 100, ht: HT_IR });
  assertNez(s, { n: 4929.29, e: 1929.29, z: 800.15 });
});

test("G06 inverse 100→201", () => {
  const inv = inverse(STA, { n: 5100, e: 2100, z: 800 });
  assert.equal(r2(inv.hd), 141.42);
  assert.equal(r2(inv.az), 45);
});

test("G07 HR 90 after occupy + north BS + 0SET", () => {
  const bs = { n: 5200, e: 2000, z: 800 };
  const azAtZero = inverse(STA, bs).az;
  assert.equal(r2(azAtZero), 0);
  const after0set = liveAzimuth(circleStation(azAtZero), 0, null, 0);
  assert.equal(r2(after0set), 0);
  const s = keyedStore({ ha: 90, za: 90, sd: 50, ht: HT_IR, azAtZero });
  assertNez(s, { n: 5000, e: 2050, z: 800.15 });
});

test("G08 set azimuth 45, no BS", () => {
  const s = keyedStore({ ha: 45, za: 90, sd: 100, ht: HT_IR, azAtZero: 0 });
  assertNez(s, { n: 5070.71, e: 2070.71, z: 800.15 });
});

test("G09 same keyed shot: P → Z 800.15 HT 5, NP → Z 805.15 HT 0 even when EDM is prism-locked", () => {
  const live = { za: 90, ha: 0, sd: 100, occupyHt: HT_IR };
  const ir = storeFromKeys({ ha: 0, za: 90, sd: 100, measMode: "P" }, live);
  const rl = storeFromKeys({ ha: 0, za: 90, sd: 100, measMode: "NP" }, live);
  assert.equal(ir.obs.measMode, "P");
  assert.equal(rl.obs.measMode, "NP");
  assert.equal(ir.obs.ht, HT_IR);
  assert.equal(rl.obs.ht, HT_RL);
  assert.equal(r2(ir.s.nez.n), 5100);
  assert.equal(r2(rl.s.nez.n), 5100);
  assert.equal(r2(ir.s.nez.e), 2000);
  assert.equal(r2(rl.s.nez.e), 2000);
  assert.equal(r2(ir.s.nez.z), 800.15);
  assert.equal(r2(rl.s.nez.z), 805.15);
});

test("G10 G11 DD resection left/right of A→B", () => {
  const a = { n: 5000, e: 2000, z: 800 };
  const b = { n: 5000, e: 2400, z: 800 };
  const ix = distanceDistance(a, b, 300, 500);
  assert.ok(ix);
  assert.equal(r2(ix.left.n), 5300);
  assert.equal(r2(ix.left.e), 2000);
  assert.equal(r2(ix.right.n), 4700);
  assert.equal(r2(ix.right.e), 2000);
});

test("G12 PNEZD radiation rows at 0.01 ftUS", () => {
  const a = keyedStore({ ha: 0, za: 90, sd: 100, ht: HT_IR });
  const b = keyedStore({ ha: 90, za: 90, sd: 50, ht: HT_IR });
  const row = (name: string, shot: typeof a, desc: string) =>
    [name, r2(shot.nez.n).toFixed(2), r2(shot.nez.e).toFixed(2), r2(shot.nez.z).toFixed(2), desc].join(",");
  assert.equal(row("201", a, "FS-N"), "201,5100.00,2000.00,800.15,FS-N");
  assert.equal(row("202", b, "FS-E"), "202,5000.00,2050.00,800.15,FS-E");
});
