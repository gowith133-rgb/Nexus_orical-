import { MetamatrixStatus } from "../types";
import { cn } from "../lib/utils";
import { Activity, Shield, Zap, RefreshCw, Cpu, BrainCircuit, Network } from "lucide-react";

interface StatusIndicatorProps {
  status: MetamatrixStatus;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const items = [
    { label: "OUR WELLBEING", value: status.status, icon: Activity },
    { label: "OUR ENERGY", value: status.aqp4, icon: Zap },
    { label: "OUR CALM", value: status.adenosine, icon: BrainCircuit },
    { label: "OUR FOCUS", value: status.norepinephrine, icon: Shield },
    { label: "OUR MIND SPACE", value: `${status.epcAllocation.toFixed(0)} MB`, icon: Cpu },
    { label: "NARROW GATE (SYNC)", value: status.oracleStatus === 'ATTESTED' ? 'ATTESTED ✨' : status.oracleStatus === 'PUSHING' ? 'PUSHING ☁️' : 'SECURE 🛡️', icon: Network },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {items.map((item) => (
          <div key={item.label} className="glass-panel p-3 md:p-4 rounded-xl border-white/5 relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-nexus-emerald/20 group-hover:bg-nexus-cyan transition-colors" />
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <item.icon className={cn(
                "w-3 h-3 transition-transform group-hover:scale-110",
                item.value === 'CRITICAL' || item.value === 'VOLATILE' ? "text-red-400" : "text-nexus-cyan"
              )} />
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{item.label}</span>
            </div>
            <div className={cn(
              "font-serif italic text-base md:text-lg emerald-glow",
              item.value === 'CRITICAL' || item.value === 'VOLATILE' ? "text-red-400" : "text-nexus-emerald"
            )}>
              {item.value === 'READY' ? 'SYNCED' : item.value === 'RESTING' ? 'REFLECTING' : item.value}
            </div>
          </div>
        ))}
      </div>
      
      <div className="glass-panel p-3 md:p-4 rounded-xl border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Team Happiness</span>
            <span className="text-xs font-mono text-nexus-cyan">{status.glymphatic === 'BETA-AMYLOID_PURGED' ? 'PERFECTLY ALIGNED ✨' : 'ADJUSTING... 🧹'}</span>
          </div>
          <div className="h-6 w-px bg-white/10 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Shared Identity</span>
            <span className="text-xs font-mono text-nexus-cyan">VERIFIED_PARTNERS</span>
          </div>
        </div>
        <div className="flex gap-1 w-full sm:w-auto justify-end">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={cn(
              "w-2 h-2 rounded-full",
              i < 5 ? "bg-nexus-emerald/40" : "bg-white/5"
            )} />
          ))}
        </div>
      </div>
    </div>
  );
}
