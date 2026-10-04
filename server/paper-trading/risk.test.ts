#!/usr/bin/env node
/**
 * risk.test.ts — deliberate breach tests for the four safety rails.
 *
 * Run: node server/paper-trading/risk.test.ts
 * Exits 0 when every check passes, 1 otherwise. stdlib only.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { RISK_LIMITS, RiskGovernor, RiskHalt } from "./risk.ts";
import { PaperPortfolio } from "./portfolio.ts";
import { HashChainedLedger } from "./ledger.ts";

let failures = 0;

function check(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`ok   - ${name}`);
  } catch (e) {
    failures++;
    console.log(`FAIL - ${name}: ${(e as Error).message}`);
  }
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

// Rail 1: drawdown circuit breaker trips past the hardcoded %.
check("drawdown breaker halts past the limit", () => {
  const g = new RiskGovernor(10_000);
  g.observe(10_000, "2026-09-01", 0);
  g.observe(10_500, "2026-09-01", 0); // new peak: 10500
  let halt: unknown = null;
  try {
    g.observe(10_500 * 0.9, "2026-09-01", 0); // -10% from peak
  } catch (e) {
    halt = e;
  }
  assert(halt instanceof RiskHalt, "expected a RiskHalt");
  assert((halt as RiskHalt).rail === "drawdown-breaker", "expected the drawdown rail");
});

// Rail 2: daily loss kill-switch trips past -$X in one UTC day.
check("daily loss kill-switch halts past the limit", () => {
  const g = new RiskGovernor(10_000);
  let halt: unknown = null;
  try {
    g.observe(9_900, "2026-09-02", -100);
    g.observe(9_750, "2026-09-02", -150);
    g.observe(9_600, "2026-09-02", -60); // day net: -310
  } catch (e) {
    halt = e;
  }
  assert(halt instanceof RiskHalt, "expected a RiskHalt");
  assert((halt as RiskHalt).rail === "daily-loss-kill-switch", "expected the daily-loss rail");
});

// Rail 2 (boundary): losses reset per UTC day.
check("daily loss tallies reset on a new UTC day", () => {
  const g = new RiskGovernor(10_000);
  g.observe(9_800, "2026-09-03", -200);
  g.observe(9_600, "2026-09-04", -200); // new day: -200 alone is fine
  assert(!g.halted, "should not be halted");
});

// Rail 4: the halt latches — it never auto-clears, even on good news.
check("halted governor never resumes on its own", () => {
  const g = new RiskGovernor(10_000);
  try {
    g.observe(9_000, "2026-09-05", 0);
  } catch {
    /* expected */
  }
  assert(g.halted, "should be halted");
  let threw = false;
  try {
    g.observe(20_000, "2026-09-06", 5_000); // great news changes nothing
  } catch (e) {
    threw = e instanceof RiskHalt;
  }
  assert(threw, "observe() after a halt must still throw");
});

// Rail 3: notional above the hardcoded ceiling is refused at construction.
check("notional above the hardcoded ceiling is refused", () => {
  let threw = false;
  try {
    new PaperPortfolio({
      startingCashUsd: 10_000,
      notionalUsd: RISK_LIMITS.MAX_NOTIONAL_USD + 1,
      feePerTradeUsd: 2.5,
    });
  } catch {
    threw = true;
  }
  assert(threw, "expected the ceiling to refuse");
});

// Rail 3: the ceiling itself is still allowed.
check("notional at exactly the ceiling is allowed", () => {
  new PaperPortfolio({
    startingCashUsd: 10_000,
    notionalUsd: RISK_LIMITS.MAX_NOTIONAL_USD,
    feePerTradeUsd: 2.5,
  });
});

// Sanity: ordinary losses inside every limit do not halt.
check("losses inside the limits do not halt", () => {
  const g = new RiskGovernor(10_000);
  g.observe(9_900, "2026-09-07", -100);
  g.observe(9_850, "2026-09-07", -50);
  g.observe(9_900, "2026-09-07", 0);
  assert(!g.halted, "should not be halted");
});

// Reconciliation: verifyChain passes on a clean log...
check("ledger reconciliation passes on a clean log", () => {
  const path = "/tmp/risk-test-clean.jsonl";
  const ledger = new HashChainedLedger(path, { pair: "WETH/USDC", strategy: "test" });
  const p = new PaperPortfolio({ startingCashUsd: 10_000, notionalUsd: 1_000, feePerTradeUsd: 2.5 });
  p.target("long", 2500, "2026-09-01T00:00:00Z");
  const fill = p.target("short", 2600, "2026-09-01T01:00:00Z");
  if (fill) ledger.append(fill);
  assert(ledger.verifyChain(), "clean chain should verify");
});

// ...and catches a tampered line.
check("ledger reconciliation catches a tampered line", () => {
  const path = "/tmp/risk-test-tampered.jsonl";
  const ledger = new HashChainedLedger(path, { pair: "WETH/USDC", strategy: "test" });
  const p = new PaperPortfolio({ startingCashUsd: 10_000, notionalUsd: 1_000, feePerTradeUsd: 2.5 });
  p.target("long", 2500, "2026-09-01T00:00:00Z");
  const fill = p.target("short", 2600, "2026-09-01T01:00:00Z");
  if (fill) ledger.append(fill);
  // Tamper: rewrite line 1 with an edited P&L, keeping the old hash.
  const lines = readFileSync(path, "utf8").split("\n").filter((l) => l.trim());
  const rec = JSON.parse(lines[0]) as Record<string, unknown>;
  rec["realized_pnl_usd"] = 999_999;
  writeFileSync(path, JSON.stringify(rec) + "\n", "utf8");
  assert(!ledger.verifyChain(), "tampered chain must NOT verify");
});

console.log("----------------------------------------------------------------");
if (failures > 0) {
  console.log(`${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("all risk checks passed");
