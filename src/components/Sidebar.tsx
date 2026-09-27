import { 
  Target, 
  BrainCircuit, 
  Layers, 
  Moon, 
  ArrowLeftRight, 
  Radio, 
  ShieldCheck, 
  ChevronRight,
  AlertTriangle,
  Cpu
} from "lucide-react";
import { cn } from "../lib/utils";
import { NodeState } from "../types";

export type NavTab = 'overview' | 'hidden_states' | 'hermetic_stack' | 'autodream' | 'router_contract' | 'oracle_sigstore' | 'stego_mesh';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  data: NodeState;
}

const navItems: { id: NavTab; label: string; icon: any; detail: string; badge?: string }[] = [
  { id: 'overview', label: 'System Overview', icon: Target, detail: 'Neural Cockpit & Live Market' },
  { id: 'router_contract', label: 'LVR & Split Routing', icon: ArrowLeftRight, detail: 'LVR Drag & Atomic Triple', badge: 'Week 4' },
  { id: 'stego_mesh', label: 'Stego Mesh & Substrate', icon: Cpu, detail: 'Zipf SVO (<1.5ms) & CPU Pinning', badge: 'Week 4' },
  { id: 'hermetic_stack', label: 'Hermetic 5-Layer Stack', icon: Layers, detail: 'Sincerity & Graduated Autonomy' },
  { id: 'hidden_states', label: 'Hidden States v2', icon: BrainCircuit, detail: 'Transforms, Entropy & PCA', badge: 'v2' },
  { id: 'autodream', label: 'AutoDream Engine', icon: Moon, detail: 'NREM/REM Memory Pruning' },
  { id: 'oracle_sigstore', label: 'Predictive Oracle', icon: Radio, detail: 'Git SHA-1 & Rekor Log' },
];

export function Sidebar({ activeTab, onSelectTab, data }: SidebarProps) {
  const isCircuitBreakerTripped = data.routerContract?.circuitBreaker?.isTripped;
  const spreadGateOpen = data.routerContract?.spreadRiskGate?.isSpreadGateOpen;

  return (
    <div className="w-full flex flex-col justify-between h-full space-y-6">
      <div className="space-y-4">
        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-3">
          Neural Architecture
        </span>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={cn(
                  "w-full group px-3.5 py-3 flex items-center gap-3.5 transition-all rounded-xl border text-left relative",
                  isActive 
                    ? "bg-nexus-emerald/10 border-nexus-emerald/40 text-white shadow-lg shadow-nexus-emerald/5" 
                    : "hover:bg-white/[0.03] border-transparent text-white/70 hover:text-white"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-all",
                  isActive 
                    ? "steampunk-gradient text-nexus-bg shadow-md shadow-nexus-emerald/30" 
                    : "glass-panel group-hover:text-nexus-emerald text-white/60"
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={cn(
                      "text-xs font-serif italic tracking-wide",
                      isActive ? "text-nexus-emerald font-semibold" : "group-hover:text-zinc-200"
                    )}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-nexus-cyan/15 text-nexus-cyan border border-nexus-cyan/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-white/30 uppercase tracking-tighter truncate">
                    {item.detail}
                  </span>
                </div>
                <ChevronRight className={cn(
                  "w-3.5 h-3.5 transition-transform",
                  isActive ? "text-nexus-emerald translate-x-0.5" : "text-white/10 group-hover:text-white/40 group-hover:translate-x-0.5"
                )} />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Safety & Enclave Live Telemetry Card */}
      <div className="space-y-4">
        {isCircuitBreakerTripped && (
          <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-red-300 animate-pulse">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <div className="text-[9px] font-mono leading-tight">
              <span className="font-bold block">CIRCUIT BREAKER TRIPPED</span>
              <span>Execution halted safely</span>
            </div>
          </div>
        )}

        <div className="p-4 glass-panel rounded-xl border-white/5 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Enclave Substrate</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-nexus-emerald shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[9px] font-mono text-nexus-emerald">SGX::SECURE</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[8px] font-mono">
            <div className="bg-white/[0.02] p-2 rounded border border-white/5">
              <span className="text-white/30 block mb-0.5">SPREAD GATE</span>
              <span className={cn("font-bold", spreadGateOpen ? "text-nexus-emerald" : "text-red-400")}>
                {spreadGateOpen ? 'OPEN (<=0.25%)' : 'BLOCKED (>0.25%)'}
              </span>
            </div>
            <div className="bg-white/[0.02] p-2 rounded border border-white/5">
              <span className="text-white/30 block mb-0.5">SINCERITY</span>
              <span className="text-nexus-cyan font-bold">
                {data.sincerityMetrics?.sincerityScore.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">MRENCLAVE Hash</span>
            <span className="text-[8px] font-mono text-white/30 truncate">
              {data.enclaveHardware?.mrenclave || "0x8f4d9...9ca"}
            </span>
          </div>

          <div className="flex items-center justify-between text-[8px] font-mono text-white/30 pt-1 border-t border-white/5">
            <span>Rekor Log Index</span>
            <span className="text-nexus-cyan">#{data.sigstoreAttestation?.rekorEntryIndex || 4892104}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
