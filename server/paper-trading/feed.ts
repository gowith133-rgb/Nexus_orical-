/**
 * SimulatedFeed — a SIMULATED price feed (geometric random walk).
 *
 * This is NOT market data. There are no API keys, no websockets, no broker
 * connections anywhere in the paper-trading module. Every price is produced
 * locally by a seeded pseudo-random generator, so runs are reproducible.
 *
 * The simulation exists for one purpose: to exercise the strategy,
 * portfolio, and hash-chained ledger logic with realistic-looking price
 * action before anything ever touches real data.
 */

export interface SimBar {
  index: number;
  /** ISO-8601 UTC, no milliseconds, e.g. "2026-10-01T00:01:00Z" */
  ts: string;
  price: number;
}

export interface FeedOptions {
  /** Deterministic seed — same seed, same prices, every run. */
  seed: number;
  startPrice: number;
  /** Per-bar volatility (std dev of log returns), e.g. 0.004 = 0.4%/bar. */
  volatility: number;
  /** Per-bar drift of log returns. Default 0 (no edge baked in). */
  drift?: number;
  /** ISO-8601 UTC timestamp of bar 0. */
  startTs: string;
  /** Seconds between bars. */
  barSeconds: number;
}

/** mulberry32 — small seeded PRNG, good enough for a simulation. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal via Box-Muller, driven by the seeded PRNG. */
function gaussian(rand: () => number): number {
  const u1 = Math.max(rand(), 1e-12);
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export class SimulatedFeed {
  private readonly rand: () => number;
  private readonly opts: Required<FeedOptions>;
  private price: number;

  constructor(opts: FeedOptions) {
    this.opts = { drift: 0, ...opts };
    this.rand = mulberry32(this.opts.seed);
    this.price = this.opts.startPrice;
  }

  /** Generate `count` bars of geometric Brownian motion. */
  *bars(count: number): Generator<SimBar> {
    const startMs = Date.parse(this.opts.startTs);
    if (Number.isNaN(startMs)) {
      throw new Error(`bad startTs: ${this.opts.startTs}`);
    }
    const { volatility: sigma, drift, barSeconds } = this.opts;
    for (let i = 0; i < count; i++) {
      const z = gaussian(this.rand);
      // GBM step: dS/S = drift*dt + sigma*sqrt(dt)*z   (dt = 1 bar)
      this.price = this.price * Math.exp(drift - 0.5 * sigma * sigma + sigma * z);
      const ts = new Date(startMs + i * barSeconds * 1000)
        .toISOString()
        .replace(/\.\d{3}Z$/, "Z");
      yield { index: i, ts, price: this.price };
    }
  }
}
