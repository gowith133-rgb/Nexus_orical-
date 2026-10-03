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
SimulatedFeed  →  MovingAverageCrossover  →  PaperPortfolio  →  HashChainedLedger
 (fake prices)     (simple trend rule)        (paper cash)       (trades.jsonl)
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

## Run it

```bash
# needs only node (no npm install — stdlib only)
node server/paper-trading/engine.ts --bars 4000 --out trades.jsonl --seed 42

# verify + publish the proof ticker
python3 ticker/publish_ticker.py trades.jsonl --out ticker/public
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
| `portfolio.ts` | Paper cash + positions, fill accounting |
| `ledger.ts` | Hash-chained JSONL writer (matches `publish_ticker.py`) |
| `engine.ts` | CLI runner wiring it all together |
