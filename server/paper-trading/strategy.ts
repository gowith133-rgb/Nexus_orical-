/**
 * Moving-average crossover strategy — deliberately simple and legible.
 *
 * Rule: when the fast simple moving average crosses ABOVE the slow one,
 * the strategy wants to be long. When it crosses BELOW, it wants to be
 * short. Otherwise it holds whatever it has.
 *
 * This is a teaching-grade trend follower, not a secret edge. It is here
 * so the paper-trading loop (feed -> signal -> fill -> chained log) has
 * something explainable driving it. Anyone can read this file in two
 * minutes and know exactly why every trade happened.
 */

export type DesiredSide = "long" | "short";

export class MovingAverageCrossover {
  readonly name = "ma-crossover";
  private readonly fastPeriod: number;
  private readonly slowPeriod: number;
  private prices: number[] = [];
  private prevDiff: number | null = null;

  constructor(fastPeriod = 10, slowPeriod = 30) {
    if (fastPeriod >= slowPeriod) {
      throw new Error("fastPeriod must be smaller than slowPeriod");
    }
    this.fastPeriod = fastPeriod;
    this.slowPeriod = slowPeriod;
  }

  private sma(period: number): number | null {
    if (this.prices.length < period) return null;
    let sum = 0;
    for (let i = this.prices.length - period; i < this.prices.length; i++) {
      sum += this.prices[i];
    }
    return sum / period;
  }

  /**
   * Feed one closing price. Returns the desired side ONLY on the bar
   * where a crossover completes, otherwise null (hold).
   */
  onBar(price: number): DesiredSide | null {
    this.prices.push(price);
    const fast = this.sma(this.fastPeriod);
    const slow = this.sma(this.slowPeriod);
    if (fast === null || slow === null) return null;
    const diff = fast - slow;
    let signal: DesiredSide | null = null;
    if (this.prevDiff !== null) {
      if (this.prevDiff <= 0 && diff > 0) signal = "long";
      else if (this.prevDiff >= 0 && diff < 0) signal = "short";
    }
    this.prevDiff = diff;
    return signal;
  }
}
