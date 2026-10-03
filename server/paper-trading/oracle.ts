/**
 * oracle.ts — the Orical signal-decay gate ("Oracle Protection").
 *
 * Every trading signal enters with a confidence score and an emission
 * timestamp. Confidence DECAYS over time toward a neutral baseline of
 * 0.500: a signal nobody refreshed is a signal the engine should trust
 * less. If a signal goes stale — decayed below the veto threshold, or
 * simply too old — the gate vetoes it and the trade never executes.
 * Fail closed: anything the gate cannot understand is vetoed, never
 * allowed through.
 *
 * The math is exponential half-life decay toward the baseline:
 *
 *   score(t) = 0.500 + (initial - 0.500) * 2^(-t / 900)
 *
 * where t is the signal's age in seconds and 900 s is the half-life.
 * Every 900 seconds the distance from the baseline halves: a 0.900
 * signal reads 0.700 after 15 minutes, 0.600 after 30, 0.550 after 45,
 * and creeps asymptotically toward 0.500 without ever quite reaching
 * it — which is why there is also a hard maximum signal age.
 *
 * Why this shape: it is "temporal humility" made executable. A fresh,
 * confident signal may act; an old one may not, no matter how confident
 * it once was. During a data outage or a network partition the scores
 * decay to neutral and execution halts, instead of the engine trading
 * on yesterday's news.
 */

export interface OracleSignal {
  /** Confidence at emission, 0.0–1.0. */
  confidence: number;
  /** Unix epoch seconds when the signal was emitted. */
  emittedAtSec: number;
}

export interface OracleVerdict {
  allowed: boolean;
  decayedScore: number;
  reason: string;
}

export interface OracleGateOptions {
  /** Veto when the decayed score drops strictly below this. Default 0.500. */
  vetoThreshold?: number;
  /** Veto when the signal is older than this many seconds. Default 3600. */
  maxSignalAgeSec?: number;
}

/** The neutral baseline every signal decays toward. */
export const ORICAL_BASELINE = 0.5;
/** Half-life of the decay, in seconds (15 minutes). */
export const ORICAL_HALF_LIFE_SEC = 900;

/**
 * Decay a signal's confidence toward the 0.500 baseline.
 *
 *   score(t) = 0.500 + (initial - 0.500) * 2^(-t/900)
 *
 * At t = 0 the score equals the initial confidence; as t grows the
 * score approaches 0.500 from whichever side it started on.
 * Returns NaN for non-finite or negative inputs (fail closed upstream).
 */
export function oricalScore(initial: number, ageSec: number): number {
  if (!Number.isFinite(initial) || !Number.isFinite(ageSec) || ageSec < 0) {
    return Number.NaN;
  }
  return (
    ORICAL_BASELINE +
    (initial - ORICAL_BASELINE) * Math.pow(2, -ageSec / ORICAL_HALF_LIFE_SEC)
  );
}

export class OracleGate {
  private readonly vetoThreshold: number;
  private readonly maxSignalAgeSec: number;

  constructor(opts: OracleGateOptions = {}) {
    this.vetoThreshold = opts.vetoThreshold ?? 0.5;
    this.maxSignalAgeSec = opts.maxSignalAgeSec ?? 3600;
  }

  /**
   * Judge one signal at one moment. Returns a verdict explaining itself.
   *
   * Veto rules, in order:
   *   1. Malformed input (missing signal, NaN/out-of-range confidence,
   *      bad timestamps, emission in the future) → veto. Fail closed.
   *   2. Signal older than maxSignalAgeSec → veto (stale, whatever the score).
   *   3. Decayed score strictly below vetoThreshold → veto.
   * Otherwise the signal is allowed through at its decayed score.
   */
  evaluate(
    signal: OracleSignal | null | undefined,
    nowSec: number
  ): OracleVerdict {
    // Rule 1 — fail closed on anything malformed.
    if (!signal || typeof signal !== "object") {
      return this.veto(Number.NaN, "invalid signal: missing signal object");
    }
    const { confidence, emittedAtSec } = signal;
    if (
      !Number.isFinite(confidence) ||
      confidence < 0 ||
      confidence > 1
    ) {
      return this.veto(
        Number.NaN,
        `invalid signal: confidence must be a number in [0,1], got ${String(
          confidence
        )}`
      );
    }
    if (!Number.isFinite(emittedAtSec)) {
      return this.veto(
        Number.NaN,
        "invalid signal: emittedAtSec must be a finite epoch timestamp"
      );
    }
    if (!Number.isFinite(nowSec)) {
      return this.veto(
        Number.NaN,
        "invalid signal: evaluation timestamp must be finite"
      );
    }
    const ageSec = nowSec - emittedAtSec;
    if (ageSec < 0) {
      return this.veto(
        Number.NaN,
        `invalid signal: emitted in the future (age ${ageSec}s)`
      );
    }

    // Rule 2 — hard age cap, regardless of score.
    if (ageSec > this.maxSignalAgeSec) {
      return this.veto(
        oricalScore(confidence, ageSec),
        `signal too old: age ${ageSec}s exceeds max ${this.maxSignalAgeSec}s`
      );
    }

    // Rule 3 — decayed below the threshold.
    const score = oricalScore(confidence, ageSec);
    if (score < this.vetoThreshold) {
      return this.veto(
        score,
        `decayed below threshold: ${score.toFixed(4)} < ${this.vetoThreshold}`
      );
    }

    return {
      allowed: true,
      decayedScore: score,
      reason: `score ${score.toFixed(4)} >= ${this.vetoThreshold}, age ${ageSec}s <= ${this.maxSignalAgeSec}s`,
    };
  }

  private veto(decayedScore: number, reason: string): OracleVerdict {
    return { allowed: false, decayedScore, reason: `vetoed: ${reason}` };
  }
}
