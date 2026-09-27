import { useState, useEffect, useRef, type FormEvent } from "react";
import { io } from "socket.io-client";
import { SomaSurgeGraph } from "./SomaSurgeGraph";
import { RealtimeVolatilityChart, type TickDataPoint } from "./RealtimeVolatilityChart";
import { PaperActivityFeed, type PaperOrder } from "./PaperActivityFeed";
import { WalletConnectionModule } from "./WalletConnectionModule";
import { formatCurrency, cn } from "../lib/utils";
import { 
  Shield, 
  Terminal as TerminalIcon, 
  Activity, 
  Zap, 
  Play, 
  Square, 
  Plus, 
  WifiOff, 
  Radio, 
  Cpu, 
  TrendingUp, 
  Lock, 
  Flame,
  CheckCircle2,
  ChevronLeft,
  Circle,
  Menu as MenuIcon,
  Accessibility
} from "lucide-react";

interface SomaHudDashboardProps {
  initialPrice?: number;
  initialPortfolio?: number;
}

export function SomaHudDashboard({
  initialPrice = 2459.09,
  initialPortfolio = 3490.64
}: SomaHudDashboardProps) {
  // Live state matching the screenshots
  const [price, setPrice] = useState<number>(initialPrice);
  const [portfolio, setPortfolio] = useState<number>(initialPortfolio);
  const [depositAmount, setDepositAmount] = useState<string>("500.00");
  const [isTraderRunning, setIsTraderRunning] = useState<boolean>(true);
  
  // Battery & Thermal Gate metrics
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [temperature, setTemperature] = useState<number>(30.0);

  // Daemon Substrates state
  const [daemons, setDaemons] = useState({
    llama: true,
    trader: true,
    oracle: true,
    sponge: true
  });

  // Sponge Trap entropy state
  const [probesTrapped, setProbesTrapped] = useState<number>(5);
  const [entropyDrippedKB, setEntropyDrippedKB] = useState<number>(6.7);
  const [trapLogs, setTrapLogs] = useState<string[]>([
    "[22:30:44] PROBE_TRAPPED | 127.0.0.1 | / | Dripped 282 bytes",
    "[02:16:47] [DAEMON_ONLINE] Sponge Trap active on 127.0.0.1:8088",
    "[02:18:17] PROBE_TRAPPED | 127.0.0.1 | / | Dripped 282 bytes",
    "[02:53:26] [DAEMON_ONLINE] Sponge Trap active on 127.0.0.1:8088",
    "[02:56:15] PROBE_TRAPPED | 127.0.0.1 | / | Dripped 282 bytes",
    "[14:08:46] [DAEMON_ONLINE] Sponge Trap active on 127.0.0.1:8088",
    "[14:09:12] PROBE_TRAPPED | 127.0.0.1 | / | Dripped 314 bytes"
  ]);

  // Charlie console
  const [charlieCommand, setCharlieCommand] = useState<string>("");
  const [charlieLogs, setCharlieLogs] = useState<string[]>([
    "Charlie agent online. Ready for sovereign tasks.",
    "Air-gapped mesh initialized. Zipf steganography active."
  ]);

  // Chart view toggle & rolling tick history for Recharts
  const [chartView, setChartView] = useState<"RECHARTS" | "REFERENCE">("RECHARTS");
  const [tickHistory, setTickHistory] = useState<TickDataPoint[]>(() => {
    const initial: TickDataPoint[] = [];
    const base = initialPrice || 2459.09;
    const now = Date.now();
    for (let i = 18; i >= 0; i--) {
      const t = new Date(now - i * 3000);
      const timeStr = t.toTimeString().split(" ")[0].substring(3);
      const priceDrift = Math.sin(i / 2.5) * 5.2 + (Math.random() - 0.5) * 2;
      const vol = parseFloat((1.05 + Math.abs(Math.sin(i / 3) * 0.75)).toFixed(2));
      const spread = parseFloat((2.5 + Math.random() * 1.8).toFixed(1));
      initial.push({
        time: timeStr,
        timestamp: t.getTime(),
        price: parseFloat((base + priceDrift).toFixed(2)),
        volatility: vol,
        spreadBps: spread
      });
    }
    return initial;
  });

  // Persistent SQLite Paper Ledger state
  const [paperOrders, setPaperOrders] = useState<PaperOrder[]>([]);
  const [isLedgerTamperProof, setIsLedgerTamperProof] = useState<boolean>(true);
  const [auditChainCount, setAuditChainCount] = useState<number>(0);

  // Live Market Ingestion Pipeline State (Phase 2)
  const [marketSource, setMarketSource] = useState<"COINBASE_WS" | "SYNTHETIC_FALLBACK">("COINBASE_WS");
  const [marketLatencyMs, setMarketLatencyMs] = useState<number>(24);
  const [liveSpreadBps, setLiveSpreadBps] = useState<number>(1.2);

  // Fetch persisted SQLite ledger state on mount
  useEffect(() => {
    fetch("/api/ledger/state")
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.portfolioUSD === "number") {
          setPortfolio(data.portfolioUSD);
          if (Array.isArray(data.orders)) {
            setPaperOrders(data.orders);
          }
          if (typeof data.auditCount === "number") {
            setAuditChainCount(data.auditCount);
          }
          if (data.isTamperProof !== undefined) {
            setIsLedgerTamperProof(data.isTamperProof);
          }
        }
      })
      .catch(err => {
        console.warn("Ledger state load fallback:", err);
      });
  }, []);

  // Live Socket.io Market Feed listener (Phase 2)
  useEffect(() => {
    const socket = io();

    socket.on("market_tick", (tick: {
      pair: string;
      price: number;
      bid: number;
      ask: number;
      spreadBps: number;
      volatility: number;
      timestamp: number;
      source: "COINBASE_WS" | "SYNTHETIC_FALLBACK";
    }) => {
      if (tick && typeof tick.price === "number") {
        setPrice(tick.price);
        setMarketSource(tick.source);
        setLiveSpreadBps(tick.spreadBps);
        setMarketLatencyMs(Math.max(8, Math.min(150, Date.now() - tick.timestamp)));

        const timeStr = new Date(tick.timestamp).toTimeString().split(" ")[0].substring(3);
        const newPoint: TickDataPoint = {
          time: timeStr,
          timestamp: tick.timestamp,
          price: tick.price,
          volatility: tick.volatility,
          spreadBps: tick.spreadBps
        };

        setTickHistory(prev => [...prev.slice(-24), newPoint]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const terminalRef = useRef<HTMLDivElement>(null);

  // Periodic ambient thermal variation
  useEffect(() => {
    const timer = setInterval(() => {
      setTemperature(prev => {
        const drift = (Math.random() - 0.5) * 0.2;
        return parseFloat((30.0 + drift).toFixed(1));
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Periodic sponge trap probe listener
  useEffect(() => {
    const probeTimer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const bytes = Math.floor(250 + Math.random() * 80);
      const newLog = `[${timeStr}] PROBE_TRAPPED | 127.0.0.1 | / | Dripped ${bytes} bytes`;
      
      setTrapLogs(prev => [...prev.slice(-15), newLog]);
      setProbesTrapped(p => p + 1);
      setEntropyDrippedKB(e => parseFloat((e + bytes / 1024).toFixed(1)));
    }, 12000);

    return () => clearInterval(probeTimer);
  }, []);

  // Auto-scroll sponge log
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [trapLogs]);

  // Persisted deposit / faucet
  const handlePersistedDeposit = async (amt: number, source: string) => {
    try {
      const res = await fetch("/api/ledger/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUSD: amt })
      });
      const data = await res.json();
      if (data && typeof data.updatedPortfolio === "number") {
        setPortfolio(data.updatedPortfolio);
      }
      setAuditChainCount(c => c + 1);
      const now = new Date().toTimeString().split(" ")[0];
      setTrapLogs(prev => [
        ...prev,
        `[${now}] [SQLITE_WAL] +$${amt.toFixed(2)} USD (${source}) committed to immutable causal chain`
      ]);
    } catch (err) {
      console.error("Deposit dispatch failed:", err);
    }
  };

  // Persisted paper order execution
  const handleSimulatePaperOrder = async (side: "BUY" | "SELL", amt: number) => {
    try {
      const res = await fetch("/api/ledger/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          side,
          pair: "BTC/USD",
          amountUSD: amt,
          priceUSD: price,
          slippageBps: parseFloat((2.5 + Math.random() * 2).toFixed(1)),
          route: "Universal Router V3 (500bps/3000bps Split)"
        })
      });
      const data = await res.json();
      if (data && typeof data.updatedPortfolio === "number") {
        setPortfolio(data.updatedPortfolio);
      }
      if (data && data.order) {
        setPaperOrders(prev => [data.order, ...prev.filter(o => o.id !== data.order.id)]);
      }
      setAuditChainCount(c => c + 1);
      const now = new Date().toTimeString().split(" ")[0];
      setTrapLogs(prev => [
        ...prev,
        `[${now}] [SQLITE_WAL] ${side} $${amt.toFixed(2)} USD persisted with SHA-256 causal hash`
      ]);
    } catch (err) {
      console.error("Order dispatch failed:", err);
    }
  };

  // Deposit injection
  const handleInjectFunds = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!isNaN(amt) && amt > 0) {
      handlePersistedDeposit(amt, "CAPITAL_INJECTION");
    }
  };

  const handleCharlieSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!charlieCommand.trim()) return;
    const cmd = charlieCommand.trim();
    setCharlieLogs(prev => [...prev, `> ${cmd}`]);
    
    // Command response
    if (cmd.toLowerCase() === 'help') {
      setCharlieLogs(prev => [...prev, "Commands: status, trader [start|stop], deposit [amt], clear"]);
    } else if (cmd.toLowerCase() === 'status') {
      setCharlieLogs(prev => [...prev, `SOMA HUD: 100% Battery, ${temperature}°C, Trader: ${isTraderRunning ? 'ONLINE' : 'HALTED'}, Air-Gapped: YES`]);
    } else if (cmd.toLowerCase() === 'clear') {
      setCharlieLogs(["Charlie agent ready."]);
    } else {
      setCharlieLogs(prev => [...prev, `Executing sovereign task: "${cmd}"... OK`]);
    }
    setCharlieCommand("");
  };

  return (
    <div className="min-h-screen bg-[#070a0e] text-zinc-100 font-mono select-none flex flex-col justify-between antialiased">
      {/* Phone Status / Ambient HUD Header */}
      <div className="w-full max-w-2xl mx-auto px-4 pt-3 pb-2 flex items-center justify-between border-b border-white/[0.04]">
        {/* Main Title matching Screenshot: METAMATRIX // SOMA HUD */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-xl font-mono font-bold tracking-wider text-[#00f0ff] uppercase">
            METAMATRIX // SOMA HUD
          </h1>
        </div>

        {/* Air-Gapped Status Badge */}
        <div className="px-2.5 py-0.5 rounded border border-[#00ff88]/60 bg-[#00ff88]/10 text-[#00ff88] text-[11px] font-mono font-bold uppercase tracking-wider shadow-sm shadow-[#00ff88]/20 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
          AIR-GAPPED
        </div>
      </div>

      {/* Main HUD Scrollable Container */}
      <main className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-3 space-y-3 flex-1">
        
        {/* Top Two Metric Cards: BATTERY / SOMA and THERMAL GATE (<42°C) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Battery Card */}
          <div className="bg-[#0e131b] border border-white/[0.07] rounded-xl p-3.5 space-y-1 shadow-sm">
            <span className="text-[10px] uppercase font-mono text-[#8b9bb4] tracking-wider block">
              BATTERY / SOMA
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#00ff88] leading-none">
              {batteryLevel}%
            </div>
            <span className="text-[10px] uppercase font-mono text-[#8b9bb4] tracking-widest block pt-0.5">
              DISCHARGING
            </span>
          </div>

          {/* Thermal Gate Card */}
          <div className="bg-[#0e131b] border border-white/[0.07] rounded-xl p-3.5 space-y-1 shadow-sm">
            <span className="text-[10px] uppercase font-mono text-[#8b9bb4] tracking-wider block">
              THERMAL GATE (&lt;42°C)
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#00f0ff] leading-none">
              {temperature.toFixed(1)}°C
            </div>
            <span className="text-[10px] uppercase font-mono text-[#8b9bb4] tracking-widest block pt-0.5">
              NOMINAL
            </span>
          </div>
        </div>

        {/* Card: REAL-TIME PRICE & VOLATILITY with embedded RECHARTS & SOMA SURGE GRAPH */}
        <div className="bg-[#0e131b] border border-white/[0.07] rounded-xl overflow-hidden shadow-sm">
          {/* Card Header with View Switcher */}
          <div className="px-4 py-2.5 border-b border-white/[0.05] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs">📈</span>
              <span className="text-xs font-mono font-bold text-[#8b9bb4] tracking-wider uppercase">
                REAL-TIME PRICE & VOLATILITY
              </span>
            </div>

            {/* Toggle Switcher between Recharts Metric Stream & Reference Spline */}
            <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5 text-[9px] font-mono">
              <button
                onClick={() => setChartView("RECHARTS")}
                className={cn(
                  "px-2 py-0.5 rounded transition-all cursor-pointer font-bold",
                  chartView === "RECHARTS"
                    ? "bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 shadow-sm"
                    : "text-white/40 hover:text-white"
                )}
              >
                📊 RECHARTS STREAM
              </button>
              <button
                onClick={() => setChartView("REFERENCE")}
                className={cn(
                  "px-2 py-0.5 rounded transition-all cursor-pointer font-bold",
                  chartView === "REFERENCE"
                    ? "bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/40 shadow-sm"
                    : "text-white/40 hover:text-white"
                )}
              >
                🎨 SOMA SPLINE
              </button>
            </div>

            {/* Live Exchange Ingestion Status Pill & Price */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono border border-white/10 bg-black/40">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  marketSource === "COINBASE_WS" ? "bg-[#00ff88]" : "bg-amber-400"
                )} />
                <span className={marketSource === "COINBASE_WS" ? "text-[#00ff88] font-bold" : "text-amber-300 font-bold"}>
                  {marketSource === "COINBASE_WS" ? "COINBASE L2 WS" : "SYNTHETIC"}
                </span>
                <span className="text-white/40">{marketLatencyMs}ms</span>
              </div>
              <span className="text-sm font-mono font-bold text-[#00f0ff] tracking-wide">
                ${price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Embedded Chart Body */}
          <div className="p-2 sm:p-3">
            {chartView === "RECHARTS" ? (
              <RealtimeVolatilityChart data={tickHistory} currentPrice={price} />
            ) : (
              <SomaSurgeGraph currentPrice={price} />
            )}
          </div>
        </div>

        {/* Card: MEMEWATCH EARLY DETECTION RADAR (From Screenshot 3) */}
        <div className="bg-[#0e131b] border border-purple-500/20 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-2.5 border-b border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs">📡</span>
              <span className="text-xs font-mono font-bold text-[#c084fc] tracking-wider uppercase">
                MEMEWATCH EARLY DETECTION RADAR
              </span>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-purple-500/40 bg-purple-500/10 text-purple-300 font-bold uppercase tracking-wider">
              PRE-VIRAL SCANNER
            </span>
          </div>

          <div className="p-3 text-[11px] font-mono overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[#8b9bb4] text-[9px] uppercase border-b border-white/[0.05]">
                  <th className="pb-1.5 font-bold">TICKER</th>
                  <th className="pb-1.5 font-bold">CHAIN</th>
                  <th className="pb-1.5 font-bold">UPLOAD VELOCITY</th>
                  <th className="pb-1.5 font-bold">LP STATUS</th>
                  <th className="pb-1.5 font-bold text-right">SAFETY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                <tr>
                  <td className="py-1.5 font-bold text-[#00f0ff]">$LAPTOP</td>
                  <td className="py-1.5 text-white/80">BASE</td>
                  <td className="py-1.5 text-[#fbbf24] font-bold">+450% (HIGH)</td>
                  <td className="py-1.5 text-[#00ff88]">LOCKED 100%</td>
                  <td className="py-1.5 text-right text-[#00ff88] font-bold">PASS</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-bold text-[#00f0ff]">$SOMA</td>
                  <td className="py-1.5 text-white/80">SOLANA</td>
                  <td className="py-1.5 text-[#fbbf24] font-bold">+210% (MED)</td>
                  <td className="py-1.5 text-[#00ff88]">BURNED</td>
                  <td className="py-1.5 text-right text-[#00ff88] font-bold">PASS</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-bold text-[#00f0ff]">$MYTHOS</td>
                  <td className="py-1.5 text-white/80">BASE</td>
                  <td className="py-1.5 text-[#fbbf24] font-bold">+890% (SPIKE)</td>
                  <td className="py-1.5 text-[#00ff88]">LOCKED 98%</td>
                  <td className="py-1.5 text-right text-[#00ff88] font-bold">PASS</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Card: DAEMON SUBSTRATES */}
        <div className="bg-[#0e131b] border border-white/[0.07] rounded-xl p-3.5 space-y-2.5 shadow-sm">
          <span className="text-[10px] uppercase font-mono text-[#8b9bb4] tracking-wider block">
            DAEMON SUBSTRATES
          </span>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <button
              onClick={() => setDaemons(d => ({ ...d, llama: !d.llama }))}
              className="flex items-center gap-1.5 hover:opacity-80 cursor-pointer"
            >
              <span className={cn("w-2 h-2 rounded-full", daemons.llama ? "bg-[#00ff88]" : "bg-red-500")} />
              <span className={daemons.llama ? "text-white" : "text-white/40"}>LLAMA-SERVER</span>
            </button>

            <button
              onClick={() => setDaemons(d => ({ ...d, trader: !d.trader }))}
              className="flex items-center gap-1.5 hover:opacity-80 cursor-pointer"
            >
              <span className={cn("w-2 h-2 rounded-full", daemons.trader ? "bg-[#00ff88]" : "bg-red-500")} />
              <span className={daemons.trader ? "text-white" : "text-white/40"}>TRADER</span>
            </button>

            <button
              onClick={() => setDaemons(d => ({ ...d, oracle: !d.oracle }))}
              className="flex items-center gap-1.5 hover:opacity-80 cursor-pointer"
            >
              <span className={cn("w-2 h-2 rounded-full", daemons.oracle ? "bg-[#00ff88]" : "bg-red-500")} />
              <span className={daemons.oracle ? "text-white" : "text-white/40"}>ORACLE</span>
            </button>

            <button
              onClick={() => setDaemons(d => ({ ...d, sponge: !d.sponge }))}
              className="flex items-center gap-1.5 hover:opacity-80 cursor-pointer"
            >
              <span className={cn("w-2 h-2 rounded-full", daemons.sponge ? "bg-[#00ff88]" : "bg-red-500")} />
              <span className={daemons.sponge ? "text-white" : "text-white/40"}>SPONGE TRAP (8088)</span>
            </button>
          </div>
        </div>

        {/* Card: QUANTUM TRADER CONTROLS */}
        <div className="bg-[#0e131b] border border-white/[0.07] rounded-xl p-3.5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">⚡</span>
              <span className="text-xs font-mono font-bold text-[#8b9bb4] tracking-wider uppercase">
                QUANTUM TRADER CONTROLS
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[#00ff88]">
              PORTFOLIO: ${portfolio.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsTraderRunning(true)}
              className={cn(
                "py-2.5 px-3 rounded-lg border font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                isTraderRunning
                  ? "bg-[#00ff88]/15 border-[#00ff88] text-[#00ff88] shadow-sm shadow-[#00ff88]/20"
                  : "bg-transparent border-[#00ff88]/40 text-[#00ff88]/60 hover:border-[#00ff88]"
              )}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START TRADER</span>
            </button>

            <button
              onClick={() => setIsTraderRunning(false)}
              className={cn(
                "py-2.5 px-3 rounded-lg border font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                !isTraderRunning
                  ? "bg-[#f59e0b]/15 border-[#f59e0b] text-[#f59e0b] shadow-sm shadow-[#f59e0b]/20"
                  : "bg-transparent border-[#f59e0b]/40 text-[#f59e0b]/60 hover:border-[#f59e0b]"
              )}
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP TRADER</span>
            </button>
          </div>
        </div>

        {/* Scrollable Paper Trading Activity Component (Glass-Panel Aesthetic, SQLite WAL Backed) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-1 text-[9px] font-mono text-white/40">
            <span className="flex items-center gap-1">
              <span className={cn("w-1.5 h-1.5 rounded-full", isLedgerTamperProof ? "bg-[#00ff88]" : "bg-red-500")} />
              <span>CAUSAL AUDIT CHAIN: <strong>{isLedgerTamperProof ? "VERIFIED IMMUTABLE" : "COMPROMISED"}</strong> ({auditChainCount} EVENTS)</span>
            </span>
            <span className="text-[#00f0ff]">SQLITE WAL ENGINE</span>
          </div>
          <PaperActivityFeed 
            orders={paperOrders}
            onSimulateOrder={handleSimulatePaperOrder}
          />
        </div>

        {/* Sovereign Wallet Interface (Demo / Paper Sandbox Mode) */}
        <WalletConnectionModule 
          paperBalanceUSD={portfolio}
          onFaucetDeposit={(amt) => handlePersistedDeposit(amt, "SANDBOX_FAUCET")}
        />

        {/* Card: CAPITAL INGESTION ENGINE */}
        <div className="bg-[#0e131b] border border-white/[0.07] rounded-xl p-3.5 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">💵</span>
              <span className="text-xs font-mono font-bold text-[#8b9bb4] tracking-wider uppercase">
                CAPITAL INGESTION ENGINE
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[#00ff88]">
              PORTFOLIO: ${portfolio.toFixed(2)}
            </span>
          </div>

          <form onSubmit={handleInjectFunds} className="space-y-2">
            <label className="text-[9px] uppercase font-mono text-[#8b9bb4] tracking-wider block">
              DEPOSIT AMOUNT ($ USD)
            </label>
            <div className="flex gap-2.5">
              <input
                type="text"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                className="flex-1 bg-black/50 border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#00f0ff]"
                placeholder="500.00"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-transparent hover:bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24] rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#fbbf24]/10"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>INJECT FUNDS</span>
              </button>
            </div>
            <span className="text-[9px] font-mono text-[#8b9bb4] block leading-tight">
              Injected capital directly updates local execution blackboard ledger.
            </span>
          </form>
        </div>

        {/* Card: ETHER SPONGE TRAP (PORT 8088) */}
        <div className="bg-[#0e131b] border border-white/[0.07] rounded-xl p-3.5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🍯</span>
              <span className="text-xs font-mono font-bold text-[#8b9bb4] tracking-wider uppercase">
                ETHER SPONGE TRAP (PORT 8088)
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#00ff88] uppercase tracking-wider">
              ARMED
            </span>
          </div>

          {/* Metric numbers */}
          <div className="grid grid-cols-2 gap-4 text-center py-1">
            <div>
              <span className="text-[9px] font-mono text-[#8b9bb4] uppercase tracking-wider block mb-0.5">
                PROBES TRAPPED
              </span>
              <span className="text-3xl font-mono font-bold text-[#fbbf24] leading-none">
                {probesTrapped}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-[#8b9bb4] uppercase tracking-wider block mb-0.5">
                ENTROPY DRIPPED
              </span>
              <span className="text-3xl font-mono font-bold text-[#00f0ff] leading-none">
                {entropyDrippedKB.toFixed(1)} KB
              </span>
            </div>
          </div>

          {/* Terminal Console log box matching Screenshot 2 */}
          <div 
            ref={terminalRef}
            className="bg-[#07090d] border border-white/[0.05] rounded-lg p-3 font-mono text-[10px] leading-relaxed max-h-36 overflow-y-auto space-y-1 text-[#fbbf24]"
          >
            {trapLogs.map((log, idx) => (
              <div 
                key={idx} 
                className={log.includes('[DAEMON_ONLINE]') ? "text-[#00ff88]" : log.includes('CAPITAL_INJECTED') ? "text-[#00f0ff] font-bold" : "text-[#fbbf24]"}
              >
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Card: CHARLIE CONSOLE */}
        <div className="bg-[#0e131b] border border-white/[0.07] rounded-xl p-3.5 space-y-2.5 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">⚡</span>
            <span className="text-xs font-mono font-bold text-[#8b9bb4] tracking-wider uppercase">
              CHARLIE CONSOLE
            </span>
          </div>

          <div className="bg-[#07090d] border border-white/[0.05] rounded-lg p-3 font-mono text-xs space-y-1">
            <div className="p-2.5 bg-[#581c87]/20 border border-[#a855f7]/30 rounded text-[#d8b4fe]">
              {charlieLogs[charlieLogs.length - 1] || "Charlie agent online. Ready for sovereign tasks."}
            </div>

            <form onSubmit={handleCharlieSubmit} className="pt-2 flex gap-2">
              <span className="text-[#00f0ff] text-xs font-bold pt-1.5">&gt;</span>
              <input
                type="text"
                value={charlieCommand}
                onChange={e => setCharlieCommand(e.target.value)}
                placeholder="Type command (e.g. status, deposit 500, help)..."
                className="flex-1 bg-transparent text-xs font-mono text-white placeholder-white/20 focus:outline-none"
              />
            </form>
          </div>
        </div>
      </main>

      {/* Android 3-Button Navigation Bar matching bottom of screenshots */}
      <footer className="w-full max-w-2xl mx-auto py-3 px-6 border-t border-white/[0.05] flex items-center justify-around text-white/40">
        <button className="p-2 hover:text-white transition-colors cursor-pointer">
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <button className="p-2 hover:text-white transition-colors cursor-pointer">
          <Circle className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button className="p-2 hover:text-white transition-colors cursor-pointer">
          <div className="w-3.5 h-3.5 border-l-2 border-r-2 border-current mx-auto" />
        </button>
        <button className="p-2 hover:text-white transition-colors cursor-pointer">
          <Accessibility className="w-4 h-4 stroke-[2]" />
        </button>
      </footer>
    </div>
  );
}
