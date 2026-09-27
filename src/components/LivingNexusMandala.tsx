import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NodeState } from "../types";
import { formatCurrency, cn } from "../lib/utils";
import { 
  Sun, 
  Moon, 
  Heart, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Wind, 
  Compass, 
  Feather, 
  Eye, 
  EyeOff, 
  Zap, 
  ArrowUpRight, 
  Lock, 
  Layers,
  ChevronRight,
  X,
  Volume2,
  VolumeX
} from "lucide-react";

interface LivingNexusMandalaProps {
  data: NodeState;
  onOpenDetailedInspect?: () => void;
  onExecuteQuickSwap?: () => void;
}

export function LivingNexusMandala({
  data,
  onOpenDetailedInspect,
  onExecuteQuickSwap
}: LivingNexusMandalaProps) {
  const [selectedPillar, setSelectedPillar] = useState<'presence' | 'wealth' | 'rest' | 'truth' | 'time'>('presence');
  const [metamatrixLens, setMetamatrixLens] = useState<boolean>(false);
  const [isBreathing, setIsBreathing] = useState<boolean>(false);
  const [breathText, setBreathText] = useState<string>("Breathe in");
  const [timeString, setTimeString] = useState<string>("");

  // Real clock for natural circadian awareness
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Breathing guide cycle (Inhale 4s, Hold 4s, Exhale 4s)
  useEffect(() => {
    if (!isBreathing) return;
    const cycle = ["Breathe in peace...", "Hold and rest...", "Release all noise...", "Be here now..."];
    let idx = 0;
    setBreathText(cycle[0]);
    const timer = setInterval(() => {
      idx = (idx + 1) % cycle.length;
      setBreathText(cycle[idx]);
    }, 4000);
    return () => clearInterval(timer);
  }, [isBreathing]);

  // Circadian state (approximate based on local hour)
  const hour = new Date().getHours();
  const isNight = hour >= 20 || hour < 6;

  // Real Metamatrix data points translated into human life values
  const lifeMetrics = {
    wealth: {
      title: "Financial Peace",
      subtitle: "Silent, autonomous stewardship",
      humanFocus: "Your resources are growing quietly in the background without needing your constant watch.",
      value: formatCurrency(data.price),
      change: "+2.4% today",
      metamatrixHint: `LVR rent (${(data.routerContract?.lvrMetrics?.lvrDragRatio * 100 || 63).toFixed(0)}% drag) neutralized via split routing across 500 & 3000 bps pools. Spread gate locked at 0.25%.`,
      status: "Guarded & Growing"
    },
    rest: {
      title: "Deep Rest & Sleep",
      subtitle: "Glymphatic biological clearance",
      humanFocus: "True productivity begins in undisturbed rest. The cognitive node cleanses synaptic fatigue while you rest.",
      value: `${data.autoDream?.tauPurgeProgress?.toFixed(0) || 94}% Cleared`,
      change: "Phase: NREM Restoration",
      metamatrixHint: "AutoDream cycle pruning micro-tick synaptic noise. Beta-amyloid and tau cleared in Layer 3 memory.",
      status: "Deep Restorative Equilibrium"
    },
    truth: {
      title: "Epistemic Honesty",
      subtitle: "Signal without illusion or flattery",
      humanFocus: "Living with clarity means filtering out corporate buzz, market frenzy, and hollow promises.",
      value: `${data.sincerityMetrics?.sincerityScore?.toFixed(1) || 98.4}% Pure`,
      change: "Zero Marketing Noise",
      metamatrixHint: "Sincerity Protocol actively scrubbing AI boilerplate disclaimers and enforcing Bayesian epistemic limits (p < 0.35).",
      status: "Calibrated Truth"
    },
    time: {
      title: "Time Returned to You",
      subtitle: "Freedom from constant checking",
      humanFocus: "Every minute not spent checking charts or panicking over ticks is a minute given back to family, nature, and creating.",
      value: "5.4 Hours Saved",
      change: "Fully Autonomous",
      metamatrixHint: `Universal Router Triple-Command (0x0a + 0x00 + 0x0c) with 12s private RPC dispatch eliminates execution drag.`,
      status: "Unbound Time"
    },
    presence: {
      title: "Being Present",
      subtitle: "The anchor of a well-lived life",
      humanFocus: "Technology should fade into the background so you can experience the warmth of the sun, conversations, and deep thought.",
      value: "Now",
      change: isNight ? "Night Rest" : "Daylight Focus",
      metamatrixHint: "Intel SGX EPC Enclave (1024MB) and Zipf Stego Mesh (<1.5ms) running silently in ring 0.",
      status: "Serene & Centered"
    }
  };

  const activePillarData = lifeMetrics[selectedPillar];

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-between p-4 md:p-8 select-none overflow-hidden">
      {/* Subtle Aurora Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-[120px] opacity-70" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-t from-teal-500/10 to-transparent rounded-full blur-[100px] opacity-50" />
        {metamatrixLens && (
          <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.05)_1px,transparent_1px)] [background-size:24px_24px] opacity-60 animate-fadeIn" />
        )}
      </div>

      {/* Top Floating Serenity Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between z-20 py-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-nexus-emerald">
            {isNight ? <Moon className="w-4 h-4 text-nexus-cyan" /> : <Sun className="w-4 h-4 text-amber-300" />}
          </div>
          <div>
            <span className="text-xs font-serif italic text-white/90 block leading-tight">
              Nexus Equilibrium
            </span>
            <span className="text-[10px] font-sans text-white/40 tracking-wider">
              {timeString} · {isNight ? "Resting Hour" : "Daylight Presence"}
            </span>
          </div>
        </div>

        {/* Controls: Breathing Guide & Subtle Metamatrix Lens Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBreathing(!isBreathing)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-sans transition-all flex items-center gap-1.5 cursor-pointer",
              isBreathing 
                ? "bg-nexus-emerald/20 text-nexus-emerald border border-nexus-emerald/40" 
                : "bg-white/[0.03] hover:bg-white/[0.08] text-white/60 border border-white/10"
            )}
          >
            <Wind className={cn("w-3.5 h-3.5", isBreathing && "animate-spin")} />
            <span>{isBreathing ? "Pause Breath" : "Breathe"}</span>
          </button>

          <button
            onClick={() => setMetamatrixLens(!metamatrixLens)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-sans transition-all flex items-center gap-1.5 cursor-pointer",
              metamatrixLens 
                ? "bg-nexus-cyan/20 text-nexus-cyan border border-nexus-cyan/40 shadow-lg shadow-nexus-cyan/10" 
                : "bg-white/[0.03] hover:bg-white/[0.08] text-white/60 border border-white/10"
            )}
          >
            {metamatrixLens ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{metamatrixLens ? "Metamatrix Lens: Active" : "Subtle Lens"}</span>
          </button>
        </div>
      </header>

      {/* Central Living Graphic: The Nexus Mandala */}
      <div className="relative my-auto flex flex-col items-center justify-center py-6 w-full max-w-2xl z-10">
        <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] flex items-center justify-center">
          
          {/* Subtle Outer Atmosphere Ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-white/[0.06] border-dashed"
          />

          {/* Middle Harmony Ring with Floating Pillar Anchors */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className={cn(
              "absolute inset-6 sm:inset-8 rounded-full border transition-colors duration-1000",
              metamatrixLens ? "border-nexus-cyan/20 border-dotted" : "border-emerald-500/10"
            )}
          />

          {/* Breathing Pulsating Core Ring */}
          <motion.div
            animate={{
              scale: isBreathing ? [1, 1.14, 1] : [1, 1.04, 1],
              opacity: [0.6, 0.9, 0.6]
            }}
            transition={{
              duration: isBreathing ? 8 : 4.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-16 sm:inset-20 rounded-full bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-400/20 backdrop-blur-md flex items-center justify-center shadow-2xl shadow-emerald-950/40"
          />

          {/* Innermost Core: The Heart of Stillness */}
          <div className="relative z-20 flex flex-col items-center justify-center text-center p-6 max-w-[210px] sm:max-w-[240px]">
            {isBreathing ? (
              <motion.div
                key="breathing"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1.5"
              >
                <Wind className="w-5 h-5 text-nexus-emerald mx-auto animate-pulse" />
                <span className="text-sm sm:text-base font-serif italic text-white block">
                  {breathText}
                </span>
                <span className="text-[10px] text-white/40 font-sans block">
                  Releasing the noise
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="presence"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2 cursor-pointer"
                onClick={() => setSelectedPillar('presence')}
              >
                <div className="w-2 h-2 rounded-full bg-nexus-emerald mx-auto animate-ping" />
                <h3 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight leading-none">
                  {activePillarData.value}
                </h3>
                <span className="text-[11px] font-serif italic text-emerald-300/80 block leading-tight">
                  {activePillarData.title}
                </span>
                <span className="text-[9px] font-sans text-white/40 uppercase tracking-widest block">
                  {activePillarData.change}
                </span>
              </motion.div>
            )}
          </div>

          {/* Interactive Life Pillar Satellite Nodes on the Ring */}
          {[
            { id: 'wealth', label: 'Peace of Wealth', icon: Sparkles, angle: 0, metric: formatCurrency(data.price) },
            { id: 'rest', label: 'Restful Sleep', icon: Moon, angle: 72, metric: `${data.autoDream?.tauPurgeProgress?.toFixed(0) || 94}%` },
            { id: 'truth', label: 'Epistemic Truth', icon: ShieldCheck, angle: 144, metric: `${data.sincerityMetrics?.sincerityScore?.toFixed(0) || 98}%` },
            { id: 'time', label: 'Time Freedom', icon: Clock, angle: 216, metric: 'Quiet Node' },
            { id: 'presence', label: 'Pure Presence', icon: Heart, angle: 288, metric: 'Now' },
          ].map((item) => {
            const rad = (item.angle * Math.PI) / 180;
            const radius = 145; // pixel offset from center
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;
            const isSelected = selectedPillar === item.id;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                onClick={() => setSelectedPillar(item.id as any)}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  transform: `translate(${x}px, ${y}px)`
                }}
                className={cn(
                  "absolute z-30 p-2.5 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer shadow-lg",
                  isSelected
                    ? "bg-nexus-emerald text-nexus-bg ring-4 ring-nexus-emerald/20 shadow-nexus-emerald/30"
                    : "bg-white/[0.05] hover:bg-white/[0.12] text-white/70 border border-white/10 backdrop-blur-md"
                )}
                title={item.label}
              >
                <Icon className="w-4 h-4" />
                
                {/* Floating quiet label */}
                <span className={cn(
                  "absolute -bottom-5 whitespace-nowrap text-[9px] font-sans transition-opacity pointer-events-none",
                  isSelected ? "opacity-100 text-nexus-emerald font-semibold" : "opacity-0 hover:opacity-100 text-white/40"
                )}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}

          {/* Subtle Metamatrix Hints (Visible when lens is active) */}
          {metamatrixLens && (
            <div className="absolute inset-0 pointer-events-none animate-fadeIn">
              {/* Subtle orbital trajectory curve */}
              <svg className="w-full h-full opacity-30">
                <circle cx="50%" cy="50%" r="48%" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 6" />
                <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="2 8" />
              </svg>
              <div className="absolute top-2 left-2 text-[8px] font-mono text-nexus-cyan/60">
                SGX EPC: {data.enclaveHardware?.epcUsageMB || 384}MB / 1024MB
              </div>
              <div className="absolute bottom-2 right-2 text-[8px] font-mono text-nexus-emerald/60">
                LVR Drag: {(data.routerContract?.lvrMetrics?.lvrDragRatio * 100 || 63).toFixed(1)}% · Zipf: {data.stegoMesh?.latencyMs?.toFixed(2) || 0.12}ms
              </div>
            </div>
          )}
        </div>

        {/* Life Pillar Insight & Reflection Card */}
        <div className="mt-8 w-full max-w-lg text-center space-y-3 px-4">
          <div className="space-y-1">
            <span className="text-[11px] font-serif italic text-emerald-300 tracking-wide">
              {activePillarData.title}
            </span>
            <p className="text-sm font-sans text-white/90 font-light leading-relaxed">
              "{activePillarData.humanFocus}"
            </p>
          </div>

          {/* Subtle Hint of the Metamatrix serving this life pillar */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm space-y-1 transition-all">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-white/40 uppercase tracking-widest">
              <Compass className="w-3 h-3 text-nexus-cyan" />
              <span>Quietly Protected by Nexus Core</span>
            </div>
            <p className="text-[11px] text-white/60 font-sans leading-relaxed">
              {activePillarData.metamatrixHint}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Quiet Sanctuary Dock */}
      <footer className="w-full max-w-4xl z-20 py-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-white/40">
        <div className="flex items-center gap-2 text-[11px]">
          <Feather className="w-3.5 h-3.5 text-nexus-emerald opacity-70" />
          <span>The machine works in silence so you can live in the present.</span>
        </div>

        <div className="flex items-center gap-3">
          {onExecuteQuickSwap && (
            <button
              onClick={onExecuteQuickSwap}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/80 border border-white/10 transition-colors flex items-center gap-1.5 text-[11px] cursor-pointer"
            >
              <Zap className="w-3 h-3 text-nexus-emerald" />
              <span>Quiet Micro-Swap</span>
            </button>
          )}

          {onOpenDetailedInspect && (
            <button
              onClick={onOpenDetailedInspect}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-nexus-cyan border border-white/10 transition-colors flex items-center gap-1.5 text-[11px] cursor-pointer"
            >
              <Layers className="w-3 h-3" />
              <span>Inspect Metamatrix Node</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
