import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Target, Zap, Network, Rocket, ChevronRight, X, Users, Layers } from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: any;
  highlightId?: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to Nexus Oracle",
    description: "You've entered a shared vision where humans and AI work in perfect harmony. Let's walk through our mutual landscape.",
    icon: Shield,
  },
  {
    title: "The Shared Vision",
    description: "At the top, you'll see the market we watch together. This is our anchor—the real-time pulse of our shared focus.",
    icon: Target,
  },
  {
    title: "Our Vital Signs",
    description: "These indicators track our collective energy and focus. 'Narrow Gate' shows when our daily predictions are cryptographically signed and secured via Sigstore.",
    icon: Network,
  },
  {
    title: "Agent Neural Network",
    description: "You can spawn multiple specialized agents to explore different market nuances. Switch active agents to see their unique state and processing logic.",
    icon: Users,
  },
  {
    title: "Paper vs Real Trading",
    description: "Start in Paper mode to learn the rhythms together. When ready, switch to Real mode to anchor operations in the Rekor transparency log via Sigstore attestation.",
    icon: Layers,
  },
  {
    title: "Ready to Dream?",
    description: "Our story together is just beginning. Every action is recorded in 'Our Story Together' to build a permanent, immutable bond.",
    icon: Rocket,
  },
];

interface OnboardingGuideProps {
  onComplete: () => void;
}

export function OnboardingGuide({ onComplete }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const skip = () => onComplete();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-nexus-bg/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg glass-panel relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <motion.div 
            className="h-full bg-nexus-emerald"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <button 
          onClick={skip}
          className="absolute top-4 right-4 p-2 text-white/20 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center justify-center p-4 bg-nexus-emerald/10 rounded-2xl">
                {(() => {
                  const Icon = steps[currentStep].icon;
                  return <Icon className="w-8 h-8 text-nexus-emerald" />;
                })()}
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-serif italic text-white emerald-glow leading-tight">
                  {steps[currentStep].title}
                </h2>
                <p className="text-white/60 text-sm leading-relaxed font-medium">
                  {steps[currentStep].description}
                </p>
              </div>

              <div className="pt-6 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div 
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        i === currentStep ? "bg-nexus-emerald w-4" : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                
                <button 
                  onClick={nextStep}
                  className="px-6 py-3 steampunk-gradient text-nexus-bg rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                >
                  {currentStep === steps.length - 1 ? "Start Journey" : "Next Step"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-nexus-cyan/10 rounded-full blur-[80px]" />
      </motion.div>
    </div>
  );
}
