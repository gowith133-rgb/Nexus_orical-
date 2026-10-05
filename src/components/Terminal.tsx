import { useState } from "react";
import { Zap, DollarSign, Package, Activity, ShieldCheck, AlertCircle } from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";

interface TerminalProps {
  currentPrice: number;
  mode: 'PAPER';
  activeAgentName: string;
  onOrder: (side: 'BUY' | 'SELL', stopPrice: number, size: string) => void;
}

export function Terminal({ currentPrice, mode, activeAgentName, onOrder }: TerminalProps) {
  const [stopPrice, setStopPrice] = useState(currentPrice.toFixed(2));
  const [size, setSize] = useState("0.00015"); // ~$10 USD base sizing
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');

  const limitPrice = side === 'BUY' ? parseFloat(stopPrice) * 1.002 : parseFloat(stopPrice) * 0.998;
  const estimatedUSD = parseFloat(size || "0") * parseFloat(stopPrice || "0");

  const setBaseSizingUSD = () => {
    const btcSize = (10.0 / currentPrice).toFixed(6);
    setSize(btcSize);
  };

  return (
    <div className="glass-panel border-white/5 p-6 md:p-8 relative overflow-hidden rounded-2xl group">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
        <Activity className="w-32 h-32 text-nexus-emerald gear-icon" />
      </div>
      
      <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 steampunk-gradient rounded-lg shadow-lg shadow-nexus-emerald/20">
            <Zap className="w-5 h-5 text-nexus-bg" />
          </div>
          <span className="text-lg font-serif italic text-white/90 emerald-glow">Executive Directive</span>
        </div>

        {/* BUY / SELL Switcher */}
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={cn(
              "px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all",
              side === 'BUY' ? "bg-nexus-emerald text-nexus-bg shadow" : "text-white/60 hover:text-white"
            )}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={cn(
              "px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all",
              side === 'SELL' ? "bg-red-500 text-white shadow" : "text-white/60 hover:text-white"
            )}
          >
            SELL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 relative z-10">
        <div className="space-y-6 md:space-y-6">
          <div>
            <label className="text-[9px] text-nexus-cyan font-black uppercase tracking-[0.2em] mb-2 block leading-none opacity-60">
              1. Shared Price Target (USD)
            </label>
            <div className="relative border-b-2 border-white/5 focus-within:border-nexus-emerald transition-colors py-1">
              <input
                type="number"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                className="w-full bg-transparent text-2xl md:text-3xl text-white focus:outline-none font-serif italic tabular-nums"
              />
              <DollarSign className="absolute right-0 top-2 w-4 h-4 text-nexus-cyan" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[9px] text-nexus-cyan font-black uppercase tracking-[0.2em] leading-none opacity-60">
                2. Order Size (BTC)
              </label>
              <button
                type="button"
                onClick={setBaseSizingUSD}
                className="text-[8px] font-mono text-nexus-emerald hover:underline"
              >
                Set Base $10.00 Size
              </button>
            </div>
            <div className="relative border-b-2 border-white/5 focus-within:border-nexus-emerald transition-colors py-1">
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full bg-transparent text-2xl md:text-3xl text-white focus:outline-none font-serif italic tabular-nums"
              />
              <Package className="absolute right-0 top-2 w-4 h-4 text-nexus-cyan" />
            </div>
            <span className="text-[9px] font-mono text-white/40 block mt-1">
              ≈ {formatCurrency(estimatedUSD)} USD
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-end space-y-4">
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-nexus-cyan font-black uppercase tracking-widest">Execution Bound</span>
              <span className="text-base font-mono text-nexus-emerald tabular-nums">{formatCurrency(limitPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-white/40 pt-2 border-t border-white/5">
              <span>Spread Risk Gate:</span>
              <span className="text-nexus-emerald font-bold">0.25% Max (25 bps)</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
               <div className={cn(
                 "w-1.5 h-1.5 rounded-full animate-pulse",
                 mode === 'PAPER' ? "bg-nexus-cyan" : "bg-nexus-emerald"
               )} />
               <span className={cn(
                 "text-[8px] font-black uppercase tracking-widest",
                 mode === 'PAPER' ? "text-nexus-cyan" : "text-nexus-emerald text-glow"
               )}>
                 {activeAgentName} : {mode} MODE
               </span>
            </div>
          </div>

          <button
            onClick={() => onOrder(side, parseFloat(stopPrice), size)}
            className="w-full steampunk-gradient text-nexus-bg py-4 rounded-xl text-xs font-black hover:opacity-90 active:scale-[0.98] transition-all duration-300 uppercase tracking-[0.3em] shadow-xl group/btn overflow-hidden relative"
          >
            <span className="relative z-10">{side} Order Directive 🤝</span>
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
          </button>
        </div>
      </div>
    </div>
  );
}
