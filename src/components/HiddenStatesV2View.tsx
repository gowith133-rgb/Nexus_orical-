import { useState } from "react";
import { 
  ProcessorOutput, 
  ProcessorConfig, 
  LatentTrajectoryPoint 
} from "../types";
import { cn } from "../lib/utils";
import { 
  Sliders, 
  Activity, 
  Compass, 
  Zap, 
  Cpu, 
  Info,
  CheckCircle2,
  Maximize2
} from "lucide-react";

interface HiddenStatesV2ViewProps {
  outputs: ProcessorOutput[];
  trajectories: LatentTrajectoryPoint[];
  config: ProcessorConfig;
  onUpdateConfig: (config: Partial<ProcessorConfig>) => void;
}

export function HiddenStatesV2View({
  outputs,
  trajectories,
  config,
  onUpdateConfig
}: HiddenStatesV2ViewProps) {
  const [temperature, setTemperature] = useState(config.temperature);
  const [stepThreshold, setStepThreshold] = useState(config.stepThreshold);
  const [normEpsilon, setNormEpsilon] = useState(config.normEpsilon);
  const [selectedTransform, setSelectedTransform] = useState<string>(config.activeTransform);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleApplyConfig = async () => {
    setIsUpdating(true);
    try {
      await fetch('/api/processor/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature: parseFloat(temperature.toString()),
          stepThreshold: parseFloat(stepThreshold.toString()),
          normEpsilon: parseFloat(normEpsilon.toString()),
          activeTransform: selectedTransform
        })
      });
      onUpdateConfig({
        temperature: parseFloat(temperature.toString()),
        stepThreshold: parseFloat(stepThreshold.toString()),
        normEpsilon: parseFloat(normEpsilon.toString()),
        activeTransform: selectedTransform as any
      });
    } catch (err) {
      console.error("Failed to update processor config", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const activeOutput = outputs.find(o => o.class === selectedTransform) || outputs[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-nexus-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold text-nexus-cyan bg-nexus-cyan/10 border border-nexus-cyan/20 px-2 py-0.5 rounded">
                PYTHON PROCESSOR V2
              </span>
              <span className="text-[9px] font-mono text-white/40">hidden-states-processor-v2.py</span>
            </div>
            <h2 className="text-3xl font-serif italic text-white emerald-glow">
              Hidden States Engine v2
            </h2>
            <p className="text-xs text-white/60 max-w-2xl">
              High-dimensional latent vector transformations with real-time Shannon entropy calculation, LayerNorm stabilization, temperature-scaled Boltzmann distribution, and Heaviside step quantization.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white/[0.03] border border-white/10 px-4 py-3 rounded-xl flex flex-col items-center">
              <span className="text-[8px] font-mono uppercase text-white/40">Drift Vector (Δh)</span>
              <span className="text-xl font-serif italic text-nexus-emerald">
                {config.driftDistance ? config.driftDistance.toFixed(4) : "0.0421"}
              </span>
            </div>
            <div className="bg-white/[0.03] border border-white/10 px-4 py-3 rounded-xl flex flex-col items-center">
              <span className="text-[8px] font-mono uppercase text-white/40">Shannon Entropy</span>
              <span className="text-xl font-serif italic text-nexus-cyan">
                {activeOutput?.entropy?.toFixed(2) || "2.14"} <span className="text-xs text-white/30">bits</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Latent PCA Trajectory & Interactive Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* 2D Trajectory Visualizer */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-nexus-cyan" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/90">
                  Latent Space Phase Plane (2D PCA)
                </span>
              </div>
              <span className="text-[9px] font-mono text-nexus-emerald">
                {trajectories.length} points
              </span>
            </div>

            <div className="relative w-full aspect-square bg-black/40 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center p-4">
              {/* Coordinate Grid lines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-px bg-white/10" />
                <div className="h-full w-px bg-white/10 absolute" />
              </div>
              {/* Concentric distance rings */}
              <div className="absolute w-3/4 h-3/4 border border-dashed border-white/5 rounded-full pointer-events-none" />
              <div className="absolute w-1/2 h-1/2 border border-dashed border-white/5 rounded-full pointer-events-none" />

              {/* Trajectory SVG */}
              <svg className="w-full h-full relative z-10 overflow-visible" viewBox="-1.2 -1.2 2.4 2.4">
                {/* Historical trajectory path */}
                {trajectories.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="rgba(6, 182, 212, 0.4)"
                    strokeWidth="0.015"
                    strokeDasharray="0.03 0.015"
                    points={trajectories.map(p => `${p.x},${p.y}`).join(' ')}
                  />
                )}
                {/* Trajectory points */}
                {trajectories.map((p, idx) => {
                  const isLatest = idx === trajectories.length - 1;
                  return (
                    <g key={idx}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isLatest ? 0.05 : 0.02}
                        className={cn(
                          isLatest ? "fill-nexus-emerald animate-pulse" : "fill-nexus-cyan/40"
                        )}
                      />
                      {isLatest && (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={0.09}
                          fill="none"
                          stroke="rgba(16, 185, 129, 0.5)"
                          strokeWidth="0.01"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              <div className="absolute bottom-2 left-3 text-[8px] font-mono text-white/30">
                X: Latent Dimension 1 (Eigen 1)
              </div>
              <div className="absolute top-2 right-3 text-[8px] font-mono text-white/30">
                Y: Latent Dimension 2 (Eigen 2)
              </div>
            </div>

            <p className="text-[10px] text-white/40 leading-relaxed font-mono">
              Trajectory maps semantic drift vectors across state transitions. Trajectory convergence signifies cognitive equilibrium, while expansion indicates market volatility response.
            </p>
          </div>

          {/* Processor Parameters Slider Controls */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Sliders className="w-4 h-4 text-nexus-emerald" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/90">
                Processor Hyperparameters
              </span>
            </div>

            {/* Transform Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase text-white/50 block">
                Active Transformation Pipeline
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Identity', 'Normalize', 'Softmax', 'Step'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setSelectedTransform(mode)}
                    className={cn(
                      "py-2 px-3 rounded-lg text-xs font-mono transition-all text-left border",
                      selectedTransform === mode
                        ? "bg-nexus-emerald/15 border-nexus-emerald text-nexus-emerald font-bold"
                        : "bg-white/[0.02] border-white/5 text-white/60 hover:text-white"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-white/50">Softmax Temperature (τ)</span>
                <span className="text-nexus-cyan font-bold">{temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.05"
                value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-nexus-cyan cursor-pointer"
              />
              <div className="flex justify-between text-[8px] font-mono text-white/20">
                <span>0.1 (Argmax Sharp)</span>
                <span>1.0 (Standard)</span>
                <span>2.0 (High Entropy)</span>
              </div>
            </div>

            {/* Step Threshold Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-white/50">Heaviside Step Threshold (θ)</span>
                <span className="text-nexus-emerald font-bold">{stepThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={stepThreshold}
                onChange={e => setStepThreshold(parseFloat(e.target.value))}
                className="w-full accent-nexus-emerald cursor-pointer"
              />
              <div className="flex justify-between text-[8px] font-mono text-white/20">
                <span>0.1 (High Density)</span>
                <span>0.5 (Median)</span>
                <span>0.9 (Sparse Firing)</span>
              </div>
            </div>

            {/* Norm Epsilon Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-white/50">LayerNorm Epsilon (ε)</span>
                <span className="text-nexus-cyan font-bold">{normEpsilon.toExponential(2)}</span>
              </div>
              <input
                type="range"
                min="0.00001"
                max="0.005"
                step="0.00005"
                value={normEpsilon}
                onChange={e => setNormEpsilon(parseFloat(e.target.value))}
                className="w-full accent-nexus-cyan cursor-pointer"
              />
            </div>

            <button
              onClick={handleApplyConfig}
              disabled={isUpdating}
              className="w-full py-2.5 steampunk-gradient text-nexus-bg font-bold font-mono text-xs rounded-xl shadow-lg shadow-nexus-emerald/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              {isUpdating ? "Synchronizing Matrix..." : "Apply Hyperparameters"}
            </button>
          </div>
        </div>

        {/* Right Column: Comparative Transformation Inspection & Bar Charts */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-nexus-emerald" />
                <div>
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                    4-Stage Transform Output Comparison
                  </h3>
                  <span className="text-[10px] text-white/40 font-mono">
                    8-Dimensional Latent State Vector [h₀ ... h₇]
                  </span>
                </div>
              </div>
              <div className="text-[9px] font-mono text-nexus-emerald bg-nexus-emerald/10 border border-nexus-emerald/20 px-2.5 py-1 rounded-full">
                ONLINE TICK
              </div>
            </div>

            <div className="space-y-6">
              {outputs.map((out) => {
                const isSelected = selectedTransform === out.class;
                return (
                  <div 
                    key={out.class}
                    onClick={() => setSelectedTransform(out.class)}
                    className={cn(
                      "p-4 rounded-xl border transition-all cursor-pointer space-y-3",
                      isSelected 
                        ? "bg-white/[0.04] border-nexus-emerald/40 shadow-md shadow-nexus-emerald/5" 
                        : "bg-black/20 border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          isSelected ? "bg-nexus-emerald animate-pulse" : "bg-white/20"
                        )} />
                        <span className="text-xs font-mono font-bold text-white uppercase">
                          {out.class} Transformation
                        </span>
                        {isSelected && (
                          <span className="text-[8px] font-mono text-nexus-emerald uppercase px-1.5 py-0.5 rounded bg-nexus-emerald/10">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-[9px] font-mono">
                        <span className="text-white/40">
                          Entropy: <strong className="text-nexus-cyan">{out.entropy?.toFixed(2) || "2.14"} bits</strong>
                        </span>
                        <span className="text-white/40">
                          Sparsity: <strong className="text-nexus-emerald">{((out.sparsity || 0) * 100).toFixed(0)}%</strong>
                        </span>
                        <span className="text-white/40">
                          Var: <strong className="text-zinc-300">{(out.normVariance || 0.01).toFixed(4)}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Bar visualization of the 8 latent dims */}
                    <div className="grid grid-cols-8 gap-2">
                      {out.value?.map((v, i) => (
                        <div key={i} className="space-y-1.5 text-center">
                          <div className="h-16 bg-black/40 border border-white/5 rounded-md relative overflow-hidden group">
                            <div
                              className={cn(
                                "absolute bottom-0 left-0 right-0 transition-all duration-300",
                                isSelected 
                                  ? "bg-gradient-to-t from-nexus-emerald to-nexus-cyan" 
                                  : "bg-white/20 group-hover:bg-nexus-cyan/40"
                              )}
                              style={{ height: `${Math.max(4, Math.min(100, v * 100))}%` }}
                            />
                          </div>
                          <span className="text-[8px] font-mono text-white/30 block truncate">
                            h_{i}
                          </span>
                          <span className="text-[8px] font-mono text-white/60 block font-bold truncate">
                            {v.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mathematical Formulations Reference */}
          <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-3 font-mono text-[10px] text-white/60">
            <div className="flex items-center gap-2 text-white/90 font-bold uppercase">
              <Info className="w-3.5 h-3.5 text-nexus-cyan" />
              <span>Architectural Formulations (hidden-states-processor-v2)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 space-y-1">
                <span className="text-nexus-cyan block font-bold">Shannon State Entropy:</span>
                <code>H(X) = - Σ [ p(x_i) · log₂ p(x_i) ]</code>
                <p className="text-[9px] text-white/40 mt-1">Measures latent cognitive uncertainty & representation diversity.</p>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 space-y-1">
                <span className="text-nexus-emerald block font-bold">LayerNorm Stabilization:</span>
                <code>y = ((x - μ) / √(σ² + ε)) · γ + β</code>
                <p className="text-[9px] text-white/40 mt-1">Prevents vanishing gradients during deep latent recursion.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
