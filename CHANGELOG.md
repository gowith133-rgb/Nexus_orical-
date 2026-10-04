# Nexus changelog — what changed and why

## Safety rails added to the paper-trading engine

The paper-trading engine now has four safety rails. It already ran on
fake money; now it also knows how to stop itself. Nothing here touches
real money, real orders, or real accounts — this is all practice mode.

**1. Drawdown circuit breaker — stops a slow bleed.**
If the account's total value (cash plus any open trade) falls more than
8% below its highest point, the engine stops trading. This prevents a
bad stretch from quietly grinding the account down.

**2. Daily loss kill-switch — stops a bad day from becoming a disaster.**
If one day's losses go past $300, the engine stops for the day. One bad
day can't snowball into a catastrophic one.

**3. Limits locked in the code — nobody can loosen them by accident.**
The safety numbers (8%, $300, $1,000 maximum per trade) are written
directly into the engine's code, not in a settings file. Changing them
means deliberately editing the code, not flipping a switch.

**4. Halt, don't repair — when something breaks, it stays stopped.**
If a safety rail is breached or the trade log doesn't check out, the
engine closes any open trade, stops, and stays stopped. It never tries
to fix things and keep going on its own — a person has to look at what
happened and restart it.

**Also new:** every run now re-checks the entire trade log at the end
before reporting results, and there's a test script
(`server/paper-trading/risk.test.ts`) that deliberately tries to break
each rail to prove it holds.

**What didn't change:** the 70-trade demo still produces exactly the
same results as before — the rails watch quietly and only act if a
limit is actually breached.
