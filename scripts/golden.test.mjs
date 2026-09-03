import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("spec GOLDEN-CASES G01–G12 via real radiation / liveAzimuth", () => {
  const r = spawnSync("bun", ["test", "src/lib/survey/golden.test.ts"], {
    cwd: root,
    encoding: "utf8",
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  assert.equal(r.status, 0, "golden radiation cases must pass");
});
