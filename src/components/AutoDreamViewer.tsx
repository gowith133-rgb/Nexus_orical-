import { useState } from "react";
import { AutoDreamState, MetamatrixStatus } from "../types";
import { cn } from "../lib/utils";
import { 
  Moon, 
  Sparkles, 
  BrainCircuit, 
  RefreshCw, 
  Zap, 
  Trash2, 
  Clock, 
  Layers,
  Database,
  CheckCircle2
} from "lucide-react";

interface AutoDreamViewerProps {
  autoDream: AutoDreamState;
  status: MetamatrixStatus;
  onTriggerDream?: () => void;
}

export function AutoDreamViewer({ autoDream, status, onTriggerDream }: AutoDreamViewerProps) {
  const [isTriggering, setIsTriggering] = useState(false);

  const handleTriggerDream = async () => {
    setIsTriggering(true);
    try {
      await fetch('/api/autodream/trigger', { method: 'POST' });
      if (onTriggerDream) onTriggerDream();
    } catch (err) {
      console.error("Failed to trigger dream cycle", err);
    } finally {
      setTimeout(() => setIsTriggering(false), 1000);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-nexus-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold text-nexus-cyan bg-nexus-cyan/10 border border-nexus-cyan/20 px-2 py-0.5 rounded">
                COGNITIVE MEMORY LAYER
              </span>
              <span className="text-[9px] font-mono text-white/40">Nexus Trading Logic & AutoDream</span>
            </div>
            <h2 className="text-3xl font-serif italic text-white emerald-glow">
              AutoDream Memory Engine
            </h2>
            <p className="text-xs text-white/60 max-w-2xl">
              Simulating non-rapid eye movement (NREM) synaptic pruning and rapid eye movement (REM) counterfactual recombination to consolidate market models and purge predictive noise.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleTriggerDream}
              disabled={isTriggering || autoDream.isDreaming}
              className="px-5 py-3 steampunk-gradient text-nexus-bg font-mono font-bold text-xs rounded-xl shadow-lg shadow-nexus-emerald/20 hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {autoDream.isDreaming ? "Dream Cycle Active..." : "Trigger AutoDream Cycle"}
            </button>
          </div>
        </div>
      </div>

      {/* Cycle Phase & Glymphatic Purge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Phase Card */}
        <div className="glass-panel p-5 rounded-xl border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[9px] font-mono text-white/40 uppercase">
            <span>Cognitive Phase</span>
            <Moon className="w-3.5 h-3.5 text-nexus-cyan" />
          </div>
          <div className="text-2xl font-serif italic text-nexus-emerald emerald-glow">
            {autoDream.phase === 'ACTIVE' ? 'WAKE / ACTIVE ☀️' : 
             autoDream.phase === 'NREM' ? 'NREM PRUNING 💤' : 
             autoDream.phase === 'REM' ? 'REM DREAMING 💭' : 'CONSOLIDATING 🧠'}
          </div>
          <span className="text-[9px] font-mono text-white/30 block">
            Epoch #{autoDream.dreamEpoch} • Cycle #{autoDream.cycleCount}
          </span>
        </div>

        {/* Amyloid Clearance */}
        <div className="glass-panel p-5 rounded-xl border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[9px] font-mono text-white/40 uppercase">
            <span>Amyloid-Beta Purge</span>
            <Trash2 className="w-3.5 h-3.5 text-nexus-emerald" />
          </div>
          <div className="text-2xl font-serif italic text-white tabular-nums">
            {autoDream.amyloidClearance.toFixed(1)}%
          </div>
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-nexus-emerald transition-all duration-500" 
              style={{ width: `${autoDream.amyloidClearance}%` }}
            />
          </div>
        </div>

        {/* Tau Clearance */}
        <div className="glass-panel p-5 rounded-xl border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[9px] font-mono text-white/40 uppercase">
            <span>Tau Protein Removal</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-nexus-cyan" />
          </div>
          <div className="text-2xl font-serif italic text-white tabular-nums">
            {autoDream.tauPurgeProgress.toFixed(1)}%
          </div>
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-nexus-cyan transition-all duration-500" 
              style={{ width: `${autoDream.tauPurgeProgress}%` }}
            />
          </div>
        </div>

        {/* Synaptic Pruning */}
        <div className="glass-panel p-5 rounded-xl border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[9px] font-mono text-white/40 uppercase">
            <span>Pruning Compression</span>
            <Zap className="w-3.5 h-3.5 text-nexus-cyan" />
          </div>
          <div className="text-2xl font-serif italic text-nexus-cyan tabular-nums">
            {autoDream.synapticPruningFactor.toFixed(2)}x
          </div>
          <span className="text-[9px] font-mono text-white/30 block">
            Weights pruned to maximize entropy efficiency
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cognitive Sleep Cycle Architecture */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <BrainCircuit className="w-4 h-4 text-nexus-emerald" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Dual-Phase Consolidation Protocol
              </h3>
            </div>

            <div className="space-y-4 text-xs font-mono">
              {/* NREM Step */}
              <div className={cn(
                "p-4 rounded-xl border transition-all space-y-2",
                autoDream.phase === 'NREM' 
                  ? "bg-nexus-cyan/10 border-nexus-cyan text-white shadow-lg shadow-nexus-cyan/10" 
                  : "bg-black/20 border-white/5 text-white/70"
              )}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-nexus-cyan uppercase text-[11px]">
                    1. NREM Phase: Synaptic Pruning
                  </span>
                  {autoDream.phase === 'NREM' && (
                    <span className="w-2 h-2 rounded-full bg-nexus-cyan animate-ping" />
                  )}
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed">
                  Eliminates weak tick-level neural connections and purges toxic predictive artifacts (simulated beta-amyloid/tau clearance), maintaining lean EPC enclave footprint.
                </p>
              </div>

              {/* REM Step */}
              <div className={cn(
                "p-4 rounded-xl border transition-all space-y-2",
                autoDream.phase === 'REM' 
                  ? "bg-nexus-emerald/10 border-nexus-emerald text-white shadow-lg shadow-nexus-emerald/10" 
                  : "bg-black/20 border-white/5 text-white/70"
              )}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-nexus-emerald uppercase text-[11px]">
                    2. REM Phase: Counterfactual Dreaming
                  </span>
                  {autoDream.phase === 'REM' && (
                    <span className="w-2 h-2 rounded-full bg-nexus-emerald animate-ping" />
                  )}
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed">
                  Generates synthetic high-volatility market crashes and DEXScreener liquidity squeezes to test agent resilience without risking real capital.
                </p>
              </div>

              {/* Consolidation Step */}
              <div className={cn(
                "p-4 rounded-xl border transition-all space-y-2",
                autoDream.phase === 'CONSOLIDATING' 
                  ? "bg-amber-500/10 border-amber-500 text-white" 
                  : "bg-black/20 border-white/5 text-white/70"
              )}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 uppercase text-[11px]">
                    3. Epistemic Memory Consolidation
                  </span>
                  {autoDream.phase === 'CONSOLIDATING' && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed">
                  Encodes verified trading heuristics into the immutable long-term associative matrix for Layer 5 Router execution.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Consolidated Memories Ledger */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-nexus-cyan" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Consolidated Dream Memory Ledger
                </h3>
              </div>
              <span className="text-[9px] font-mono text-white/40">
                {autoDream.consolidatedMemories.length} episodes archived
              </span>
            </div>

            <div className="space-y-3">
              {autoDream.consolidatedMemories.map((mem) => (
                <div 
                  key={mem.id} 
                  className="p-3.5 bg-black/30 border border-white/5 hover:border-white/15 rounded-xl space-y-2 font-mono transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[9px]">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded uppercase font-bold",
                        mem.type === 'SYNAPTIC_PRUNE' ? "bg-nexus-cyan/15 text-nexus-cyan" :
                        mem.type === 'LATENT_RECOMBINATION' ? "bg-nexus-emerald/15 text-nexus-emerald" :
                        "bg-purple-500/15 text-purple-300"
                      )}>
                        {mem.type.replace('_', ' ')}
                      </span>
                      <span className="text-white/30">{new Date(mem.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <div className="flex items-center gap-3 text-white/50">
                      <span>Compression: <strong className="text-white">{mem.compressionRatio}x</strong></span>
                      <span>Salience: <strong className="text-nexus-emerald">{(mem.synapticSalience * 100).toFixed(0)}%</strong></span>
                    </div>
                  </div>

                  <p className="text-xs text-white/80 leading-relaxed font-sans">
                    {mem.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
