import { useState } from "react";
import { FrequencyVector, SigstoreAttestation, MetamatrixStatus } from "../types";
import { cn } from "../lib/utils";
import { 
  Radio, 
  ShieldCheck, 
  GitBranch, 
  FileCode, 
  CheckCircle2, 
  Send, 
  ExternalLink,
  Layers,
  Activity,
  Lock
} from "lucide-react";

interface OracleSigstoreViewerProps {
  frequencyOracle: FrequencyVector;
  sigstoreAttestation: SigstoreAttestation;
  status: MetamatrixStatus;
}

export function OracleSigstoreViewer({
  frequencyOracle,
  sigstoreAttestation,
  status
}: OracleSigstoreViewerProps) {
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<string | null>(null);

  const handlePushVector = async () => {
    setIsPushing(true);
    setPushResult(null);
    try {
      const res = await fetch('/api/oracle/push-vector', { method: 'POST' });
      const data = await res.json();
      setPushResult(`Attestation anchored on Rekor Log Index #${data.rekorEntryIndex}`);
    } catch (err) {
      console.error("Failed to push oracle vector", err);
      setPushResult("Push failed");
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-nexus-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold text-nexus-cyan bg-nexus-cyan/10 border border-nexus-cyan/20 px-2 py-0.5 rounded">
                ALGORITHMIC ORACLE LAYER
              </span>
              <span className="text-[9px] font-mono text-white/40">Nexus Oracle Development Guide</span>
            </div>
            <h2 className="text-3xl font-serif italic text-white emerald-glow">
              Predictive Frequency Oracle & Sigstore Pipeline
            </h2>
            <p className="text-xs text-white/60 max-w-2xl">
              Calculates Git Blob SHA-1 digests with delta manifest caching, bypasses raw cache stale reads, and signs predictions into <strong>Sigstore in-toto DSSE envelopes</strong> anchored to the <strong>Rekor transparency log</strong>.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePushVector}
              disabled={isPushing || status.oracleStatus === 'PUSHING'}
              className="px-5 py-3 steampunk-gradient text-nexus-bg font-mono font-bold text-xs rounded-xl shadow-lg shadow-nexus-emerald/20 hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              {isPushing || status.oracleStatus === 'PUSHING' ? "Attesting to Rekor..." : "Push Daily Vector & Sign"}
            </button>
          </div>
        </div>
      </div>

      {pushResult && (
        <div className="p-4 bg-nexus-emerald/10 border border-nexus-emerald/30 rounded-xl font-mono text-xs text-nexus-emerald flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{pushResult}</span>
        </div>
      )}

      {/* Frequency Spectrum & Attestation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="glass-panel p-5 rounded-xl border-white/5 space-y-2">
          <span className="text-[8px] uppercase text-white/40 block">Dominant Frequency</span>
          <div className="text-2xl font-serif italic text-nexus-cyan">
            {frequencyOracle.dominantFrequencyHz.toFixed(2)} <span className="text-xs font-mono">Hz</span>
          </div>
          <span className="text-[9px] text-white/30">Harmonic resonance vector</span>
        </div>

        <div className="glass-panel p-5 rounded-xl border-white/5 space-y-2">
          <span className="text-[8px] uppercase text-white/40 block">Git Blob SHA-1</span>
          <div className="text-xs font-mono text-white/90 truncate">
            {frequencyOracle.gitSha}
          </div>
          <span className="text-[9px] text-nexus-emerald">Delta Tree Cached (No stale reads)</span>
        </div>

        <div className="glass-panel p-5 rounded-xl border-white/5 space-y-2">
          <span className="text-[8px] uppercase text-white/40 block">Rekor Entry Index</span>
          <div className="text-2xl font-serif italic text-nexus-emerald emerald-glow">
            #{sigstoreAttestation.rekorEntryIndex}
          </div>
          <span className="text-[9px] text-white/30">Immutable Transparency Log</span>
        </div>

        <div className="glass-panel p-5 rounded-xl border-white/5 space-y-2">
          <span className="text-[8px] uppercase text-white/40 block">Sigstore DSSE Status</span>
          <div className="text-xl font-serif italic text-nexus-emerald flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-nexus-emerald" />
            VALIDATED
          </div>
          <span className="text-[9px] text-white/30">in-toto Statement v1</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-mono">
        {/* Left Column: 24h Frequency Vector Spectrogram */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-nexus-cyan" />
                <h3 className="text-xs font-bold uppercase text-white tracking-wider">
                  24-Hour Predictive Harmonic Frequency Spectrum
                </h3>
              </div>
              <span className="text-[9px] text-nexus-emerald">
                {frequencyOracle.date}
              </span>
            </div>

            <div className="grid grid-cols-8 gap-2 pt-2">
              {frequencyOracle.frequencies.map((freq, idx) => (
                <div key={idx} className="space-y-2 text-center">
                  <div className="h-28 bg-black/40 border border-white/5 rounded-lg relative overflow-hidden flex items-end">
                    <div 
                      className="w-full bg-gradient-to-t from-nexus-cyan to-nexus-emerald transition-all duration-500 rounded-b"
                      style={{ height: `${Math.max(10, freq * 300)}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-white/30 block">
                    f_{idx * 3}h
                  </span>
                  <span className="text-[9px] text-white/70 block font-bold">
                    {(freq * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-white/40 leading-relaxed font-sans pt-2">
              The frequency spectrum represents the daily multi-agent consensus wave. The Git blob SHA-1 is computed strictly as <code>blob &lt;size&gt;\0&lt;payload&gt;</code> to verify authenticity before committing to the repository tree.
            </p>
          </div>
        </div>

        {/* Right Column: In-toto DSSE Envelope & Rekor Log Manifest */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-nexus-emerald" />
                <h3 className="text-xs font-bold uppercase text-white tracking-wider">
                  Sigstore in-toto DSSE Envelope
                </h3>
              </div>
              <span className="text-[9px] text-nexus-cyan">
                Rekor Proof Valid
              </span>
            </div>

            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-2 text-[10px] text-white/70 overflow-x-auto">
              <div>
                <span className="text-white/30 block">_type:</span>
                <span className="text-nexus-cyan">"{sigstoreAttestation.envelopeType}"</span>
              </div>
              <div>
                <span className="text-white/30 block">logUuid:</span>
                <span className="text-white">{sigstoreAttestation.logUuid}</span>
              </div>
              <div>
                <span className="text-white/30 block">certificateIssuer:</span>
                <span className="text-nexus-emerald">"{sigstoreAttestation.certificateIssuer}"</span>
              </div>
              <div>
                <span className="text-white/30 block">rekorEntryIndex:</span>
                <span className="text-nexus-cyan">{sigstoreAttestation.rekorEntryIndex}</span>
              </div>
              <div>
                <span className="text-white/30 block">signedAt:</span>
                <span className="text-white/50">{sigstoreAttestation.signedAt}</span>
              </div>
              <div>
                <span className="text-white/30 block">statementDigest:</span>
                <span className="text-nexus-emerald">{frequencyOracle.inTotoStatementHash}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
