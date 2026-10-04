/**
 * risk.ts — the four safety rails. PAPER MONEY ONLY.
 *
 * These limits are HARDCODED in this file on purpose. They are not read
 * from a config file, an environment variable, or a command-line flag,
 * so loosening them requires editing this source file — a deliberate,
 * reviewable act, not a quiet config tweak.
 *
 * The four rails:
 *   1. Drawdown circuit breaker — halt if equity falls too far below its peak.
 *   2. Daily loss kill-switch  — halt if one UTC day's net loss is too deep.
 *   3. Hardcoded limits        — this file (see above).
 *   4. Halt, don't repair      — once halted, the governor latches. It never
 *      clears the breach and resumes on its own; a human restarts the run.
 *
 * Nothing here touches real market data, real orders, or real money.
 */

export const RISK_LIMITS = Object.freeze({
  /** Paper starting equity, USD. */
  STARTING_EQUITY_USD: 10_000,
  /** Maximum notional USD committed to a single trade. */
  MAX_NOTIONAL_USD: 1_000,
  /** Halt when equity drops this % below its running peak. */
  MAX_DRAWDOWN_PCT: 8,
  /** Halt when one UTC day's net (realized P&L minus fees) is worse than -$X. */
  DAILY_LOSS_LIMIT_USD: 300,
});

/** Thrown (and latched) when any rail is breached. */
export class RiskHalt extends Error {
  readonly rail: string;
  constructor(rail: string, detail: string) {
    super(`RISK HALT [${rail}]: ${detail}`);
    this.name = "RiskHalt";
    this.rail = rail;
  }
}

/**
 * RiskGovernor — observes the run and pulls the plug on breach.
 *
 * Call observe() once per bar with mark-to-market equity, the bar's UTC
 * day, and any just-realized delta. On breach it throws RiskHalt and
 * latches: every later call throws the same halt, so the engine cannot
 * "recover" mid-run and keep trading. Only a fresh process (a human
 * decision to restart) clears it.
 */
export class RiskGovernor {
  private peak: number;
  private readonly dayNet = new Map<string, number>();
  private latched: RiskHalt | null = null;

  constructor(startingEquityUsd: number = RISK_LIMITS.STARTING_EQUITY_USD) {
    if (!Number.isFinite(startingEquityUsd) || startingEquityUsd <= 0) {
      throw new Error(`bad starting equity: ${startingEquityUsd}`);
    }
    this.peak = startingEquityUsd;
  }

  get halted(): boolean {
    return this.latched !== null;
  }

  get haltReason(): string | null {
    return this.latched ? this.latched.message : null;
  }

  /**
   * @param equityUsd        cash + unrealized P&L right now
   * @param dayKey           UTC day, e.g. "2026-09-01"
   * @param realizedDeltaUsd net just realized this step (realized P&L minus
   *                         fees), 0 when nothing closed
   */
  observe(equityUsd: number, dayKey: string, realizedDeltaUsd: number): void {
    // One-way latch: a halted governor never un-halts itself.
    if (this.latched) throw this.latched;
    if (!Number.isFinite(equityUsd)) {
      this.latched = new RiskHalt("bad-input", `non-finite equity: ${equityUsd}`);
      throw this.latched;
    }

    // Rail 1 — drawdown circuit breaker (peak-to-trough on total equity).
    if (equityUsd > this.peak) this.peak = equityUsd;
    const drawdownPct = ((this.peak - equityUsd) / this.peak) * 100;
    if (drawdownPct > RISK_LIMITS.MAX_DRAWDOWN_PCT) {
      this.latched = new RiskHalt(
        "drawdown-breaker",
        `equity $${equityUsd.toFixed(2)} is ${drawdownPct.toFixed(2)}% below the $${this.peak.toFixed(2)} peak (limit ${RISK_LIMITS.MAX_DRAWDOWN_PCT}%)`
      );
      throw this.latched;
    }

    // Rail 2 — daily loss kill-switch (realized, net of fees, per UTC day).
    const net = (this.dayNet.get(dayKey) ?? 0) + realizedDeltaUsd;
    this.dayNet.set(dayKey, net);
    if (net < -RISK_LIMITS.DAILY_LOSS_LIMIT_USD) {
      this.latched = new RiskHalt(
        "daily-loss-kill-switch",
        `${dayKey} net $${net.toFixed(2)} is worse than -$${RISK_LIMITS.DAILY_LOSS_LIMIT_USD}`
      );
      throw this.latched;
    }
  }
}
