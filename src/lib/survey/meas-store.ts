/**
 * Keyed MEAS/STORE observations.
 *
 * MEAS MODE P/NP is user-keyed. STORE must not change it or take HT from the
 * live EDM lock. P applies occupy HT (IR default 5.00); NP is RL HT 0.
 * Keyed V / HR / SD stay until the user keys a new one.
 */

export type MeasMode = "P" | "NP";

export function measModeFromPrism(prism: boolean): MeasMode {
  return prism ? "P" : "NP";
}

/** P uses occupy HT; NP uses 0. Occupy header HT is unchanged. */
export function htForMeasMode(mode: MeasMode, occupyHt: number): number {
  return mode === "P" ? occupyHt : 0;
}

export function resolveKeyedObs(args: {
  keyedZa: number | null;
  keyedHa: number | null;
  keyedSd: number | null;
  measMode: MeasMode;
  liveZa: number;
  liveHa: number;
  liveSd: number | null;
  occupyHt: number;
}): {
  ha: number;
  za: number;
  sd: number | null;
  ht: number;
  measMode: MeasMode;
} {
  return {
    ha: args.keyedHa ?? args.liveHa,
    za: args.keyedZa ?? args.liveZa,
    sd: args.keyedSd ?? args.liveSd,
    ht: htForMeasMode(args.measMode, args.occupyHt),
    measMode: args.measMode,
  };
}
