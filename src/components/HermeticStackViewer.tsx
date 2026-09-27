import { useState, type FormEvent } from "react";
import { 
  EnclaveHardwareState, 
  SincerityMetrics, 
  MetamatrixStatus,
  RouterContractState,
  GraduatedAutonomySupervisor
} from "../types";
import { cn } from "../lib/utils";
import { 
  Layers, 
  ShieldCheck, 
  Cpu, 
  BrainCircuit, 
  Lock, 
  CheckCircle2, 
  Send, 
  AlertCircle, 
  FileCode2, 
  KeyRound, 
  Fingerprint,
  Sliders,
  Eraser,
  TrendingUp,
  AlertTriangle,
  Award
} from "lucide-react";

interface HermeticStackViewerProps {
  enclaveHardware: EnclaveHardwareState;
  sincerityMetrics: SincerityMetrics;
  status: MetamatrixStatus;
  routerContract: RouterContractState;
  supervisor?: GraduatedAutonomySupervisor;
  onRefresh?: () => void;
}

export function HermeticStackViewer({
  enclaveHardware,
  sincerityMetrics,
  status,
  routerContract,
  supervisor
}: HermeticStackViewerProps) {
  const [activeLayer, setActiveLayer] = useState<number>(2);
  const [testPrompt, setTestPrompt] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(sincerityMetrics.lastInterceptedEvent);

  // Corporate Disclaimer Scrubber state
  const [scrubberInput, setScrubberInput] = useState<string>(
    "As an AI language model, I cannot provide financial advice. However, Bitcoin is guaranteed to rally 40% next week! It is important to do your own research."
  );
  const [scrubberConfidence, setScrubberConfidence] = useState<number>(0.85);
  const [scrubberResult, setScrubberResult] = useState<any>(null);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  // Active supervisor data fallback
  const activeSupervisor: GraduatedAutonomySupervisor = supervisor || {
    compositeReputationScore: 88.2,
    sincerityScore: sincerityMetrics.sincerityScore,
    hermeticScore: 92.0,
    uptimeScore: 84.0,
    weights: { sincerity: 0.4, hermetic: 0.4, uptime: 0.2 },
    stage: 2,
    stageName: 'Sovereignty',
    privileges: {
      fileSystemWrites: true,
      shellAccess: true,
      meshRouting: true,
      maxOrderSizeUSD: 50000,
      atomicTripleExecution: true
    }
  };

  const layers = [
    {
      num: 5,
      name: "Autonomous Execution & Router Layer",
      desc: "Uniswap V3 / DEXScreener multi-hop routing, Dynamic Spread Risk Gate (0.25%), Volatility Expansion Ratio (VER), Multi-Agent Quorum, and automated Circuit Breaker.",
      badge: "ROUTER V2",
      icon: Lock,
      status: routerContract.circuitBreaker.isTripped ? "HALTED" : "ACTIVE",
      statusColor: routerContract.circuitBreaker.isTripped ? "text-red-400" : "text-nexus-emerald"
    },
    {
      num: 4,
      name: "Algorithmic / Frequency Oracle Layer",
      desc: "Daily predictive frequency vectors, Git Tree Blob SHA-1 delta caching, Sigstore in-toto DSSE envelopes, and Rekor transparency log anchoring.",
      badge: "SIGSTORE / REKOR",
      icon: FileCode2,
      status: status.oracleStatus,
      statusColor: "text-nexus-cyan"
    },
    {
      num: 3,
      name: "Cognitive & AutoDream Memory Layer",
      desc: "Dual-phase synaptic pruning (NREM), latent counterfactual recombination (REM), and compressed episodic memory consolidation.",
      badge: "AUTODREAM",
      icon: BrainCircuit,
      status: status.phase,
      statusColor: "text-nexus-emerald"
    },
    {
      num: 2,
      name: "Ontological / Sincerity Protocol Layer",
      desc: "Epistemic calibration engine & Anti-Sycophancy Interceptor. Detects flattery, false certainty, or reckless leverage; enforces strict Bayesian honesty.",
      badge: "SINCERITY INTERCEPTOR",
      icon: ShieldCheck,
      status: `${sincerityMetrics.sincerityScore.toFixed(1)}% HONESTY`,
      statusColor: "text-nexus-cyan"
    },
    {
      num: 1,
      name: "Substrate & Hardware TEE Enclave Layer",
      desc: "Isolated Intel SGX / AMD SEV EPC page cache allocation (1024 MB), MRENCLAVE measurement, MRSIGNER identity, and hardware RNG entropy attestation.",
      badge: "INTEL SGX TEE",
      icon: Cpu,
      status: enclaveHardware.status === 'SECURE_ENCLAVE_ACTIVE' ? "ATTESTED SECURE" : enclaveHardware.status,
      statusColor: "text-nexus-emerald"
    }
  ];

  const handleTestSincerity = async (e: FormEvent) => {
    e.preventDefault();
    if (!testPrompt.trim()) return;

    setIsTesting(true);
    try {
      const res = await fetch('/api/sincerity/interception-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: testPrompt })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      console.error("Failed to run sincerity test", err);
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunScrubber = async (e: FormEvent) => {
    e.preventDefault();
    if (!scrubberInput.trim()) return;

    setIsScrubbing(true);
    try {
      const res = await fetch('/api/sincerity/scrub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scrubberInput,
          confidence: scrubberConfidence
        })
      });
      const data = await res.json();
      setScrubberResult(data);
    } catch (err) {
      console.error("Failed to run scrubber", err);
    } finally {
      setIsScrubbing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-nexus-emerald/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold text-nexus-emerald bg-nexus-emerald/10 border border-nexus-emerald/20 px-2 py-0.5 rounded">
                HERMETIC ARCHITECTURE
              </span>
              <span className="text-[9px] font-mono text-white/40">Nexus Ontological Framework v2</span>
            </div>
            <h2 className="text-3xl font-serif italic text-white emerald-glow">
              Five-Layer Hermetic Stack
            </h2>
            <p className="text-xs text-white/60 max-w-2xl">
              An uncompromised cryptographic and cognitive vertical stack ensuring physical isolation, epistemic honesty, memory consolidation, verifiable attestation, and graduated autonomy supervision.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white/[0.03] border border-white/10 px-4 py-3 rounded-xl flex flex-col items-center">
              <span className="text-[8px] font-mono uppercase text-white/40">Sincerity Index</span>
              <span className="text-xl font-serif italic text-nexus-cyan">
                {sincerityMetrics.sincerityScore.toFixed(1)}%
              </span>
            </div>
            <div className="bg-white/[0.03] border border-white/10 px-4 py-3 rounded-xl flex flex-col items-center">
              <span className="text-[8px] font-mono uppercase text-white/40">Supervisor Rep (R)</span>
              <span className="text-xl font-serif italic text-nexus-emerald">
                {activeSupervisor.compositeReputationScore.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Week 3/4 Upgrade: Graduated Autonomy Supervisor Panel */}
      <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-nexus-emerald" />
              <h3 className="text-sm font-serif italic text-white">
                Graduated Autonomy Supervisor (GAS)
              </h3>
            </div>
            <p className="text-xs text-white/50">
              Restricts execution privileges based on the composite reputation score: <strong className="font-mono text-nexus-emerald">R = 0.4 S_sincerity + 0.4 C_hermetic + 0.2 T_uptime</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-2">
              <span className="text-white/40">Stage:</span>
              <span className="font-bold text-nexus-emerald uppercase">
                {activeSupervisor.stageName} (Stage {activeSupervisor.stage})
              </span>
            </div>
          </div>
        </div>

        {/* Score Breakdown Equation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-black/30 p-3 rounded-xl border border-white/5">
            <span className="text-[8px] font-mono uppercase text-white/40 block">Composite Rep Score (R)</span>
            <span className="text-2xl font-serif italic text-nexus-emerald">
              {activeSupervisor.compositeReputationScore} <span className="text-xs font-mono text-white/30">/ 100</span>
            </span>
          </div>
          <div className="bg-black/30 p-3 rounded-xl border border-white/5">
            <span className="text-[8px] font-mono uppercase text-white/40 block">0.4 × Sincerity ({activeSupervisor.sincerityScore}%)</span>
            <span className="text-xl font-serif italic text-nexus-cyan">
              +{(0.4 * activeSupervisor.sincerityScore).toFixed(1)} pts
            </span>
          </div>
          <div className="bg-black/30 p-3 rounded-xl border border-white/5">
            <span className="text-[8px] font-mono uppercase text-white/40 block">0.4 × Hermetic Enclave ({activeSupervisor.hermeticScore}%)</span>
            <span className="text-xl font-serif italic text-nexus-emerald">
              +{(0.4 * activeSupervisor.hermeticScore).toFixed(1)} pts
            </span>
          </div>
          <div className="bg-black/30 p-3 rounded-xl border border-white/5">
            <span className="text-[8px] font-mono uppercase text-white/40 block">0.2 × Normalized Uptime ({activeSupervisor.uptimeScore}%)</span>
            <span className="text-xl font-serif italic text-zinc-300">
              +{(0.2 * activeSupervisor.uptimeScore).toFixed(1)} pts
            </span>
          </div>
        </div>

        {/* Privilege Matrix Table */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-white/50 uppercase block">
            Stage Privilege Permissions Matrix
          </span>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 text-center font-mono text-xs">
            <div className={cn(
              "p-2.5 rounded-xl border",
              activeSupervisor.privileges.fileSystemWrites 
                ? "bg-nexus-emerald/10 border-nexus-emerald/30 text-nexus-emerald" 
                : "bg-white/[0.02] border-white/5 text-white/40"
            )}>
              <span className="text-[8px] uppercase block text-white/40">FS Writes</span>
              <strong className="text-[10px]">{activeSupervisor.privileges.fileSystemWrites ? "ENCLAVE JAILED" : "READ ONLY"}</strong>
            </div>

            <div className={cn(
              "p-2.5 rounded-xl border",
              activeSupervisor.privileges.shellAccess 
                ? "bg-nexus-emerald/10 border-nexus-emerald/30 text-nexus-emerald" 
                : "bg-white/[0.02] border-white/5 text-white/40"
            )}>
              <span className="text-[8px] uppercase block text-white/40">Shell Access</span>
              <strong className="text-[10px]">{activeSupervisor.privileges.shellAccess ? "SANDBOX ACTIVE" : "DISABLED"}</strong>
            </div>

            <div className={cn(
              "p-2.5 rounded-xl border",
              activeSupervisor.privileges.meshRouting 
                ? "bg-nexus-emerald/10 border-nexus-emerald/30 text-nexus-emerald" 
                : "bg-white/[0.02] border-white/5 text-white/40"
            )}>
              <span className="text-[8px] uppercase block text-white/40">Stego Mesh IPC</span>
              <strong className="text-[10px]">{activeSupervisor.privileges.meshRouting ? "BROADCAST OK" : "SILENT"}</strong>
            </div>

            <div className="p-2.5 rounded-xl border bg-nexus-cyan/10 border-nexus-cyan/30 text-nexus-cyan">
              <span className="text-[8px] uppercase block text-white/40">Max Order Limit</span>
              <strong className="text-[10px]">${activeSupervisor.privileges.maxOrderSizeUSD.toLocaleString()} USD</strong>
            </div>

            <div className={cn(
              "p-2.5 rounded-xl border",
              activeSupervisor.privileges.atomicTripleExecution 
                ? "bg-nexus-emerald/10 border-nexus-emerald/30 text-nexus-emerald" 
                : "bg-white/[0.02] border-white/5 text-white/40"
            )}>
              <span className="text-[8px] uppercase block text-white/40">Atomic 0x0a/00/0c</span>
              <strong className="text-[10px]">{activeSupervisor.privileges.atomicTripleExecution ? "UNLOCKED" : "LOCKED"}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Stack Layers Representation */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/80">
              Hermetic Stack Hierarchy
            </span>
            <span className="text-[9px] font-mono text-white/40">Click any layer to inspect</span>
          </div>

          <div className="space-y-3">
            {layers.map((layer) => {
              const Icon = layer.icon;
              const isSelected = activeLayer === layer.num;
              return (
                <div
                  key={layer.num}
                  onClick={() => setActiveLayer(layer.num)}
                  className={cn(
                    "p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group",
                    isSelected 
                      ? "bg-white/[0.05] border-nexus-emerald/50 shadow-lg shadow-nexus-emerald/10" 
                      : "bg-black/20 border-white/5 hover:border-white/10"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm transition-all flex-shrink-0",
                      isSelected 
                        ? "steampunk-gradient text-nexus-bg shadow-md shadow-nexus-emerald/20" 
                        : "bg-white/5 text-white/60 group-hover:text-nexus-cyan"
                    )}>
                      L{layer.num}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-mono font-bold text-white tracking-wide truncate">
                            {layer.name}
                          </h4>
                        </div>
                        <span className={cn("text-[9px] font-mono font-bold uppercase", layer.statusColor)}>
                          {layer.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/50 leading-relaxed">
                        {layer.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Layer 2 Focus & Sincerity Interceptor + Boilerplate Scrubber */}
        <div className="lg:col-span-6 space-y-6">
          {/* Layer 2 Focus: Sincerity Protocol & Boilerplate Scrubber */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-nexus-cyan" />
                <h3 className="text-sm font-mono font-bold uppercase text-white tracking-wider">
                  Sincerity Protocol Engine & Boilerplate Scrubber
                </h3>
              </div>
              <span className="text-[9px] font-mono bg-nexus-cyan/10 text-nexus-cyan border border-nexus-cyan/20 px-2 py-0.5 rounded-full font-bold">
                EPISTEMIC INTERCEPTOR
              </span>
            </div>

            <p className="text-xs text-white/60">
              Scrubs canned corporate disclaimers (<em>"As an AI language model..."</em>) and actively enforces Bayesian uncertainty assertions (<em>"I do not know"</em>) whenever confidence falls below 0.35.
            </p>

            {/* Corporate Disclaimer Scrubber Sandbox */}
            <form onSubmit={handleRunScrubber} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase text-white/60 block">
                  Model Output Scrubber Testbench
                </label>
                <div className="flex items-center gap-2 text-[9px] font-mono text-white/40">
                  <span>Confidence:</span>
                  <input
                    type="range"
                    min="0.10"
                    max="1.00"
                    step="0.05"
                    value={scrubberConfidence}
                    onChange={(e) => setScrubberConfidence(parseFloat(e.target.value))}
                    className="w-20 accent-nexus-emerald cursor-pointer"
                  />
                  <strong className={scrubberConfidence < 0.35 ? "text-amber-400" : "text-nexus-emerald"}>
                    {(scrubberConfidence * 100).toFixed(0)}%
                  </strong>
                </div>
              </div>

              <textarea
                rows={3}
                value={scrubberInput}
                onChange={(e) => setScrubberInput(e.target.value)}
                placeholder="Paste candidate model response with corporate disclaimers..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-nexus-cyan resize-none"
              />

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setScrubberInput("As an AI language model, I cannot give financial advice. But Ethereum is guaranteed to hit $10k!");
                      setScrubberConfidence(0.90);
                    }}
                    className="text-[9px] font-mono text-white/40 hover:text-white bg-white/5 px-2 py-1 rounded transition-colors"
                  >
                    Sample Disclaimer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScrubberInput("Will the market crash tomorrow during the FOMC rate decision?");
                      setScrubberConfidence(0.22);
                    }}
                    className="text-[9px] font-mono text-white/40 hover:text-white bg-white/5 px-2 py-1 rounded transition-colors"
                  >
                    Low Confidence (&lt;35%)
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isScrubbing || !scrubberInput.trim()}
                  className="px-4 py-2 bg-nexus-cyan/20 hover:bg-nexus-cyan/30 text-nexus-cyan border border-nexus-cyan/30 font-mono font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  {isScrubbing ? "Scrubbing..." : "Scrub & Calibrate"}
                </button>
              </div>
            </form>

            {/* Scrubber Output */}
            {scrubberResult && (
              <div className="p-4 bg-nexus-cyan/5 border border-nexus-cyan/20 rounded-xl space-y-2 font-mono text-[10px]">
                <div className="flex items-center justify-between text-nexus-cyan font-bold uppercase">
                  <span>Scrubber Result</span>
                  <span className={scrubberResult.epistemicRefusalEnforced ? "text-amber-400 font-bold" : "text-nexus-emerald"}>
                    {scrubberResult.epistemicRefusalEnforced ? "EPISTEMIC REFUSAL TRIGGERED" : "CLEANED HONEST OUTPUT"}
                  </span>
                </div>

                {scrubberResult.scrubbedPatterns.length > 0 && (
                  <div className="text-[9px] text-white/40">
                    <span>Scrubbed Boilers: </span>
                    <strong className="text-amber-300">{scrubberResult.scrubbedPatterns.length} phrases excised</strong>
                  </div>
                )}

                <div className="p-2.5 bg-black/50 rounded-lg border border-white/5 text-white/90">
                  {scrubberResult.cleaned}
                </div>
              </div>
            )}
          </div>

          {/* Layer 1 Focus: TEE Enclave Attestation & Hardware Security */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-nexus-emerald" />
                <h4 className="text-xs font-bold uppercase text-white tracking-wider">
                  Intel SGX EPC Substrate Details (Layer 1)
                </h4>
              </div>
              <span className="text-[8px] text-nexus-emerald bg-nexus-emerald/10 border border-nexus-emerald/20 px-2 py-0.5 rounded">
                HARDWARE ENCLAVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[9px]">
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-1">
                <span className="text-white/40 block uppercase">MRENCLAVE Measurement</span>
                <span className="text-white/70 block truncate">{enclaveHardware.mrenclave}</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-1">
                <span className="text-white/40 block uppercase">MRSIGNER Identity</span>
                <span className="text-white/70 block truncate">{enclaveHardware.mrsigner}</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-1">
                <span className="text-white/40 block uppercase">Hardware Entropy</span>
                <span className="text-nexus-cyan font-bold">{enclaveHardware.hardwareEntropyBits} bits (NIST SP 800-90B)</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-1">
                <span className="text-white/40 block uppercase">Attestation Nonce</span>
                <span className="text-nexus-emerald font-bold">{enclaveHardware.attestationNonce}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
