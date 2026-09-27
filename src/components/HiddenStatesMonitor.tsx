import { ProcessorOutput } from "../types";
import { cn } from "../lib/utils";
import { BrainCircuit, Sparkles, Sliders } from "lucide-react";

interface HiddenStatesMonitorProps {
  outputs: ProcessorOutput[];
  onOpenDeepDive?: () => void;
}

export function HiddenStatesMonitor({ outputs, onOpenDeepDive }: HiddenStatesMonitorProps) {
  return (
    <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Hidden States Processor v2</span>
            <span className="text-[8px] font-mono bg-nexus-cyan/15 text-nexus-cyan px-1.5 py-0.2 rounded">v2</span>
          </div>
          <span className="text-xs font-serif italic text-nexus-cyan mt-1">Deep Reflection & Transformation</span>
        </div>
        
        {onOpenDeepDive ? (
          <button 
            onClick={onOpenDeepDive}
            className="text-[9px] font-mono text-nexus-emerald hover:text-white bg-nexus-emerald/10 hover:bg-nexus-emerald/20 border border-nexus-emerald/30 px-2 py-1 rounded transition-colors flex items-center gap-1"
          >
            <Sliders className="w-3 h-3" />
            Tune v2 Hyperparameters
          </button>
        ) : (
          <div className="text-[9px] font-mono text-white/20 bg-white/5 px-2 py-1 rounded">
            ALIGNMENT::ACTIVE
          </div>
        )}
      </div>

      <div className="space-y-5">
        {outputs?.map((output) => (
          <div key={output.class} className="space-y-1.5">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/40">
              <span className="font-mono">{output.class} Transformation</span>
              <div className="flex items-center gap-3 font-mono">
                {output.entropy !== undefined && (
                  <span className="text-nexus-cyan">H: {output.entropy.toFixed(2)}b</span>
                )}
                <span className="text-nexus-emerald">{output.class === 'Step' ? `Sparsity: ${((output.sparsity || 0)*100).toFixed(0)}%` : 'Active'}</span>
              </div>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {output.value?.map((v, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="h-10 bg-white/[0.02] border border-white/5 rounded relative overflow-hidden group">
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-nexus-emerald/30 group-hover:bg-nexus-cyan transition-all duration-300"
                      style={{ height: `${Math.max(4, Math.min(100, v * 100))}%` }}
                    />
                  </div>
                  <span className="text-[7px] font-mono text-center text-white/30 truncate">{v.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-white/5">
        <div className="p-3 bg-nexus-cyan/5 border border-nexus-cyan/15 rounded-lg flex gap-3">
          <BrainCircuit className="w-4 h-4 text-nexus-cyan flex-shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-nexus-cyan uppercase tracking-widest">Processor v2 Active</span>
            <p className="text-[10px] text-white/60 leading-tight mt-0.5 font-medium">
              Real-time entropy tracking, LayerNorm stabilization, and Heaviside step quantization active across all cognitive cycles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
