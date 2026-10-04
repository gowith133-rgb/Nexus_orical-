#!/usr/bin/env node
/**
 * Nexus paper-trading engine — SIMULATED PRICES, PAPER MONEY.
 *
 * Nothing here touches real market data or real money. Prices come from
 * SimulatedFeed (geometric random walk, seeded PRNG); fills are simulated
 * against those prices; every completed trade is appended to a
 * hash-chained JSONL log that ticker/publish_ticker.py verifies.
 *
 * Every signal passes through the Oracle gate (oracle.ts) before it can
 * execute: signals decay toward a neutral 0.500 baseline with a 15-minute
 * half-life, and stale signals are vetoed — the engine fails closed on
 * old or malformed intelligence instead of trading on it.
 *
 * Usage:
 *   node server/paper-trading/engine.js --bars 4000 --out trades.jsonl --seed 42
 *   (or: npx tsx server/paper-trading/engine.ts --bars 4000 --out trades.jsonl)
 *
 * Then publish the proof ticker:
 *   python3 ticker/publish_ticker.py trades.jsonl --out ticker/public
 *
 * Exit codes: 0 = clean run · 4 = risk halt (a rail was breached; the halt
 * latches and never auto-clears) · 5 = ledger reconciliation failure.
 */

import { SimulatedFeed } from "./feed.ts";
import { MovingAverageCrossover } from "./strategy.ts";
import { PaperPortfolio, type Fill } from "./portfolio.ts";
import { HashChainedLedger } from "./ledger.ts";
import { OracleGate } from "./oracle.ts";
import { RISK_LIMITS, RiskGovernor, RiskHalt } from "./risk.ts";

const PAIR = "WETH/USDC";
const STRATEGY_LABEL = "ma-crossover-v1";

/**
 * Confidence assigned to each crossover signal at emission.
 *
 * The MA crossover emits binary signals (long/short) with no native
 * confidence, so signals enter the Oracle gate at a fixed, documented
 * confidence. The gate's job here is temporal attenuation — vetoing
 * stale signals — not judging signal quality. A real scorer would set
 * this per signal.
 */
const SIGNAL_CONFIDENCE = 0.85;

function arg(name: string, def: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : def;
}

function main(): number {
  const bars = parseInt(arg("bars", "4000"), 10);
  const out = arg("out", "trades.jsonl");
  const seed = parseInt(arg("seed", "42"), 10);

  console.log("================================================================");
  console.log(" Nexus paper-trading engine");
  console.log(" SIMULATED prices · PAPER money · no market data · no brokers");
  console.log("================================================================");

  const feed = new SimulatedFeed({
    seed,
    startPrice: 2500,
    volatility: 0.004,
    startTs: "2026-09-01T00:00:00Z",
    barSeconds: 300, // 5-minute bars
  });
  const strategy = new MovingAverageCrossover(10, 30);
  // Rail 3 (hardcoded limits): sizing comes from risk.ts, not config.
  const portfolio = new PaperPortfolio({
    startingCashUsd: RISK_LIMITS.STARTING_EQUITY_USD,
    notionalUsd: RISK_LIMITS.MAX_NOTIONAL_USD,
    feePerTradeUsd: 2.5,
  });
  const ledger = new HashChainedLedger(out, { pair: PAIR, strategy: STRATEGY_LABEL });
  // Oracle Protection: veto signals below 0.500 decayed score or older than 1h.
  const gate = new OracleGate();
  // Risk rails: drawdown breaker + daily loss kill-switch (risk.ts).
  const governor = new RiskGovernor(RISK_LIMITS.STARTING_EQUITY_USD);

  let signalsEvaluated = 0;
  let signalsVetoed = 0;
  let halt: RiskHalt | null = null;

  let lastPrice = 2500;
  let lastTs = "2026-09-01T00:00:00Z";
  for (const bar of feed.bars(bars)) {
    lastPrice = bar.price;
    lastTs = bar.ts;
    try {
      const side = strategy.onBar(bar.price);
      let fill: Fill | null = null;
      if (side) {
        // Timestamp at emission; the gate re-checks freshness at execution.
        // This engine executes on the same bar it emits on, so age is 0 here
        // and every well-formed signal passes. The gate becomes load-bearing
        // when execution latency exists (a live deployment), where a signal
        // emitted minutes ago must prove it is still fresh enough to act on.
        const emittedAtSec = Date.parse(bar.ts) / 1000;
        const verdict = gate.evaluate(
          { confidence: SIGNAL_CONFIDENCE, emittedAtSec },
          emittedAtSec
        );
        signalsEvaluated++;
        if (!verdict.allowed) {
          signalsVetoed++;
        } else {
          fill = portfolio.target(side, bar.price, bar.ts);
          if (fill) ledger.append(fill);
        }
      }
      // Rails observe every bar on mark-to-market equity (cash + unrealized),
      // so the drawdown breaker sees open-position losses too.
      const equity = portfolio.cashUsd + portfolio.unrealizedPnl(bar.price);
      governor.observe(
        equity,
        bar.ts.slice(0, 10), // UTC day
        fill ? fill.realizedPnlUsd - fill.feesUsd : 0
      );
    } catch (e) {
      if (e instanceof RiskHalt) {
        // Rail 4 (halt, don't repair): latch the breach, flatten any open
        // position, stop. The governor never clears itself; only a human
        // restarting the process trades again.
        halt = e;
        break;
      }
      // Ledger failure (self-check or I/O): the chain is untrusted, so stop
      // without appending anything further. Never attempt to repair the log.
      console.error("================================================================");
      console.error(" HALT — ledger reconciliation failure; log left untouched.");
      console.error(` ${(e as Error).message}`);
      console.error("================================================================");
      return 5;
    }
  }

  if (halt) {
    // Close out risk first: the flattening fill is legitimate and logged.
    const closing = portfolio.flatten(lastPrice, lastTs);
    if (closing) {
      try {
        ledger.append(closing);
      } catch (e) {
        console.error(` HALT — ledger failed while flattening: ${(e as Error).message}`);
        return 5;
      }
    }
    console.error("================================================================");
    console.error(` HALT — ${halt.message}`);
    console.error(" Trading stopped. The halt does not clear itself: a human");
    console.error(" restarts the engine. No auto-repair was attempted.");
    console.error("================================================================");
  } else {
    // Flatten anything still open at the end of the run.
    const closing = portfolio.flatten(lastPrice, lastTs);
    if (closing) ledger.append(closing);
  }

  const fills = portfolio.allFills;
  const net = fills.reduce((s, f) => s + f.realizedPnlUsd - f.feesUsd, 0);
  const wins = fills.filter((f) => f.realizedPnlUsd > 0).length;

  // Reconciliation: re-verify the whole chain on disk before reporting.
  // A mismatch halts with no attempt to repair the log.
  if (!ledger.verifyChain()) {
    console.error("================================================================");
    console.error(" HALT — end-of-run reconciliation failed: the log on disk");
    console.error(" does not match what was appended. No repair attempted.");
    console.error("================================================================");
    return 5;
  }

  console.log(`bars simulated : ${bars} (5-minute, seeded #${seed})`);
  console.log(`trades logged   : ${ledger.count}`);
  console.log(
    `oracle gate     : ${signalsEvaluated} evaluated · ${
      signalsEvaluated - signalsVetoed
    } allowed · ${signalsVetoed} vetoed`
  );
  console.log(
    `risk rails      : drawdown ≤${RISK_LIMITS.MAX_DRAWDOWN_PCT}% · daily loss ≤$${RISK_LIMITS.DAILY_LOSS_LIMIT_USD} · ` +
      (halt ? `HALTED (${halt.rail})` : "no breach")
  );
  console.log(`win rate        : ${fills.length ? ((wins / fills.length) * 100).toFixed(1) : "0.0"}%`);
  console.log(`net paper P&L   : $${net.toFixed(2)} (after fees)`);
  console.log(`ending cash     : $${portfolio.cashUsd.toFixed(2)}`);
  console.log(`log written to  : ${out}`);
  console.log(`head hash       : ${ledger.headHash.slice(0, 12)}…`);
  console.log("----------------------------------------------------------------");
  console.log(" Paper results are evidence of the PIPELINE working, not a");
  console.log(" promise of future returns. Verify with publish_ticker.py.");
  return halt ? 4 : 0;
}

process.exit(main());
