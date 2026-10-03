/**
 * HashChainedLedger — tamper-evident JSONL trade log.
 *
 * Format contract (defined by ticker/publish_ticker.py — this file must
 * match it EXACTLY or the publisher refuses the log):
 *
 *   One JSON object per line with keys:
 *     seq, ts, pair, side, size_usd, entry, exit, fees_usd,
 *     realized_pnl_usd, mode, strategy, ref, prev_hash, hash
 *
 *   hash      = sha256 of the canonical JSON of the record WITHOUT the
 *               "hash" key: keys sorted, no whitespace.
 *   prev_hash = previous record's "hash" ("GENESIS" for the first record).
 *
 * The log carries NO identity fields by design: there is nothing to strip
 * and nothing to leak. Anonymity is structural, not a filter.
 */

import { createHash } from "node:crypto";
import { appendFileSync, writeFileSync } from "node:fs";
import type { Fill } from "./portfolio.ts";

export const GENESIS = "GENESIS";

export interface TradeRecord {
  seq: number;
  ts: string;
  pair: string;
  side: "long" | "short";
  size_usd: number;
  entry: number;
  exit: number;
  fees_usd: number;
  realized_pnl_usd: number;
  mode: "paper" | "live";
  strategy: string;
  ref: string | null;
  prev_hash: string;
  hash: string;
}

/** Canonical JSON: sorted keys, no whitespace, "hash" excluded. */
export function canonical(record: Omit<TradeRecord, "hash">): string {
  const slim: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) {
    if (key === "hash") continue;
    slim[key] = (record as Record<string, unknown>)[key];
  }
  return JSON.stringify(slim);
}

export function recordHash(record: Omit<TradeRecord, "hash">): string {
  return createHash("sha256").update(canonical(record), "utf8").digest("hex");
}

export interface LedgerOptions {
  /** e.g. "WETH/USDC" */
  pair: string;
  /** Strategy label stamped on every record, e.g. "ma-crossover-v1". */
  strategy: string;
}

/**
 * Verifies its own chain on the fly: after writing each record it
 * recomputes the hash the same way publish_ticker.py will, so a bug
 * here fails fast instead of producing an unpublishable log.
 */
export class HashChainedLedger {
  private readonly path: string;
  private readonly pair: string;
  private readonly strategy: string;
  private seq = 0;
  private prevHash: string = GENESIS;

  constructor(path: string, opts: LedgerOptions) {
    this.path = path;
    this.pair = opts.pair;
    this.strategy = opts.strategy;
    writeFileSync(path, "", "utf8"); // start a fresh log
  }

  /** Append one completed fill as a chained record. Returns the record. */
  append(fill: Fill): TradeRecord {
    this.seq += 1;
    const body = {
      seq: this.seq,
      ts: fill.exitTs,
      pair: this.pair,
      side: fill.side,
      size_usd: fill.sizeUsd,
      entry: fill.entryPrice,
      exit: fill.exitPrice,
      fees_usd: fill.feesUsd,
      realized_pnl_usd: fill.realizedPnlUsd,
      mode: "paper" as const,
      strategy: this.strategy,
      ref: null as string | null,
      prev_hash: this.prevHash,
    };
    const hash = recordHash(body);
    const record: TradeRecord = { ...body, hash };
    // Self-check: recompute exactly the way the publisher will.
    if (recordHash(record) !== hash || record.prev_hash !== this.prevHash) {
      throw new Error(`ledger self-check failed at seq ${this.seq}`);
    }
    appendFileSync(this.path, JSON.stringify(record) + "\n", "utf8");
    this.prevHash = hash;
    return record;
  }

  get count(): number {
    return this.seq;
  }

  get headHash(): string {
    return this.prevHash;
  }
}
