import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { inverse, liveAzimuth, radiation, distanceDistance } from "./coords.ts";
import { createBlankJob } from "./demo.ts";
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
  assert.match(fieldApp, /if \(padField === "za"\) inst\.setManual\(\{ za: n \}\)/);
  assert.match(fieldApp, /if \(padField === "hr"\) inst\.setManual\(\{ ha: n \}\)/);
  assert.match(fieldApp, /if \(padField === "sd"\) setDistStr\(String\(n\)\)/);
  assert.match(fieldApp, /keyed \? Number\(distStr\) : laser\?\.sd/);
  assert.match(fieldApp, /if \(Number\(distStr\) > 0\) {\s*store\(\);/s);
  assert.doesNotMatch(fieldApp, /Calculate position/);
});

test("G01 level north", () => {
  const s = keyedStore({ ha: 0, za: 90, sd: 100, ht: HT_IR });
  assertNez(s, { n: 5100, e: 2000, z: 800.15, hd: 100, vd: 0 });
});

test("G02 zenith up", () => {
  const s = keyedStore({ ha: 0, za: 60, sd: 100, ht: HT_IR });
  assertNez(s, { n: 5086.6, e: 2000, z: 850.15, hd: 86.6, vd: 50 });
});

test("G03 zenith down", () => {
  const s = keyedStore({ ha: 0, za: 120, sd: 100, ht: HT_IR });
  assertNez(s, { n: 5086.6, e: 2000, z: 750.15, hd: 86.6, vd: -50 });
});

test("G04 east forward", () => {
  const s = keyedStore({ ha: 90, za: 90, sd: 50, ht: HT_IR });
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

test("G09 IR vs RL height", () => {
  const ir = keyedStore({ ha: 0, za: 90, sd: 100, ht: HT_IR });
  const rl = keyedStore({ ha: 0, za: 90, sd: 100, ht: HT_RL });
  assert.equal(r2(ir.nez.n), 5100);
  assert.equal(r2(rl.nez.n), 5100);
  assert.equal(r2(ir.nez.e), 2000);
  assert.equal(r2(rl.nez.e), 2000);
  assert.equal(r2(ir.nez.z), 800.15);
  assert.equal(r2(rl.nez.z), 805.15);
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
