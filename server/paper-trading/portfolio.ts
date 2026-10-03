/**
 * PaperPortfolio — PAPER MONEY ONLY.
 *
 * Tracks cash and a single position (long, short, or flat). There are no
 * broker integrations, no order routing, no real-money code paths in this
 * module — fills are simulated against the simulated feed at the bar's
 * price. A fill is emitted only when a position CLOSES, producing the
 * completed round-trip record the hash-chained ledger expects.
 */

export type Side = "long" | "short";

export interface Fill {
  side: Side;
  entryTs: string;
  exitTs: string;
  entryPrice: number;
  exitPrice: number;
  /** Notional USD committed to the trade. */
  sizeUsd: number;
  /** Flat simulated fee per completed trade. */
  feesUsd: number;
  /** Gross realized P&L in USD (fees tracked separately). */
  realizedPnlUsd: number;
}

export interface PortfolioOptions {
  startingCashUsd: number;
  /** Fixed notional per trade, e.g. 1000. */
  notionalUsd: number;
  /** Flat fee charged per completed round trip. */
  feePerTradeUsd: number;
}

interface OpenPosition {
  side: Side;
  entryTs: string;
  entryPrice: number;
  sizeUsd: number;
}

const round2 = (n: number): number => {
  if (!Number.isFinite(n)) throw new Error(`non-finite money value: ${n}`);
  return Math.round(n * 100) / 100;
};

export class PaperPortfolio {
  private cash: number;
  private readonly notionalUsd: number;
  private readonly feePerTradeUsd: number;
  private position: OpenPosition | null = null;
  private fills: Fill[] = [];

  constructor(opts: PortfolioOptions) {
    this.cash = opts.startingCashUsd;
    this.notionalUsd = opts.notionalUsd;
    this.feePerTradeUsd = opts.feePerTradeUsd;
  }

  /**
   * Move toward the desired side at the given price/ts.
   * Opens, flips (close + open), or holds. Returns the closing fill
   * when a position was closed, otherwise null.
   */
  target(side: Side, price: number, ts: string): Fill | null {
    let closed: Fill | null = null;
    if (this.position && this.position.side !== side) {
      closed = this.close(price, ts);
    }
    if (!this.position) {
      this.position = { side, entryTs: ts, entryPrice: price, sizeUsd: this.notionalUsd };
    }
    return closed;
  }

  /** Flatten at the given price/ts (end of run). Returns the fill or null. */
  flatten(price: number, ts: string): Fill | null {
    return this.position ? this.close(price, ts) : null;
  }

  private close(exitPrice: number, exitTs: string): Fill {
    const pos = this.position as OpenPosition;
    const gross =
      pos.side === "long"
        ? ((exitPrice - pos.entryPrice) / pos.entryPrice) * pos.sizeUsd
        : ((pos.entryPrice - exitPrice) / pos.entryPrice) * pos.sizeUsd;
    const fill: Fill = {
      side: pos.side,
      entryTs: pos.entryTs,
      exitTs,
      entryPrice: round2(pos.entryPrice),
      exitPrice: round2(exitPrice),
      sizeUsd: round2(pos.sizeUsd),
      feesUsd: round2(this.feePerTradeUsd),
      realizedPnlUsd: round2(gross),
    };
    this.cash += gross - this.feePerTradeUsd;
    this.position = null;
    this.fills.push(fill);
    return fill;
  }

  get allFills(): readonly Fill[] {
    return this.fills;
  }

  get cashUsd(): number {
    return round2(this.cash);
  }

  get openSide(): Side | null {
    return this.position?.side ?? null;
  }
}
