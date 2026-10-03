# Nexus Paper-Ticker

Public, anonymized proof-of-performance for paper trading. No identity
fields exist anywhere in the pipeline — anonymity is structural.

## The loop

1. **Log trades** — the paper engine appends one JSON object per line to
   `trades.jsonl` (format documented in `publish_ticker.py`'s docstring).
   Each record hash-chains to the previous one.
2. **Publish** — `python3 publish_ticker.py trades.jsonl --out ./public`
   verifies the chain and writes `ticker.json` + `TICKER.md`.
   A broken chain = refused, exit 3, names the line.
3. **Commit** — push `./public` to the public repo. The git history is the
   timestamped, immutable ledger.

## Try it now

```
python3 publish_ticker.py --demo
```

Builds a sample log and publishes it, so you can see the whole pipeline
before wiring in real trade data.

## What verification proves (and doesn't)

- Chain integrity: the log wasn't rewritten after the fact.
- Fill plausibility: anyone can check each fill against public price
  history for its timestamp.
- It does NOT prove future performance. Past paper P&L is evidence,
  not a promise. Publish everything — cherry-picked winners are what
  scammers do.
