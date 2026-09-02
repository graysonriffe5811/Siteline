# SIGHTLINE golden cases (v1 list)

Status: **active**. Repo is github.com/graysonriffe5811/Siteline. Source imported from Grok Build Mode 2026-09-02.
Source of formulas: skill SIGHTLINE COGO. If Build Mode and CLI disagree, this spec wins.
Default units: **ftUS**. Angles: **DMS**. Azimuth: **north-origin, clockwise**.
Tolerance: **0.01 ft** and **1″**. No GNSS / geoid / combined factor.
Trainer / check-calc grid. Not a fake ALTA. Not live job coordinates.

Shared occupy unless a case names another station:

- STA **100**: N **5000.00** E **2000.00** Z **800.00** ftUS
- HI **5.15**
- IR default HT **5.00**; RL HT **0**
- Vocabulary: occupy, backsight, Measure, 0SET. Gun: Topcon GM-50. Collector: Trimble Access.

Expected N/E/Z below are **computed from the skill formulas**, not from any UI.

---

## G01 Level north

**Given:** occupy 100. HT 5.00 (IR). SD 100.00. ZA 90°00'00". Az 0°00'00".
**Checks:** ZA 90° ⇒ HD = SD, VD = 0. Forward north.
**Expected:** HD 100.00  VD 0.00  N 5100.00  E 2000.00  Z 800.15
**Z:** 800.00 + 5.15 + 0.00 − 5.00

## G02 Zenith up

**Given:** occupy 100. HT 5.00. SD 100.00. ZA 60°00'00". Az 0°00'00".
**Checks:** HD = SD · sin(ZA), VD = SD · cos(ZA) (up).
**Expected:** HD 86.60  VD 50.00  N 5086.60  E 2000.00  Z 850.15
(HD 86.602540… rounds to 86.60 at 0.01 ft)

## G03 Zenith down

**Given:** occupy 100. HT 5.00. SD 100.00. ZA 120°00'00". Az 0°00'00".
**Checks:** same HD as G02, negative VD.
**Expected:** HD 86.60  VD −50.00  N 5086.60  E 2000.00  Z 750.15

## G04 East forward

**Given:** occupy 100. HT 5.00. SD 50.00. ZA 90°00'00". Az 90°00'00".
**Checks:** north-CW: Az 90° is +E, ΔN = 0.
**Expected:** HD 50.00  VD 0.00  N 5000.00  E 2050.00  Z 800.15

## G05 SW quadrant

**Given:** occupy 100. HT 5.00. SD 100.00. ZA 90°00'00". Az 225°00'00".
**Checks:** ΔN = HD·cos(az), ΔE = HD·sin(az). Catches east-origin or CCW bugs.
**Expected:** HD 100.00  VD 0.00  N 4929.29  E 1929.29  Z 800.15
(ΔN = ΔE = −70.710678… → −70.71)

## G06 Inverse

**Given:** from 100 (N 5000.00 E 2000.00) to 201 (N 5100.00 E 2100.00). Inverse az + HD. No SD/ZA.
**Checks:** inverse of the same ΔN/ΔE basis as forward.
**Expected:** Az 45°00'00"  HD 141.42
(HD 141.421356… rounds to 141.42)

## G07 Occupy + backsight

**Given:** occupy 100. BS 101: N 5200.00 E 2000.00 Z 800.00 (due north). 0SET on BS. Measure FS: HR 90°00'00"  ZA 90°00'00"  SD 50.00  HT 5.00.
**Checks:** after 0SET on a north BS, HR = azimuth.
**Expected:** FS N 5000.00  E 2050.00  Z 800.15

## G08 Set azimuth (no BS)

**Given:** occupy 100. No backsight. Keyed Az 45°00'00". SD 100.00. ZA 90°00'00". HT 5.00.
**Expected:** N 5070.71  E 2070.71  Z 800.15
(ΔN = ΔE = 70.710678… → 70.71)

## G09 IR vs RL height

**Given:** occupy 100. Same shot twice: SD 100.00, ZA 90°00'00", Az 0°00'00". Shot A HT 5.00 (IR default). Shot B HT 0 (RL).
**Checks:** N/E identical. Z differs by HT only. Z = Zsta + HI + VD − HT.
**Expected:** both N 5100.00 E 2000.00. Z_IR 800.15. Z_RL 805.15

## G10 DD resection left of A→B

**Given:** known A = 100 (N 5000.00 E 2000.00). Known B = 102 (N 5000.00 E 2400.00). Measured HD to A 300.00, HD to B 500.00. Pick **left** of A→B. Occupy computed station. N/E only (no Z claim).
**A→B** is due east. Left is north.
**Expected:** N 5300.00  E 2000.00

## G11 DD resection right of A→B

**Given:** same A, B, and distances as G10. Pick **right** of A→B.
**Expected:** N 4700.00  E 2000.00

## G12 PNEZD export

**Given:** occupy 100. Set Az (no BS). Store:
- 201: Az 0°00'00" ZA 90°00'00" SD 100.00 HT 5.00 desc `FS-N`
- 202: Az 90°00'00" ZA 90°00'00" SD 50.00 HT 5.00 desc `FS-E`
Export PNEZD CSV, ftUS, 0.01.

**Checks:** column order **P, N, E, Z, D**. Not PENZD.

**Expected rows:**
```
201,5100.00,2000.00,800.15,FS-N
202,5000.00,2050.00,800.15,FS-E
```

---

## Out of v1 (do not add)

- GNSS, geoid, combined factor
- Compass as a 0.01 ft golden (honesty: a couple of degrees)
- International foot as the default (may exist as a unit switch later; default stays ftUS)
- DXF
