#!/usr/bin/env python3
"""
publish_ticker.py — verify a hash-chained paper-trade log and publish an
anonymized aggregate ticker (ticker.json + TICKER.md).

The log carries NO identity fields by design: there is nothing to strip,
nothing to leak. Anonymity is structural, not a filter.

Usage:
    python3 publish_ticker.py trades.jsonl --out ./public
    python3 publish_ticker.py --demo            # build a sample log + publish it

Trade log format: one JSON object per line. Keys:
    seq, ts (ISO-8601 UTC), pair, side ("long"|"short"), size_usd,
    entry, exit, fees_usd, realized_pnl_usd, mode ("paper"|"live"),
    strategy, ref (optional tx/block reference), prev_hash, hash

Tamper-evidence: each record's "hash" = sha256 of the canonical JSON of the
record WITHOUT the "hash" key (keys sorted, no whitespace). Each record's
"prev_hash" = the previous record's "hash" ("GENESIS" for the first).
Any edit, deletion, or reorder breaks the chain and the publisher refuses
to publish.

What verification actually proves (stated honestly):
  1. Chain integrity  -> the log was not rewritten after the fact.
  2. Fill plausibility -> each fill can be checked against public price
     history for that timestamp (anyone can replay it).
  It does NOT prove future performance. Past paper P&L is evidence,
  not a promise.
"""

import argparse
import hashlib
import json
import os
import sys
from datetime import datetime, timezone

GENESIS = "GENESIS"


def canonical(record):
    """Deterministic JSON for hashing: sorted keys, no whitespace,
    'hash' key excluded."""
    slim = {k: v for k, v in record.items() if k != "hash"}
    return json.dumps(slim, sort_keys=True, separators=(",", ":")).encode()


def record_hash(record):
    return hashlib.sha256(canonical(record)).hexdigest()


def load_and_verify(path):
    """Read the log, verify the chain. Returns the record list.
    Raises ValueError naming the first broken link."""
    records = []
    with open(path, "r", encoding="utf-8") as f:
        for lineno, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except json.JSONDecodeError as e:
                raise ValueError(f"line {lineno}: not valid JSON ({e})")
            records.append((lineno, rec))
    if not records:
        raise ValueError("log is empty")
    prev = GENESIS
    for lineno, rec in records:
        if rec.get("prev_hash") != prev:
            raise ValueError(
                f"line {lineno}: chain broken (prev_hash mismatch) — "
                f"log was edited, reordered, or truncated"
            )
        if rec.get("hash") != record_hash(rec):
            raise ValueError(
                f"line {lineno}: hash mismatch — record was modified after writing"
            )
        prev = rec["hash"]
    return [rec for _, rec in records]


def aggregate(records):
    pnls = [r["realized_pnl_usd"] for r in records]
    wins = [p for p in pnls if p > 0]
    losses = [p for p in pnls if p <= 0]
    fees = sum(r.get("fees_usd", 0.0) for r in records)
    by_day = {}
    for r in records:
        day = r["ts"][:10]
        d = by_day.setdefault(day, {"trades": 0, "pnl": 0.0})
        d["trades"] += 1
        d["pnl"] += r["realized_pnl_usd"]
    srt = sorted(pnls)
    median = srt[len(srt) // 2] if srt else 0.0
    return {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "head_hash": records[-1]["hash"] if records else None,
        "trades": len(records),
        "wins": len(wins),
        "losses": len(losses),
        "win_rate": round(len(wins) / len(records), 4) if records else 0.0,
        "gross_pnl_usd": round(sum(pnls), 2),
        "total_fees_usd": round(fees, 2),
        "net_pnl_usd": round(sum(pnls) - fees, 2),
        "median_trade_pnl_usd": round(median, 2),
        "best_trade_usd": round(max(pnls), 2) if pnls else 0.0,
        "worst_trade_usd": round(min(pnls), 2) if pnls else 0.0,
        "modes": sorted({r.get("mode", "paper") for r in records}),
        "strategies": sorted({r.get("strategy", "?") for r in records}),
        "daily": [
            {"day": day, "trades": d["trades"], "pnl_usd": round(d["pnl"], 2)}
            for day, d in sorted(by_day.items())
        ],
    }


def write_outputs(stats, outdir):
    os.makedirs(outdir, exist_ok=True)
    with open(os.path.join(outdir, "ticker.json"), "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)
    lines = [
        "# Nexus Paper-Ticker",
        "",
        f"_Generated {stats['generated_at']} · {stats['trades']} trades · "
        f"head `{stats['head_hash'][:12] if stats['head_hash'] else '-'}`_",
        "",
        f"**Net realized P&L:** ${stats['net_pnl_usd']:,.2f} "
        f"(gross ${stats['gross_pnl_usd']:,.2f}, fees ${stats['total_fees_usd']:,.2f})",
        f"**Win rate:** {stats['win_rate']*100:.1f}% "
        f"({stats['wins']}W / {stats['losses']}L)",
        f"**Median trade:** ${stats['median_trade_pnl_usd']:,.2f} · "
        f"**Best:** ${stats['best_trade_usd']:,.2f} · "
        f"**Worst:** ${stats['worst_trade_usd']:,.2f}",
        "",
        "## Daily",
        "",
        "| Day | Trades | Realized P&L (USD) |",
        "|---|---|---|",
    ]
    for d in stats["daily"]:
        lines.append(f"| {d['day']} | {d['trades']} | ${d['pnl_usd']:,.2f} |")
    lines += [
        "",
        "_Paper trading. Past fills are evidence, not a promise. "
        "Every trade in the log is hash-chained; verify with "
        "`publish_ticker.py`. Modes: " + ", ".join(stats["modes"]) + "_",
        "",
    ]
    with open(os.path.join(outdir, "TICKER.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    return stats


def build_demo(path):
    """Write a small sample chained log so the pipeline can be tried
    immediately: python3 publish_ticker.py --demo"""
    import random
    random.seed(7)
    prev = GENESIS
    trades = []
    base = 2500.0
    for i in range(1, 21):
        entry = round(base + random.uniform(-30, 30), 2)
        move = random.uniform(-18, 22)
        side = "long" if i % 2 else "short"
        exit_ = round(entry + (move if side == "long" else -move), 2)
        size = 1000.0
        gross = round((exit_ - entry) / entry * size * (1 if side == "long" else -1), 2)
        fees = 2.5
        rec = {
            "seq": i,
            "ts": f"2026-10-{1 + (i % 2):02d}T{10 + i:02d}:00:00Z",
            "pair": "WETH/USDC",
            "side": side,
            "size_usd": size,
            "entry": entry,
            "exit": exit_,
            "fees_usd": fees,
            "realized_pnl_usd": gross,
            "mode": "paper",
            "strategy": "nexus-v1",
            "ref": None,
            "prev_hash": prev,
        }
        rec["hash"] = record_hash(rec)
        prev = rec["hash"]
        trades.append(rec)
    with open(path, "w", encoding="utf-8") as f:
        for r in trades:
            f.write(json.dumps(r, sort_keys=True) + "\n")
    return path


def main(argv=None):
    ap = argparse.ArgumentParser(description="Verify a trade log, publish an anonymized ticker.")
    ap.add_argument("log", nargs="?", help="path to trades.jsonl")
    ap.add_argument("--out", default="./public", help="output dir for ticker.json + TICKER.md")
    ap.add_argument("--demo", action="store_true", help="build a sample log and publish it")
    args = ap.parse_args(argv)

    if args.demo:
        log = os.path.join(args.out, "trades.demo.jsonl")
        os.makedirs(args.out, exist_ok=True)
        build_demo(log)
        print(f"demo log written to {log}")
    else:
        if not args.log:
            ap.error("provide a log path or use --demo")
        log = args.log

    try:
        records = load_and_verify(log)
    except ValueError as e:
        print(f"REFUSED TO PUBLISH: {e}", file=sys.stderr)
        return 3
    except OSError as e:
        print(f"cannot read log: {e}", file=sys.stderr)
        return 2

    stats = write_outputs(aggregate(records), args.out)
    print(f"chain OK: {len(records)} trades verified, head {stats['head_hash'][:12]}")
    print(f"published ticker.json + TICKER.md to {args.out}")
    print(f"net realized P&L: ${stats['net_pnl_usd']:,.2f} "
          f"({stats['wins']}W/{stats['losses']}L)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
