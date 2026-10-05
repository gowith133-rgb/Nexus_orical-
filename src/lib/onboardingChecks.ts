/**
 * onboardingChecks.ts — the background verification checks behind the
 * Nexus onboarding screens.
 *
 * Every check runs the REAL paper-trading engine code imported from
 * server/paper-trading/ — never mocks, never stubs:
 *   - oracle.ts  (OracleGate)      — pure logic, runs as-is
 *   - risk.ts    (RISK_LIMITS)     — reads the actual hardcoded constants
 *   - portfolio.ts (PaperPortfolio) — runs a real round trip
 *
 * The ledger check is the one exception: ledger.ts imports node:crypto /
 * node:fs, which cannot run in a browser bundle. Instead this file
 * re-implements the EXACT verification contract documented at the top of
 * ledger.ts (sha256 of canonical JSON — sorted keys, no whitespace,
 * "hash" excluded; prev_hash linkage from GENESIS; sequence numbers)
 * using the Web Crypto API, and proves it against a test chain plus a
 * deliberately tampered chain. Same contract the ticker publisher
 * (ticker/publish_ticker.py) enforces.
 */

import { OracleGate } from "../../server/paper-trading/oracle.ts";
import { RISK_LIMITS, RiskGovernor } from "../../server/paper-trading/risk.ts";
import { PaperPortfolio } from "../../server/paper-trading/portfolio.ts";

export interface CheckResult {
  pass: boolean;
  detail: string;
}

/** Screen 3 — the paper portfolio initializes and records a round trip. */
export function checkPortfolio(): CheckResult {
  try {
    const portfolio = new PaperPortfolio({
      startingCashUsd: RISK_LIMITS.STARTING_EQUITY_USD,
      notionalUsd: RISK_LIMITS.MAX_NOTIONAL_USD,
      feePerTradeUsd: 2.5,
    });
    const opened = portfolio.target("long", 2500, "2026-10-04T00:00:00Z");
    if (opened !== null) {
      return { pass: false, detail: "opening a position unexpectedly returned a fill" };
    }
    const fill = portfolio.target("short", 2525, "2026-10-04T01:00:00Z");
    if (!fill) {
      return { pass: false, detail: "closing the position produced no fill" };
    }
    for (const k of ["side", "entryPrice", "exitPrice", "sizeUsd", "feesUsd", "realizedPnlUsd"] as const) {
      const v = fill[k];
      if (typeof v !== "number" && typeof v !== "string") {
        return { pass: false, detail: `fill is missing ${k}` };
      }
    }
    return {
      pass: true,
      detail: `round trip recorded (${fill.side}, realized $${fill.realizedPnlUsd})`,
    };
  } catch (e) {
    return { pass: false, detail: (e as Error).message };
  }
}

/** Screen 4 — the Oracle decay gate self-test against the real OracleGate. */
export function checkOracleGate(): CheckResult {
  try {
    const gate = new OracleGate();
    const nowSec = Math.floor(Date.now() / 1000);

    // 1. A fresh signal must pass.
    const fresh = gate.evaluate({ confidence: 0.9, emittedAtSec: nowSec }, nowSec);
    if (!fresh.allowed) {
      return { pass: false, detail: `fresh signal was vetoed: ${fresh.reason}` };
    }
    // 2. A 61-minute-old signal must be vetoed (max age is 3600s).
    const stale = gate.evaluate({ confidence: 0.9, emittedAtSec: nowSec - 3660 }, nowSec);
    if (stale.allowed) {
      return { pass: false, detail: "a 61-minute-old signal was allowed through" };
    }
    // 3. A malformed signal must be rejected — the gate fails closed.
    const malformed = gate.evaluate(
      { confidence: Number.NaN, emittedAtSec: nowSec },
      nowSec
    );
    if (malformed.allowed) {
      return { pass: false, detail: "a malformed signal was allowed through" };
    }
    return { pass: true, detail: "fresh passed · stale vetoed · malformed rejected" };
  } catch (e) {
    return { pass: false, detail: (e as Error).message };
  }
}

/** Screen 5 — read the actual hardcoded risk constants + prove the halt latches. */
export function checkRiskRails(): CheckResult {
  try {
    const { MAX_DRAWDOWN_PCT, DAILY_LOSS_LIMIT_USD, MAX_NOTIONAL_USD } = RISK_LIMITS;
    if (MAX_DRAWDOWN_PCT !== 8 || DAILY_LOSS_LIMIT_USD !== 300 || MAX_NOTIONAL_USD !== 1000) {
      return { pass: false, detail: "risk constants do not match 8% / $300 / $1,000" };
    }
    // Halt-latch: trip the governor on a 10% drawdown, then prove it
    // stays halted — it never clears itself.
    const governor = new RiskGovernor(10_000);
    try {
      governor.observe(9000, "2026-10-04", 0);
    } catch {
      /* expected: 10% drawdown breaches the 8% rail */
    }
    if (!governor.halted) {
      return { pass: false, detail: "governor did not halt on a 10% drawdown" };
    }
    try {
      governor.observe(10_000, "2026-10-04", 0);
      return { pass: false, detail: "halted governor resumed on its own" };
    } catch {
      /* expected: the latch holds */
    }
    return {
      pass: true,
      detail: `8% drawdown · −$300/day · $1,000/trade · halt latches`,
    };
  } catch (e) {
    return { pass: false, detail: (e as Error).message };
  }
}

/* ------------------------------------------------------------------ */
/* Screen 6 — hash-chain verification, browser port of the ledger.ts   */
/* contract (node:crypto cannot run in the browser bundle).            */
/* ------------------------------------------------------------------ */

function canonical(record: Record<string, unknown>): string {
  const slim: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) {
    if (key === "hash") continue;
    slim[key] = record[key];
  }
  return JSON.stringify(slim);
}

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyRecords(records: Record<string, unknown>[]): Promise<boolean> {
  let prev: unknown = "GENESIS";
  let seq = 0;
  for (const rec of records) {
    seq += 1;
    if (rec["seq"] !== seq) return false;
    if (rec["prev_hash"] !== prev) return false;
    const { hash, ...body } = rec;
    if (typeof hash !== "string") return false;
    if ((await sha256Hex(canonical(body))) !== hash) return false;
    prev = hash;
  }
  return true;
}

/** Screen 6 — prove the chain check works: valid chain passes, tampered fails. */
export async function checkLedgerChain(): Promise<CheckResult> {
  try {
    if (!crypto.subtle) {
      return { pass: false, detail: "Web Crypto is unavailable in this browser" };
    }
    // Build a 2-record test chain exactly per the ledger contract.
    const records: Record<string, unknown>[] = [];
    let prev = "GENESIS";
    for (let seq = 1; seq <= 2; seq++) {
      const body: Record<string, unknown> = {
        seq,
        ts: "2026-10-04T00:00:00Z",
        pair: "WETH/USDC",
        side: "long",
        size_usd: 1000,
        entry: 2500,
        exit: 2510,
        fees_usd: 2.5,
        realized_pnl_usd: 4,
        mode: "paper",
        strategy: "ma-crossover-v1",
        ref: null,
        prev_hash: prev,
      };
      const hash = await sha256Hex(canonical(body));
      records.push({ ...body, hash });
      prev = hash;
    }
    if (!(await verifyRecords(records))) {
      return { pass: false, detail: "a valid test chain failed verification" };
    }
    // Tamper with one record — verification must refuse it.
    const tampered = records.map((r) => ({ ...r }));
    tampered[1] = { ...tampered[1], realized_pnl_usd: 999999 };
    if (await verifyRecords(tampered)) {
      return { pass: false, detail: "a tampered chain passed verification" };
    }
    return { pass: true, detail: "chain verified · tampered entry rejected" };
  } catch (e) {
    return { pass: false, detail: (e as Error).message };
  }
}
