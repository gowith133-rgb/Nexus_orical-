import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, ScrollText, Wallet, Hourglass, ShieldCheck, Link2, Sun,
  ChevronRight, X, Smartphone, Loader2, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import {
  checkPortfolio, checkOracleGate, checkRiskRails, checkLedgerChain,
  type CheckResult,
} from '../lib/onboardingChecks';

type CheckState = 'idle' | 'checking' | 'passed' | 'failed';

interface OnboardingStep {
  headline: string;
  subtext: string;
  buttonLabel: string;
  icon: any;
  /** Runs the background verification for this screen. Null = build-time truth, shown as confirmed. */
  check: (() => CheckResult | Promise<CheckResult>) | null;
  checkKind: 'connection' | 'auto' | 'confirmed' | 'heartbeat';
}

const steps: OnboardingStep[] = [
  {
    headline: "One less thing to think about.",
    subtext:
      "Nexus watches the market and practices trading — on paper, out loud, where you can check its work. This will take about a minute to set up. You don't need to do anything.",
    buttonLabel: "Begin setup",
    icon: Sparkles,
    check: null,
    checkKind: 'connection',
  },
  {
    headline: "Paper money. Real practice.",
    subtext:
      "Everything Nexus does happens with simulated prices and paper cash. There are no broker connections in this app, no API keys to enter, and no way for it to touch real money. No account to create, no login, no password to forget — there's nothing of yours here to hold, so there's nothing to sign into. That's not a setting — it's how the app is built.",
    buttonLabel: "Got it",
    icon: ScrollText,
    check: null,
    checkKind: 'confirmed',
  },
  {
    headline: "Here's your practice account.",
    subtext:
      "Nexus starts you with a paper portfolio — virtual cash, one position at a time. When a trade closes, the full round trip is recorded: entry, exit, size, fees, and the realized result. Nothing is hidden, nothing is rounded away.",
    buttonLabel: "Continue",
    icon: Wallet,
    check: checkPortfolio,
    checkKind: 'auto',
  },
  {
    headline: "Stale signals don't get traded.",
    subtext:
      "Every trade signal Nexus generates carries a timestamp. Before anything executes, its confidence decays toward neutral on a 15-minute half-life — and anything older than an hour is thrown out entirely. If a signal arrives malformed, it's rejected too. When in doubt, Nexus does nothing.",
    buttonLabel: "Continue",
    icon: Hourglass,
    check: checkOracleGate,
    checkKind: 'auto',
  },
  {
    headline: "It knows when to stop itself.",
    subtext:
      "Three circuit breakers are baked in, and they can't be turned off or loosened from inside the app: if the account drops 8% from its peak, trading halts. If one day loses $300, trading halts for the day. No single trade risks more than $1,000. Once halted, it stays halted — it never restarts itself.",
    buttonLabel: "Continue",
    icon: ShieldCheck,
    check: checkRiskRails,
    checkKind: 'auto',
  },
  {
    headline: "Every trade, on the record.",
    subtext:
      "Each closed trade is written to a tamper-evident log — every entry chained to the one before it, so nothing can be edited or deleted without breaking the chain. A public ticker publishes the realized results where anyone can verify them. No names, no accounts, just the record.",
    buttonLabel: "Continue",
    icon: Link2,
    check: checkLedgerChain,
    checkKind: 'auto',
  },
  {
    headline: "You're set. Go live your life.",
    subtext:
      "The engine is running — watching, practicing, recording. Check in whenever you're curious; it'll be here doing its quiet work either way. Hug the kids, touch grass, relax. We've got it from here.",
    buttonLabel: "Open Nexus",
    icon: Sun,
    check: null,
    checkKind: 'heartbeat',
  },
];

const UNDER_HOOD_HEADLINE = "What's under the hood";
const UNDER_HOOD_SUBTEXT =
  "Nexus runs on MetaMatrix — software designed to live on ordinary phones instead of distant servers. The trading engine you just met is one of its quieter residents. This is a paper-trading demo of what that looks like: useful work, done calmly, on hardware you own.";

const ENGINE_UNREACHABLE =
  "Couldn't reach the engine — check your connection and try again";

interface OnboardingGuideProps {
  onComplete: () => void;
}

export function OnboardingGuide({ onComplete }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [checkState, setCheckState] = useState<CheckState>('idle');
  const [checkDetail, setCheckDetail] = useState<string>('');
  const [heartbeat, setHeartbeat] = useState(false);
  const [showUnderHood, setShowUnderHood] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const step = steps[currentStep];

  // One shared engine connection for the whole onboarding flow.
  // Screen 1 verifies it; Screen 7 waits on its first heartbeat.
  useEffect(() => {
    const socket = io();
    socketRef.current = socket;
    socket.on('state_update', () => setHeartbeat(true));
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Run the automatic check each time a check-bearing screen becomes active.
  useEffect(() => {
    if (step.checkKind !== 'auto' || !step.check) {
      setCheckState('idle');
      setCheckDetail('');
      return;
    }
    let cancelled = false;
    const runCheck = step.check;
    setCheckState('checking');
    setCheckDetail('');
    Promise.resolve()
      .then(() => runCheck())
      .then((result: CheckResult) => {
        if (cancelled) return;
        setCheckState(result.pass ? 'passed' : 'failed');
        setCheckDetail(result.detail);
      })
      .catch((e) => {
        if (cancelled) return;
        setCheckState('failed');
        setCheckDetail(e instanceof Error ? e.message : 'Check failed');
      });
    return () => {
      cancelled = true;
    };
  }, [currentStep, step]);

  const runConnectionCheck = async (): Promise<boolean> => {
    setCheckState('checking');
    setCheckDetail('');
    try {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error(`engine answered ${res.status}`);
      await res.json();
      // The socket handshake is the live channel the dashboard will use.
      const socket = socketRef.current;
      if (!socket || !socket.connected) {
        await new Promise<void>((resolve, reject) => {
          const s = socketRef.current;
          if (!s) return reject(new Error('no socket'));
          if (s.connected) return resolve();
          const timer = setTimeout(() => reject(new Error('socket timeout')), 8000);
          s.once('connect', () => {
            clearTimeout(timer);
            resolve();
          });
          s.connect();
        });
      }
      setCheckState('passed');
      setCheckDetail('engine answering');
      return true;
    } catch {
      setCheckState('failed');
      setCheckDetail('');
      return false;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleButton = async () => {
    if (step.checkKind === 'connection') {
      const ok = await runConnectionCheck();
      if (ok) nextStep();
      return;
    }
    if (step.checkKind === 'heartbeat') {
      if (heartbeat) onComplete();
      return;
    }
    // 'auto' and 'confirmed' screens advance once their check has passed.
    if (checkState === 'passed' || step.checkKind === 'confirmed') {
      nextStep();
    }
  };

  const retryCheck = () => {
    if (step.checkKind === 'connection') {
      void runConnectionCheck().then((ok) => {
        if (ok) nextStep();
      });
      return;
    }
    const check = step.check;
    if (!check) return;
    setCheckState('checking');
    setCheckDetail('');
    Promise.resolve()
      .then(() => check())
      .then((result: CheckResult) => {
        setCheckState(result.pass ? 'passed' : 'failed');
        setCheckDetail(result.detail);
      })
      .catch((e) => {
        setCheckState('failed');
        setCheckDetail(e instanceof Error ? e.message : 'Check failed');
      });
  };

  const skip = () => onComplete();

  const buttonDisabled =
    (step.checkKind === 'auto' && checkState !== 'passed') ||
    (step.checkKind === 'connection' && checkState === 'checking') ||
    (step.checkKind === 'heartbeat' && !heartbeat);

  const renderCheckLine = () => {
    if (step.checkKind === 'confirmed') {
      return (
        <div className="flex items-center gap-2 text-nexus-emerald/90 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>Confirmed in this build</span>
        </div>
      );
    }
    if (step.checkKind === 'heartbeat') {
      return heartbeat ? (
        <div className="flex items-center gap-2 text-nexus-emerald/90 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>Engine is live</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Waiting for the engine…</span>
        </div>
      );
    }
    if (step.checkKind === 'connection' && checkState === 'failed') {
      return (
        <div className="flex items-start gap-2 text-amber-300/90 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{ENGINE_UNREACHABLE}</span>
        </div>
      );
    }
    if (checkState === 'checking') {
      return (
        <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Verifying…</span>
        </div>
      );
    }
    if (checkState === 'passed') {
      return (
        <div className="flex items-center gap-2 text-nexus-emerald/90 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>Verified{checkDetail ? ` — ${checkDetail}` : ''}</span>
        </div>
      );
    }
    if (checkState === 'failed') {
      return (
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-amber-300/90 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              A verification check didn&apos;t pass{checkDetail ? `: ${checkDetail}` : ''}. Nothing
              advances until it&apos;s green.
            </span>
          </div>
          <button
            onClick={retryCheck}
            className="text-xs font-bold text-nexus-cyan hover:text-white transition-colors underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      );
    }
    return null;
  };

  const renderUnderHood = () => (
    <motion.div
      key="under-hood"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="inline-flex items-center justify-center p-4 bg-nexus-emerald/10 rounded-2xl">
        <Smartphone className="w-8 h-8 text-nexus-emerald" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-serif italic text-white emerald-glow leading-tight">
          {UNDER_HOOD_HEADLINE}
        </h2>
        <p className="text-white/60 text-sm leading-relaxed font-medium">{UNDER_HOOD_SUBTEXT}</p>
      </div>
      <div className="pt-6 flex justify-end">
        <button
          onClick={() => setShowUnderHood(false)}
          className="px-6 py-3 steampunk-gradient text-nexus-bg rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
        >
          Back
        </button>
      </div>
    </motion.div>
  );

  const renderStep = () => {
    const Icon = step.icon;
    const isLast = currentStep === steps.length - 1;
    return (
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="inline-flex items-center justify-center p-4 bg-nexus-emerald/10 rounded-2xl">
          <Icon className="w-8 h-8 text-nexus-emerald" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-serif italic text-white emerald-glow leading-tight">
            {step.headline}
          </h2>
          <p className="text-white/60 text-sm leading-relaxed font-medium">{step.subtext}</p>
          {isLast && (
            <p className="text-white/40 text-sm leading-relaxed font-medium">
              <span className="italic">There&apos;s more running under the hood than this screen shows. </span>
              <button
                onClick={() => setShowUnderHood(true)}
                className="text-nexus-cyan hover:text-white transition-colors underline underline-offset-4 font-bold"
              >
                What&apos;s under the hood? →
              </button>
            </p>
          )}
        </div>

        {renderCheckLine()}

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
            onClick={handleButton}
            disabled={buttonDisabled}
            className="px-6 py-3 steampunk-gradient text-nexus-bg rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100 disabled:cursor-not-allowed"
          >
            {step.checkKind === 'connection' && checkState === 'checking'
              ? "Connecting…"
              : step.buttonLabel}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  };

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
          aria-label="Skip onboarding"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-10">
          <AnimatePresence mode="wait">
            {showUnderHood ? renderUnderHood() : renderStep()}
          </AnimatePresence>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-nexus-cyan/10 rounded-full blur-[80px]" />
      </motion.div>
    </div>
  );
}
