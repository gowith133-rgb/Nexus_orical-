import { useState, type FormEvent, useEffect } from "react";
import { RouterContractState, TradingMode, Agent, SplitRouteResult } from "../types";
import { cn, formatCurrency } from "../lib/utils";
import { 
  ArrowLeftRight, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  Activity, 
  Zap, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Send, 
  AlertTriangle, 
  Info,
  Clock,
  Layers,
  Copy,
  Check,
  Fuel,
  TrendingDown,
  ShieldCheck,
  Cpu
} from "lucide-react";

interface RouterContractMonitorProps {
  routerContract: RouterContractState;
  tradingMode: TradingMode;
  currentPrice: number;
  agents: Agent[];
  onOrderSuccess?: () => void;
}

export function RouterContractMonitor({
  routerContract,
  tradingMode,
  currentPrice,
  agents,
  onOrderSuccess
}: RouterContractMonitorProps) {
  const { 
    spreadRiskGate, 
    ver, 
    graduatedAutonomy, 
    quorumVotes, 
    circuitBreaker, 
    activeRoutes,
    lvrMetrics,
    splitRoute,
    kylesLambda,
    atomicTripleCommand
  } = routerContract;

  // Split-Routing Optimizer UI State
  const [tradeAmountUSD, setTradeAmountUSD] = useState<string>("25000");
  const [customSplit, setCustomSplit] = useState<SplitRouteResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  // Atomic Triple-Command State
  const [isDispatchingAtomic, setIsDispatchingAtomic] = useState<boolean>(false);
  const [atomicStatusMsg, setAtomicStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedCalldata, setCopiedCalldata] = useState<boolean>(false);

  // Single-hop standard swap form state
  const [selectedRoute, setSelectedRoute] = useState<'Uniswap V3' | 'DEXScreener Liquidity Pool'>('Uniswap V3');
  const [swapAmountUSD, setSwapAmountUSD] = useState<string>("10.00");
  const [slippageBps, setSlippageBps] = useState<number>(25);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [swapStatusMessage, setSwapStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activeSplitPlan = customSplit || splitRoute;

  // Live Recalculate Split Route on amount change
  const handleRecalculateSplit = async () => {
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/router/split-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUSD: parseFloat(tradeAmountUSD) || 25000,
          sigmaTick: lvrMetrics.sigmaTick,
          isToxic: lvrMetrics.isToxicRegime
        })
      });
      const data = await res.json();
      setCustomSplit(data);
    } catch (err) {
      console.error("Failed to optimize split route", err);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Dispatch Atomic Triple-Command Execution
  const handleExecuteAtomicTriple = async () => {
    setIsDispatchingAtomic(true);
    setAtomicStatusMsg(null);
    try {
      const res = await fetch('/api/router/atomic-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountInUSD: parseFloat(tradeAmountUSD) || 25000
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Atomic execution failed");
      }
      setAtomicStatusMsg({
        type: 'success',
        text: `Atomic Triple-Command Confirmed! Tx: ${data.txHash.slice(0, 14)}... | Delivered: ${data.outputBTC.toFixed(6)} BTC via ${data.privateRPC} (Target Block: #${data.blockTarget}). JIT Sandwiches Defeated.`
      });
      if (onOrderSuccess) onOrderSuccess();
    } catch (err: any) {
      setAtomicStatusMsg({
        type: 'error',
        text: err.message || "Atomic swap failed"
      });
    } finally {
      setIsDispatchingAtomic(false);
    }
  };

  // Standard Single-Hop Swap
  const handleExecuteSwap = async (e: FormEvent) => {
    e.preventDefault();
    setIsSwapping(true);
    setSwapStatusMessage(null);

    try {
      const res = await fetch('/api/router/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocol: selectedRoute,
          amountInUSD: parseFloat(swapAmountUSD),
          slippageToleranceBps: slippageBps
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Swap execution was blocked by Router safety gates.");
      }

      setSwapStatusMessage({
        type: 'success',
        text: `Swap filled! Tx: ${data.txHash.slice(0, 10)}... | Output: ${data.outputBTC.toFixed(6)} BTC (Spread: ${data.spreadBps} bps)`
      });
      if (onOrderSuccess) onOrderSuccess();
    } catch (err: any) {
      setSwapStatusMessage({
        type: 'error',
        text: err.message || "Failed to execute swap"
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const handleToggleCircuitBreaker = async () => {
    const action = circuitBreaker.isTripped ? 'RESET' : 'TRIP';
    try {
      await fetch('/api/router/circuit-breaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: 'Operator intervention via Router dashboard' })
      });
    } catch (err) {
      console.error("Failed to toggle circuit breaker", err);
    }
  };

  const copyCalldata = () => {
    navigator.clipboard.writeText(atomicTripleCommand.calldataHex);
    setCopiedCalldata(true);
    setTimeout(() => setCopiedCalldata(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-nexus-emerald/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold text-nexus-emerald bg-nexus-emerald/10 border border-nexus-emerald/20 px-2 py-0.5 rounded">
                WEEK 4 UPGRADE
              </span>
              <span className="text-[9px] font-mono text-white/40">LVR Adverse Flow Quantification & Atomic Triple-Command</span>
            </div>
            <h2 className="text-3xl font-serif italic text-white emerald-glow">
              Institutional Split-Routing & LVR Execution
            </h2>
            <p className="text-xs text-white/60 max-w-2xl">
              Continuous arbitrageur rent modeling (<span className="font-mono text-nexus-cyan font-bold">LVR = ∫(σ²/8)L S ds</span>), dynamic fractional split routing across 500 bps / 3000 bps pools, closed-form Kyle's Lambda slippage bounds, and single-block atomic triple execution.
            </p>
          </div>

          {/* Circuit Breaker Kill-Switch */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleCircuitBreaker}
              className={cn(
                "px-5 py-3 rounded-xl font-mono font-bold text-xs flex items-center gap-2.5 transition-all shadow-lg cursor-pointer",
                circuitBreaker.isTripped 
                  ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20" 
                  : "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 shadow-red-500/10"
              )}
            >
              {circuitBreaker.isTripped ? (
                <>
                  <Unlock className="w-4 h-4" />
                  Reset Circuit Breaker (Resume Trading)
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Trip Emergency Circuit Breaker (Halt Swaps)
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Week 4 KPI Cards: LVR Drag, Kyle's Lambda, Dynamic Spread Gate, VER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* LVR Quantification Card */}
        <div className={cn(
          "glass-panel p-5 rounded-xl border relative overflow-hidden space-y-2",
          lvrMetrics.isToxicRegime ? "border-amber-500/50 bg-amber-500/[0.02]" : "border-nexus-emerald/30"
        )}>
          <div className="flex items-center justify-between text-[9px] font-mono uppercase text-white/40">
            <span>Loss-Versus-Rebalancing (LVR)</span>
            <span className={cn(
              "px-1.5 py-0.5 rounded font-bold",
              lvrMetrics.isToxicRegime ? "bg-amber-500/20 text-amber-300" : "bg-nexus-emerald/10 text-nexus-emerald"
            )}>
              {lvrMetrics.isToxicRegime ? "TOXIC ARBITRAGE" : "EQUILIBRIUM"}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif italic text-white tabular-nums">
              ${lvrMetrics.currentDailyLVRUSD.toFixed(0)}
            </span>
            <span className="text-[10px] font-mono text-white/40">
              / rev ${lvrMetrics.estimatedFeeRevenueUSD.toFixed(0)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-white/40 pt-1 border-t border-white/5">
            <span>LVR Drag: <strong className={lvrMetrics.isToxicRegime ? "text-amber-300" : "text-nexus-emerald"}>{(lvrMetrics.lvrDragRatio * 100).toFixed(1)}%</strong></span>
            <span>Fee Tier: <strong className="text-nexus-cyan">{lvrMetrics.activeFeeTierDiverted} bps</strong></span>
          </div>
        </div>

        {/* Closed-Form Kyle's Lambda Slippage Card */}
        <div className="glass-panel p-5 rounded-xl border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[9px] font-mono uppercase text-white/40">
            <span>Kyle's Lambda Slippage</span>
            <span className="px-1.5 py-0.5 rounded font-bold bg-nexus-cyan/10 text-nexus-cyan">
              k₁σ + k₂λ√Amt
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif italic text-nexus-cyan tabular-nums">
              {kylesLambda.calculatedSlippagePct.toFixed(3)}%
            </span>
            <span className="text-[10px] font-mono text-white/40">
              ({(kylesLambda.calculatedSlippagePct * 100).toFixed(1)} bps)
            </span>
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-white/40 pt-1 border-t border-white/5">
            <span>Tick Vol σ: {(kylesLambda.sigmaTick * 100).toFixed(2)}%</span>
            <span>Bounds: [{kylesLambda.sMin}%, {kylesLambda.sMax}%]</span>
          </div>
        </div>

        {/* Dynamic Spread Risk Gate Card */}
        <div className={cn(
          "glass-panel p-5 rounded-xl border relative overflow-hidden space-y-2",
          spreadRiskGate.isSpreadGateOpen ? "border-nexus-emerald/30" : "border-red-500/50"
        )}>
          <div className="flex items-center justify-between text-[9px] font-mono uppercase text-white/40">
            <span>Spread Risk Gate (0.25%)</span>
            <span className={cn(
              "px-1.5 py-0.5 rounded font-bold",
              spreadRiskGate.isSpreadGateOpen ? "bg-nexus-emerald/10 text-nexus-emerald" : "bg-red-500/20 text-red-300"
            )}>
              {spreadRiskGate.isSpreadGateOpen ? "GATE OPEN" : "GATE BLOCKED"}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={cn(
              "text-3xl font-serif italic tabular-nums",
              spreadRiskGate.isSpreadGateOpen ? "text-nexus-emerald emerald-glow" : "text-red-400"
            )}>
              {spreadRiskGate.currentSpreadBps.toFixed(1)} <span className="text-sm font-sans">bps</span>
            </span>
            <span className="text-[10px] font-mono text-white/40">
              / max {spreadRiskGate.maxSpreadToleranceBps} bps
            </span>
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-white/40 pt-1 border-t border-white/5">
            <span>Base Sizing: ${spreadRiskGate.baseOrderSizeUSD.toFixed(2)}</span>
            <span>Blocked: <strong className="text-red-400">{spreadRiskGate.blockedOrdersCount}</strong></span>
          </div>
        </div>

        {/* Volatility Expansion Ratio (VER) Card */}
        <div className="glass-panel p-5 rounded-xl border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[9px] font-mono uppercase text-white/40">
            <span>VER Volatility Ratio</span>
            <span className={cn(
              "px-1.5 py-0.5 rounded font-bold",
              ver.status === 'NORMAL' ? "bg-nexus-cyan/10 text-nexus-cyan" : "bg-amber-500/20 text-amber-300"
            )}>
              {ver.status}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif italic text-white tabular-nums">
              {ver.currentRatio.toFixed(2)}x
            </span>
            <span className="text-[10px] font-mono text-white/40">
              ceiling {ver.threshold.toFixed(1)}x
            </span>
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-white/40 pt-1 border-t border-white/5">
            <span>Short-term: {(ver.shortTermVol * 100).toFixed(2)}%</span>
            <span>Long-term: {(ver.longTermVol * 100).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Week 4 Feature 1: Dynamic Split-Routing Optimizer View */}
      <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-nexus-emerald" />
              <h3 className="text-sm font-serif italic text-white">
                Dynamic Split-Routing Optimizer (QuoterV2 Multi-Tier Allocation)
              </h3>
            </div>
            <p className="text-xs text-white/50">
              Instead of routing 100% through a single pool, <span className="font-mono text-nexus-emerald">optimize_split_route()</span> evaluates fractional multi-tier allocations (500 bps vs 3000 bps) to minimize price impact and avoid toxic LVR regimes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-mono text-white/40">$</span>
              <input
                type="number"
                value={tradeAmountUSD}
                onChange={(e) => setTradeAmountUSD(e.target.value)}
                placeholder="25000"
                className="bg-black/50 border border-white/10 rounded-xl pl-7 pr-3 py-2 text-xs font-mono text-white w-32 focus:outline-none focus:border-nexus-emerald"
              />
            </div>
            <button
              onClick={handleRecalculateSplit}
              disabled={isOptimizing}
              className="px-3.5 py-2 bg-nexus-emerald/20 hover:bg-nexus-emerald/30 text-nexus-emerald border border-nexus-emerald/30 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isOptimizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sliders className="w-3.5 h-3.5" />}
              Re-Optimize Split
            </button>
          </div>
        </div>

        {/* Split Allocation Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-white/60">
            <span>Optimal Fractional Allocation:</span>
            <span>Fee Savings vs Flat 3000bps: <strong className="text-nexus-emerald">+${activeSplitPlan.feeSavingsUSD.toFixed(2)}</strong></span>
          </div>

          <div className="h-6 rounded-xl bg-black/50 border border-white/10 flex overflow-hidden p-0.5">
            {activeSplitPlan.allocations.map((alloc) => (
              <div
                key={alloc.tier}
                style={{ width: `${alloc.fractionPct}%` }}
                className={cn(
                  "h-full rounded-lg flex items-center justify-center text-[10px] font-mono font-bold transition-all relative group",
                  alloc.tier === '500bps' 
                    ? "bg-nexus-emerald/30 text-nexus-emerald border border-nexus-emerald/40" 
                    : "bg-nexus-cyan/30 text-nexus-cyan border border-nexus-cyan/40"
                )}
              >
                <span>{alloc.tier} ({alloc.fractionPct}%)</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {activeSplitPlan.allocations.map((alloc) => (
              <div key={alloc.tier} className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      alloc.tier === '500bps' ? "bg-nexus-emerald" : "bg-nexus-cyan"
                    )} />
                    Uniswap V3 {alloc.tier} Pool
                  </span>
                  <span className="text-white/60">${alloc.allocatedAmountUSD.toLocaleString()} USD</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[9px] font-mono text-white/40 pt-1 border-t border-white/5">
                  <div>Output: <strong className="text-white">{alloc.expectedOutputBTC.toFixed(6)} BTC</strong></div>
                  <div>Pool Impact: <strong className="text-white">{alloc.poolPriceImpactPct.toFixed(3)}%</strong></div>
                  <div>Gas: <strong className="text-white">{alloc.quoterV2GasUnits} units</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aggregate Split Metrics */}
        <div className="p-3.5 rounded-xl bg-nexus-emerald/[0.04] border border-nexus-emerald/20 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div>
            <span className="text-[9px] text-white/40 uppercase block">Total Output</span>
            <strong className="text-nexus-emerald text-sm">{activeSplitPlan.totalOutputBTC} BTC</strong>
          </div>
          <div>
            <span className="text-[9px] text-white/40 uppercase block">Weighted Price Impact</span>
            <strong className="text-nexus-cyan text-sm">{activeSplitPlan.weightedPriceImpactPct.toFixed(4)}%</strong>
          </div>
          <div>
            <span className="text-[9px] text-white/40 uppercase block">Kyle's Lambda Slippage</span>
            <strong className="text-white text-sm">{activeSplitPlan.slippageKylesLambdaPct.toFixed(3)}%</strong>
          </div>
          <div>
            <span className="text-[9px] text-white/40 uppercase block">LVR Toxic Diverted</span>
            <span className={cn(
              "font-bold text-xs uppercase px-2 py-0.5 rounded",
              activeSplitPlan.isLVRDiverted ? "bg-amber-500/20 text-amber-300" : "bg-nexus-emerald/20 text-nexus-emerald"
            )}>
              {activeSplitPlan.isLVRDiverted ? "YES (Adverse Protected)" : "NO (Clean Flow)"}
            </span>
          </div>
        </div>
      </div>

      {/* Week 4 Feature 2: Atomic Triple-Command Execution (0x0a + 0x00 + 0x0c) */}
      <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-nexus-cyan" />
              <h3 className="text-sm font-serif italic text-white">
                Atomic Triple-Command Execution (PERMIT2_PERMIT + V3_SWAP_EXACT_IN + UNWRAP_WETH)
              </h3>
            </div>
            <p className="text-xs text-white/50">
              Encodes Universal Router commands <span className="font-mono text-nexus-cyan font-bold">0x0a</span>, <span className="font-mono text-nexus-cyan font-bold">0x00</span>, and <span className="font-mono text-nexus-cyan font-bold">0x0c</span> into a single atomic payload with a <strong>12-second (1-block) deadline</strong> sent via private RPC to defeat Just-In-Time (JIT) sandwiches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* 12-second Block Countdown */}
            <div className="bg-black/50 border border-white/10 px-3.5 py-2 rounded-xl flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-nexus-emerald animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[7px] font-mono text-white/40 uppercase">Block Window</span>
                <span className="text-xs font-mono font-bold text-white tabular-nums">
                  {atomicTripleCommand.deadlineSeconds}s / 12s
                </span>
              </div>
            </div>

            <button
              onClick={handleExecuteAtomicTriple}
              disabled={isDispatchingAtomic || circuitBreaker.isTripped}
              className={cn(
                "px-5 py-3 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-lg cursor-pointer",
                circuitBreaker.isTripped 
                  ? "bg-white/10 text-white/30 cursor-not-allowed" 
                  : "steampunk-gradient text-nexus-bg shadow-nexus-emerald/20 hover:opacity-95"
              )}
            >
              {isDispatchingAtomic ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Dispatch Atomic Triple-Command
            </button>
          </div>
        </div>

        {/* Command Pipeline Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {atomicTripleCommand.commands.map((cmd, idx) => (
            <div key={cmd.code} className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-nexus-cyan bg-nexus-cyan/10 px-1.5 py-0.5 rounded border border-nexus-cyan/20">
                  Step {idx + 1}: {cmd.code}
                </span>
                <span className="text-[8px] font-mono text-nexus-emerald flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> ATOMIC
                </span>
              </div>
              <h4 className="text-xs font-mono font-bold text-white">{cmd.name}</h4>
              <p className="text-[10px] text-white/50 leading-tight">{cmd.description}</p>
              <div className="text-[8px] font-mono text-white/30 pt-1 border-t border-white/5">
                Gas Limit: ~{cmd.gasLimit.toLocaleString()} units
              </div>
            </div>
          ))}
        </div>

        {/* Encoded Calldata Inspector */}
        <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[9px] font-mono uppercase text-white/40">
            <span>Atomic Calldata Hex Payload</span>
            <button
              onClick={copyCalldata}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              {copiedCalldata ? <Check className="w-3 h-3 text-nexus-emerald" /> : <Copy className="w-3 h-3" />}
              {copiedCalldata ? "Copied" : "Copy Calldata"}
            </button>
          </div>
          <div className="font-mono text-xs text-nexus-cyan bg-black/60 p-2.5 rounded-lg border border-white/5 overflow-x-auto whitespace-nowrap">
            {atomicTripleCommand.calldataHex}
          </div>
          <div className="flex flex-wrap items-center justify-between text-[9px] font-mono text-white/40 pt-1">
            <span>Private RPC: <strong className="text-white">{atomicTripleCommand.privateRPC}</strong></span>
            <span>Target Block: <strong className="text-white">#{atomicTripleCommand.blockTarget}</strong></span>
            <span>JIT Defense: <strong className="text-nexus-emerald">Active (Zero Sandwich Exposure)</strong></span>
          </div>
        </div>

        {atomicStatusMsg && (
          <div className={cn(
            "p-3 rounded-xl font-mono text-xs flex items-start gap-2",
            atomicStatusMsg.type === 'success' 
              ? "bg-nexus-emerald/10 border border-nexus-emerald/30 text-nexus-emerald" 
              : "bg-red-500/10 border border-red-500/30 text-red-300"
          )}>
            {atomicStatusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{atomicStatusMsg.text}</span>
          </div>
        )}
      </div>

      {/* Two Column Section: Single-Hop Swap Terminal & Multi-Agent Quorum */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Standard Swap Terminal */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-nexus-emerald" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Direct Swap Terminal
                </h3>
              </div>
              <span className="text-[9px] font-mono text-white/40">
                Mode: {tradingMode}
              </span>
            </div>

            <form onSubmit={handleExecuteSwap} className="space-y-4">
              {/* Route Selector */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono uppercase text-white/50 block">
                  Liquidity Protocol
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Uniswap V3', 'DEXScreener Liquidity Pool'] as const).map((proto) => (
                    <button
                      key={proto}
                      type="button"
                      onClick={() => setSelectedRoute(proto)}
                      className={cn(
                        "py-2.5 px-3 rounded-xl text-left border font-mono text-xs transition-all cursor-pointer",
                        selectedRoute === proto 
                          ? "bg-nexus-emerald/10 border-nexus-emerald/40 text-white font-bold" 
                          : "bg-white/[0.02] border-white/5 text-white/60 hover:border-white/20"
                      )}
                    >
                      <div className="truncate">{proto}</div>
                      <div className="text-[8px] text-white/30 truncate">
                        {proto === 'Uniswap V3' ? '0.05% Spread Tier' : 'DEX Pool Deep'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount USD & Slippage */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono uppercase text-white/50 block">
                    Swap Amount (USD)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={swapAmountUSD}
                      onChange={e => setSwapAmountUSD(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-nexus-emerald"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-mono text-white/30">$</span>
                  </div>
                  <span className="text-[8px] font-mono text-white/30">
                    Base sizing recommended: $10.00
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono uppercase text-white/50 block">
                    Max Slippage Tolerance
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="5"
                      max="100"
                      value={slippageBps}
                      onChange={e => setSlippageBps(parseInt(e.target.value) || 25)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-nexus-emerald"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-mono text-white/30">bps</span>
                  </div>
                  <span className="text-[8px] font-mono text-white/30">
                    Gate limit: 25 bps (0.25%)
                  </span>
                </div>
              </div>

              {/* Pre-flight Gate Verification Status */}
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1.5 text-[9px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-white/40">Spread Check:</span>
                  <span className={spreadRiskGate.isSpreadGateOpen ? "text-nexus-emerald" : "text-red-400 font-bold"}>
                    {spreadRiskGate.currentSpreadBps} bps {spreadRiskGate.isSpreadGateOpen ? "≤ 25 bps (PASS)" : "> 25 bps (FAIL)"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40">Circuit Breaker:</span>
                  <span className={circuitBreaker.isTripped ? "text-red-400 font-bold" : "text-nexus-emerald"}>
                    {circuitBreaker.isTripped ? "TRIPPED (EXECUTION BLOCKED)" : "CLEAR"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40">Estimated Output:</span>
                  <span className="text-nexus-cyan font-bold">
                    {(parseFloat(swapAmountUSD || "0") / currentPrice).toFixed(6)} BTC
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSwapping || circuitBreaker.isTripped || !spreadRiskGate.isSpreadGateOpen}
                className={cn(
                  "w-full py-3 rounded-xl font-mono font-bold text-xs transition-all flex items-center justify-center gap-2",
                  (!circuitBreaker.isTripped && spreadRiskGate.isSpreadGateOpen)
                    ? "steampunk-gradient text-nexus-bg shadow-lg shadow-nexus-emerald/20 hover:opacity-95 cursor-pointer"
                    : "bg-white/10 text-white/40 cursor-not-allowed"
                )}
              >
                <ArrowLeftRight className="w-4 h-4" />
                {isSwapping ? "Routing Swap..." : 
                 circuitBreaker.isTripped ? "Blocked: Circuit Breaker Active" :
                 !spreadRiskGate.isSpreadGateOpen ? "Blocked: Spread > 0.25%" : 
                 `Execute Swap ($${swapAmountUSD} USD)`}
              </button>
            </form>

            {swapStatusMessage && (
              <div className={cn(
                "p-3 rounded-xl font-mono text-[10px] flex items-start gap-2",
                swapStatusMessage.type === 'success' 
                  ? "bg-nexus-emerald/10 border border-nexus-emerald/30 text-nexus-emerald" 
                  : "bg-red-500/10 border border-red-500/30 text-red-300"
              )}>
                {swapStatusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{swapStatusMessage.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Multi-Agent Quorum Consensus & Active Liquidity Pools */}
        <div className="lg:col-span-6 space-y-6">
          {/* Multi-Agent Quorum Voting */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-nexus-cyan" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Multi-Agent Quorum Consensus (2/3 Required)
                </h3>
              </div>
              <span className="text-[9px] font-mono text-nexus-emerald">
                {quorumVotes.filter(v => v.vote === 'APPROVE').length} / {quorumVotes.length} APPROVED
              </span>
            </div>

            <div className="space-y-3">
              {quorumVotes.map((vote) => (
                <div 
                  key={vote.agentId}
                  className="p-3 bg-black/30 border border-white/5 rounded-xl font-mono space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{vote.agentName}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                      vote.vote === 'APPROVE' ? "bg-nexus-emerald/15 text-nexus-emerald" :
                      vote.vote === 'REJECT' ? "bg-red-500/15 text-red-400" :
                      "bg-white/10 text-white/50"
                    )}>
                      {vote.vote} ({(vote.confidence * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <p className="text-[10px] text-white/50 leading-tight">
                    {vote.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Liquidity Routes */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-nexus-emerald" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Monitored Liquidity Pools
                </h3>
              </div>
              <span className="text-[9px] font-mono text-white/40">
                0.25% Maximum Spread Rule
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {activeRoutes.map((route) => (
                <div key={route.id} className="p-3.5 bg-black/30 border border-white/5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">{route.protocol}</span>
                      <span className="text-[9px] text-white/40">{route.pair} • {route.feeTier}</span>
                    </div>
                    <span className={cn(
                      "text-[9px] px-2 py-0.5 rounded font-bold uppercase",
                      route.isApprovedByGate ? "bg-nexus-emerald/15 text-nexus-emerald" : "bg-red-500/15 text-red-400"
                    )}>
                      {route.isApprovedByGate ? "GATE APPROVED" : "SPREAD BREACH"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[9px] text-white/40 pt-1 border-t border-white/5">
                    <div>Spread: <strong className="text-white">{(route.spreadPct).toFixed(3)}%</strong></div>
                    <div>Impact: <strong className="text-white">{(route.priceImpactPct).toFixed(3)}%</strong></div>
                    <div>Gas: <strong className="text-white">{route.gasEstimateGwei} gwei</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
