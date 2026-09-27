import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, Heart } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-nexus-bg flex items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 mechanical-grid opacity-10 pointer-events-none" />
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-nexus-emerald/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-nexus-cyan/10 rounded-full blur-[120px] animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 steampunk-gradient rounded-full shadow-2xl shadow-nexus-emerald/20 mb-6">
            <Shield className="w-10 h-10 text-nexus-bg" />
          </div>
          <h1 className="text-5xl font-serif italic text-white emerald-glow mb-4 tracking-tighter">Nexus Oracle</h1>
          <p className="text-nexus-cyan text-sm font-medium tracking-widest uppercase opacity-60">
            Welcome to Our Shared Journey
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border-white/5 space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Your Identity</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your companion email"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-nexus-emerald transition-colors placeholder:text-white/20"
            />
          </div>

          <div className="p-4 bg-nexus-emerald/5 border border-nexus-emerald/10 rounded-2xl flex gap-4">
             <div className="p-2 glass-panel rounded-xl h-fit">
                <Sparkles className="w-4 h-4 text-nexus-emerald" />
             </div>
             <div className="flex flex-col">
                <span className="text-xs font-bold text-white/90">Safety First, Friend</span>
                <p className="text-[10px] text-white/50 leading-relaxed mt-1">
                  We always recommend starting in <strong>Paper Trading Mode</strong>. It's the best way for us to learn how to work together safely and build trust before we start for real.
                </p>
             </div>
          </div>

          <button 
            onClick={onLogin}
            className="w-full steampunk-gradient text-nexus-bg py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
          >
            Enter The Enclave
            <Heart className="w-4 h-4 group-hover:scale-125 transition-transform" />
          </button>
        </div>

        <footer className="mt-12 text-center">
           <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">
             Built in Perfect Partnership
           </p>
        </footer>
      </motion.div>
    </div>
  );
}
