import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const coordsSrc = readFileSync(join(root, "src/lib/survey/coords.ts"), "utf8");

const DEG = Math.PI / 180;
const STA = { n: 5000, e: 2000, z: 800 };
const HI = 5.15;
const HT_IR = 5;

function r2(n) {
  return Math.round(n * 100) / 100;
}

function radiation({ station, hi, ht, az, za, distance }) {
  const sinZ = Math.sin(za * DEG);
  const cosZ = Math.cos(za * DEG);
  const sd = distance;
  const hd = sd * sinZ;
  const vd = sd * cosZ;
  const azr = ((az % 360) + 360) % 360 * DEG;
  return {
    hd,
    vd,
    nez: {
      n: station.n + hd * Math.cos(azr),
      e: station.e + hd * Math.sin(azr),
      z: station.z + hi + vd - ht,
    },
  };
}

function shot(az, za, sd, ht = HT_IR) {
  return radiation({ station: STA, hi: HI, ht, az, za, distance: sd });
}

test("coords.ts radiation matches spec formulas", () => {
  assert.match(coordsSrc, /hd = sd \* sinZ/);
  assert.match(coordsSrc, /const vd = sd \* cosZ/);
  assert.match(coordsSrc, /station\.z \+ args\.hi \+ vd - args\.ht/);
  assert.match(coordsSrc, /hd \* Math\.cos\(az\)/);
  assert.match(coordsSrc, /hd \* Math\.sin\(az\)/);
});

test("G01 level north", () => {
  const s = shot(0, 90, 100);
  assert.equal(r2(s.hd), 100);
  assert.equal(r2(s.vd), 0);
  assert.equal(r2(s.nez.n), 5100);
  assert.equal(r2(s.nez.e), 2000);
  assert.equal(r2(s.nez.z), 800.15);
});

test("G02 zenith up", () => {
  const s = shot(0, 60, 100);
  assert.equal(r2(s.hd), 86.6);
  assert.equal(r2(s.vd), 50);
  assert.equal(r2(s.nez.n), 5086.6);
  assert.equal(r2(s.nez.e), 2000);
  assert.equal(r2(s.nez.z), 850.15);
});

test("G03 zenith down", () => {
  const s = shot(0, 120, 100);
  assert.equal(r2(s.hd), 86.6);
  assert.equal(r2(s.vd), -50);
  assert.equal(r2(s.nez.n), 5086.6);
  assert.equal(r2(s.nez.e), 2000);
  assert.equal(r2(s.nez.z), 750.15);
});

test("G04 east forward", () => {
  const s = shot(90, 90, 50);
  assert.equal(r2(s.nez.n), 5000);
  assert.equal(r2(s.nez.e), 2050);
  assert.equal(r2(s.nez.z), 800.15);
});

test("G05 SW quadrant", () => {
  const s = shot(225, 90, 100);
  assert.equal(r2(s.nez.n), 4929.29);
  assert.equal(r2(s.nez.e), 1929.29);
  assert.equal(r2(s.nez.z), 800.15);
});

test("G07 HR 90 after north 0SET", () => {
  const s = shot(90, 90, 50);
  assert.equal(r2(s.nez.n), 5000);
  assert.equal(r2(s.nez.e), 2050);
  assert.equal(r2(s.nez.z), 800.15);
});

test("G08 set azimuth 45", () => {
  const s = shot(45, 90, 100);
  assert.equal(r2(s.nez.n), 5070.71);
  assert.equal(r2(s.nez.e), 2070.71);
  assert.equal(r2(s.nez.z), 800.15);
});

test("G09 IR vs RL height", () => {
  const ir = shot(0, 90, 100, 5);
  const rl = shot(0, 90, 100, 0);
  assert.equal(r2(ir.nez.n), 5100);
  assert.equal(r2(rl.nez.n), 5100);
  assert.equal(r2(ir.nez.z), 800.15);
  assert.equal(r2(rl.nez.z), 805.15);
});

test("G12 radiation rows", () => {
  const a = shot(0, 90, 100);
  const b = shot(90, 90, 50);
  assert.equal(r2(a.nez.n), 5100);
  assert.equal(r2(a.nez.e), 2000);
  assert.equal(r2(a.nez.z), 800.15);
  assert.equal(r2(b.nez.n), 5000);
  assert.equal(r2(b.nez.e), 2050);
  assert.equal(r2(b.nez.z), 800.15);
});
