# Nexus — paper-trading engine and prototype

Nexus is the trading app being built as the public front end of
[MetaMatrix](https://github.com/gowith133-rgb/Metamatrix_v_2): an
automated trading assistant designed to give people time back — *one
less thing to think about* — with its performance published as proof,
not promised as income.

## Status

**What works today**
- A complete **paper-trading engine** (Node, `server/paper-trading/`):
  simulated price feed → moving-average crossover strategy → an
  "Oracle" decay-veto gate → paper portfolio → **hash-chained ledger**
  where every trade links to the one before it.
- A **ticker publisher** (`ticker/`) that verifies the ledger chain and
  publishes anonymized results. A broken chain is refused, loudly.
  Anonymity is structural: no identity fields exist in the pipeline.
- Both parts run locally with no API keys, no brokers, and **no
  real-money code paths anywhere in this repository.**

**In development (not in this repo yet)**
- The live strategy evidence is being gathered separately, by
  always-on shadow tests running on the MetaMatrix phone nodes —
  candidate strategies race each other on real market data with paper
  money, and most of them lose. The results decide what, if anything,
  earns its way into the app.
- The production phone app (a lightweight Android APK backed by the
  MetaMatrix nodes) is designed but not built. The web UI in `src/`
  is an early prototype front end, not the production app.

**The funding gate (hard rule, no exceptions)**
No real money — the developer's or anyone else's — moves until a
strategy posts **three consecutive months of +3% net on live paper
trading**, and a lawyer reviews the result. Any strategy or sizing
change restarts the streak.

## Layout

| Path | What it is |
|---|---|
| `server/paper-trading/` | The paper-trading engine (start with its README) |
| `ticker/` | Chain-verifying anonymized results publisher |
| `src/` | Early prototype web UI |
| `server.ts` | Prototype server for the web UI |

## What this is not

Not an investment product. Not financial advice. Not "passive
income." Paper trading only, published in the open so anyone can
check the work.
