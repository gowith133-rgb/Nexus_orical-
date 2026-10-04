# Nexus paper-trading engine

The calm core of Nexus: a paper-trading loop that runs quietly in the
background while you get on with your day. **Simulated prices. Paper
money.** No market-data feeds, no API keys, no brokers, no real-money
code paths anywhere in this directory.

## Why this exists

Nexus is built around a simple idea: **one less thing to think about.**
The app watches, the app practices — on fake money, out loud, where
everyone can check its work. What it will never promise you is "passive
income." Anyone selling that is selling something else. What Nexus
offers is time back and a public record you can verify yourself.

## The loop

```
SimulatedFeed  →  MovingAverageCrossover  →  OracleGate  →  PaperPortfolio  →  HashChainedLedger
 (fake prices)     (simple trend rule)       (decay veto)     (paper cash)       (trades.jsonl)
                                                                                      │
                                                                                      ▼
                                                                         publish_ticker.py verifies
                                                                         the chain and publishes
                                                                         ticker.json + TICKER.md
```

1. **Feed** (`feed.ts`) — geometric random walk, seeded PRNG. Same seed,
   same prices, every run. Clearly labeled simulated.
2. **Strategy** (`strategy.ts`) — moving-average crossover (10/30).
   Deliberately legible: two minutes of reading and you know exactly why
   every trade happened.
3. **Portfolio** (`portfolio.ts`) — paper cash + one position at a time.
   A fill is recorded only when a position *closes*, as a completed
   round trip: entry, exit, size, fees, gross realized P&L.
4. **Ledger** (`ledger.ts`) — appends each fill to a JSONL log where every
   record's `hash` chains to the previous record's (`prev_hash`). The
   format contract is defined by `ticker/publish_ticker.py`; the ledger
   self-checks every record the same way the publisher will, so a bug
   here fails fast instead of producing an unpublishable log.

## Oracle Protection (the decay gate)

Between the strategy and the portfolio sits the **Oracle gate**
(`oracle.ts`) — the part of Nexus that says "not on stale news."

Every signal is timestamped when it is emitted. Before it can execute,
the gate decays its confidence toward a neutral **0.500** baseline with
a **15-minute half-life**:

```
score(t) = 0.500 + (initial − 0.500) × 2^(−t/900)
```

A veto fires when the decayed score drops below **0.500**, or when the
signal is older than **1 hour** — whichever comes first. Malformed
signals (missing fields, impossible timestamps, nonsense confidence)
are vetoed too: the gate **fails closed**. Vetoed signals never reach
the portfolio, so they never become trades; the engine counts them and
reports the tally in its summary banner.

In this engine signals execute on the bar they are emitted on, so every
well-formed signal is fresh and the veto count is normally zero. The
gate becomes load-bearing in a live deployment, where minutes pass
between a signal and its execution: then a signal born confident at
0.900 reads 0.700 after fifteen minutes, and anything older than an
hour is dead on arrival — no trading on yesterday's intelligence,
ever.

## Risk rails (the circuit breakers)

Paper money or not, an engine that can't stop itself is a liability.
Four rails, all hardcoded in `risk.ts` — not config, not flags, so
loosening one means editing the source:

1. **Drawdown circuit breaker** — if total equity (cash + open-position
   value) falls more than **8%** below its running peak, trading halts.
2. **Daily loss kill-switch** — if one UTC day's net (realized P&L minus
   fees) drops past **−$300**, trading halts for the day.
3. **Hardcoded limits** — the numbers above plus the $1,000 per-trade
   notional ceiling live as frozen constants in code. The portfolio
   refuses to construct above the ceiling.
4. **Halt, don't repair** — a breached rail latches. The engine flattens
   any open position, stops, and exits. It never clears the breach and
   resumes on its own; a human restarts it. A corrupted trade log halts
   the same way: the log is left untouched, never "repaired."

The governor watches every bar on mark-to-market equity, so the
drawdown breaker sees open-position losses too — not just closed
trades. The engine also re-verifies the full hash chain on disk at the
end of every run before reporting.

Exit codes: `0` clean · `4` risk halt · `5` ledger failure.

## Run it

```bash
# needs only node (no npm install — stdlib only)
node server/paper-trading/engine.ts --bars 4000 --out trades.jsonl --seed 42

# verify + publish the proof ticker
python3 ticker/publish_ticker.py trades.jsonl --out ticker/public

# run the risk-rail breach tests (9 checks, stdlib only)
node server/paper-trading/risk.test.ts
```

The publisher refuses tampered logs (exit 3) and names the broken line.

## The proof pipeline (what the ticker proves, honestly)

- **Chain integrity** — the log wasn't rewritten after the fact. Any
  edit, deletion, or reorder breaks the hash chain and the publisher
  refuses to publish.
- **Fill plausibility** — every fill carries its timestamp, pair, entry,
  and exit, so anyone can replay it.
- **What it does NOT prove** — future performance. Past paper P&L is
  evidence that the pipeline works, not a promise of returns. Publish
  everything; cherry-picked winners are what scammers do.

## Files

| File | What it is |
|---|---|
| `feed.ts` | Seeded simulated price feed (geometric random walk) |
| `strategy.ts` | Moving-average crossover signal |
| `oracle.ts` | Orical signal-decay gate ("Oracle Protection") — vetoes stale signals |
| `portfolio.ts` | Paper cash + positions, fill accounting |
| `ledger.ts` | Hash-chained JSONL writer (matches `publish_ticker.py`) |
| `risk.ts` | The four safety rails: drawdown breaker, daily kill-switch, hardcoded limits, halt latch |
| `risk.test.ts` | Deliberate breach tests for the rails (run with `node`) |
| `engine.ts` | CLI runner wiring it all together |
