#!/usr/bin/env node
/**
 * Nexus paper-trading engine — SIMULATED PRICES, PAPER MONEY.
 *
 * Nothing here touches real market data or real money. Prices come from
 * SimulatedFeed (geometric random walk, seeded PRNG); fills are simulated
 * against those prices; every completed trade is appended to a
 * hash-chained JSONL log that ticker/publish_ticker.py verifies.
 *
 * Usage:
 *   node server/paper-trading/engine.js --bars 4000 --out trades.jsonl --seed 42
 *   (or: npx tsx server/paper-trading/engine.ts --bars 4000 --out trades.jsonl)
 *
 * Then publish the proof ticker:
 *   python3 ticker/publish_ticker.py trades.jsonl --out ticker/public
 */

import { SimulatedFeed } from "./feed.js";
import { MovingAverageCrossover } from "./strategy.js";
import { PaperPortfolio } from "./portfolio.js";
import { HashChainedLedger } from "./ledger.js";

const PAIR = "WETH/USDC";
const STRATEGY_LABEL = "ma-crossover-v1";

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
  const portfolio = new PaperPortfolio({
    startingCashUsd: 10000,
    notionalUsd: 1000,
    feePerTradeUsd: 2.5,
  });
  const ledger = new HashChainedLedger(out, { pair: PAIR, strategy: STRATEGY_LABEL });

  let lastPrice = 2500;
  let lastTs = "2026-09-01T00:00:00Z";
  for (const bar of feed.bars(bars)) {
    const signal = strategy.onBar(bar.price);
    if (signal) {
      const fill = portfolio.target(signal, bar.price, bar.ts);
      if (fill) ledger.append(fill);
    }
    lastPrice = bar.price;
    lastTs = bar.ts;
  }

  // Flatten anything still open at the end of the run.
  const closing = portfolio.flatten(lastPrice, lastTs);
  if (closing) ledger.append(closing);

  const fills = portfolio.allFills;
  const net = fills.reduce((s, f) => s + f.realizedPnlUsd - f.feesUsd, 0);
  const wins = fills.filter((f) => f.realizedPnlUsd > 0).length;
  console.log(`bars simulated : ${bars} (5-minute, seeded #${seed})`);
  console.log(`trades logged   : ${ledger.count}`);
  console.log(`win rate        : ${fills.length ? ((wins / fills.length) * 100).toFixed(1) : "0.0"}%`);
  console.log(`net paper P&L   : $${net.toFixed(2)} (after fees)`);
  console.log(`ending cash     : $${portfolio.cashUsd.toFixed(2)}`);
  console.log(`log written to  : ${out}`);
  console.log(`head hash       : ${ledger.headHash.slice(0, 12)}…`);
  console.log("----------------------------------------------------------------");
  console.log(" Paper results are evidence of the PIPELINE working, not a");
  console.log(" promise of future returns. Verify with publish_ticker.py.");
  return 0;
}

process.exit(main());
