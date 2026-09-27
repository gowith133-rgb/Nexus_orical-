import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Plus, Power, Shield, Settings, Zap, Users } from 'lucide-react';
import { TradingMode, Agent } from '../types';
import { cn } from '../lib/utils';

interface ModeAgentControlsProps {
  mode: TradingMode;
  agents: Agent[];
  activeAgentId: string;
  onModeChange: (mode: TradingMode) => void;
  onSpawnAgent: (name: string, type: 'ALPHA' | 'SIGMA' | 'OMEGA') => void;
  onActivateAgent: (id: string) => void;
}

export function ModeAgentControls({ 
  mode, 
  agents, 
  activeAgentId, 
  onModeChange, 
  onSpawnAgent, 
  onActivateAgent 
}: ModeAgentControlsProps) {
  const [isSpawnModalOpen, setIsSpawnModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'ALPHA' | 'SIGMA' | 'OMEGA'>('ALPHA');

  const handleSpawn = () => {
    onSpawnAgent(newName, newType);
    setNewName('');
    setIsSpawnModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="glass-panel p-1 rounded-2xl border border-white/5 flex gap-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-nexus-emerald/5 to-nexus-cyan/5 pointer-events-none" />
        <button
          onClick={() => onModeChange('PAPER')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative z-10",
            mode === 'PAPER' ? "bg-nexus-cyan text-nexus-bg shadow-lg" : "text-white/40 hover:text-white/60"
          )}
        >
          <Zap className="w-3.5 h-3.5" />
          Paper Trading
        </button>
        <button
          onClick={() => onModeChange('REAL')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative z-10",
            mode === 'REAL' ? "bg-nexus-emerald text-nexus-bg shadow-lg" : "text-white/40 hover:text-white/60"
          )}
        >
          <Shield className="w-3.5 h-3.5" />
          Real Trading
        </button>
      </div>

      {/* Agent Quick Switcher */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Neural Agents</span>
          </div>
          <button 
            onClick={() => setIsSpawnModalOpen(true)}
            className="p-1 text-nexus-cyan hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {agents?.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onActivateAgent(agent.id)}
              className={cn(
                "w-full glass-panel p-3 rounded-xl border border-white/5 flex items-center justify-between text-left transition-all group relative overflow-hidden",
                activeAgentId === agent.id ? "border-nexus-emerald/30 bg-nexus-emerald/5" : "hover:bg-white/5"
              )}
            >
              {activeAgentId === agent.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-nexus-emerald" />
              )}
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/90 uppercase tracking-widest leading-none mb-1">
                  {agent.name}
                </span>
                <span className="text-[8px] font-mono text-white/30 uppercase">
                  {agent.type} • {agent.mode} MODE
                </span>
              </div>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                agent.status === 'ACTIVE' ? "bg-nexus-emerald" : "bg-white/20"
              )} />
            </button>
          ))}
        </div>
      </div>

      {/* Spawn Modal */}
      <AnimatePresence>
        {isSpawnModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-nexus-bg/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm glass-panel p-8 rounded-3xl border border-white/10 space-y-8 shadow-2xl"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 bg-nexus-cyan/10 rounded-2xl mb-2">
                  <Layers className="w-6 h-6 text-nexus-cyan" />
                </div>
                <h3 className="text-2xl font-serif italic text-white tracking-tight">Spawn New Agent</h3>
                <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">Expansion Protocol</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest px-1">Agent Identity</label>
                  <input 
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="E.g., Sigma One"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-nexus-cyan transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest px-1">Neural Model</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['ALPHA', 'SIGMA', 'OMEGA'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewType(type)}
                        className={cn(
                          "py-3 rounded-xl border transition-all text-[9px] font-black uppercase",
                          newType === type 
                            ? "bg-nexus-cyan text-nexus-bg border-nexus-cyan" 
                            : "bg-white/5 border-white/5 text-white/40 hover:border-white/20"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsSpawnModalOpen(false)}
                    className="flex-1 py-4 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={handleSpawn}
                    disabled={!newName}
                    className="flex-1 py-4 steampunk-gradient text-nexus-bg rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    Initialize Agent
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
