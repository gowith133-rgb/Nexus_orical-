import { useState } from "react";
import { formatCurrency, cn } from "../lib/utils";
import { 
  Wallet, 
  ShieldCheck, 
  ExternalLink, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertCircle,
  PlusCircle,
  LogOut
} from "lucide-react";

interface WalletConnectionModuleProps {
  paperBalanceUSD: number;
  onFaucetDeposit?: (amountUSD: number) => void;
  className?: string;
}

export function WalletConnectionModule({
  paperBalanceUSD,
  onFaucetDeposit,
  className
}: WalletConnectionModuleProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Simulated Testnet Paper Wallet Details
  const demoAddress = "0x71C4b7...d3E9_DEMO";
  const btcPrice = 67420.00;
  const ethPrice = 3480.00;

  // Derive simulated asset balances based on paper balance
  const simulatedBTC = parseFloat(((paperBalanceUSD * 0.45) / btcPrice).toFixed(5));
  const simulatedETH = parseFloat(((paperBalanceUSD * 0.35) / ethPrice).toFixed(4));
  const simulatedUSDC = parseFloat((paperBalanceUSD * 0.20).toFixed(2));

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 800);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText("0x71C4b72A99B905441864e3288647D024B1d3E9_DEMO");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFaucetTopUp = () => {
    if (onFaucetDeposit) {
      onFaucetDeposit(250.00);
    }
  };

  return (
    <div className={cn("glass-panel rounded-xl p-4 select-none space-y-3", className)}>
      {/* Module Header with Prominent DEMO Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold text-[#8b9bb4] tracking-wider uppercase">
                SOVEREIGN WALLET INTERFACE
              </h3>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/40">
                DEMO
              </span>
            </div>
            <span className="text-[9px] font-mono text-white/40 block">
              NOT CONNECTED TO MAINNET · PAPER SIMULATION ONLY
            </span>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-[#00ff88] animate-pulse" : "bg-white/30"
          )} />
          <span className="text-[10px] font-mono font-bold text-white/60">
            {isConnected ? "SANDBOX CONNECTED" : "DISCONNECTED"}
          </span>
        </div>
      </div>

      {/* Main Body */}
      {!isConnected ? (
        <div className="py-4 px-3 rounded-lg bg-[#070a0e]/60 border border-white/[0.04] text-center space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-mono text-white/70">
              Connect a simulated paper wallet to manage sandbox allocations.
            </p>
            <p className="text-[10px] font-mono text-white/40">
              Zero real cryptocurrency keys or funds are accessible in this environment.
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#00f0ff]/15 hover:bg-[#00f0ff]/25 text-[#00f0ff] border border-[#00f0ff]/40 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-sm shadow-[#00f0ff]/10"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>HANDSHAKE SIMULATOR...</span>
              </>
            ) : (
              <>
                <Wallet className="w-3.5 h-3.5" />
                <span>CONNECT WALLET (DEMO SIMULATOR)</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Connected Address & Network Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-[#070a0e]/80 border border-white/[0.05] text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#8b9bb4] text-[10px]">ADDRESS:</span>
              <span className="text-white font-bold">{demoAddress}</span>
              <button 
                onClick={handleCopy}
                className="text-white/40 hover:text-white transition-colors cursor-pointer"
                title="Copy Address"
              >
                {copied ? <Check className="w-3 h-3 text-[#00ff88]" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded border border-[#00f0ff]/20">
                Sepolia / Sandbox
              </span>
              <button
                onClick={handleDisconnect}
                className="text-red-400/70 hover:text-red-300 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                title="Disconnect"
              >
                <LogOut className="w-3 h-3" />
                <span>DISCONNECT</span>
              </button>
            </div>
          </div>

          {/* Paper Portfolio Balances Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
            {/* Total Paper USD */}
            <div className="p-2.5 rounded-lg bg-[#0e131b] border border-white/[0.06] space-y-0.5">
              <span className="text-[9px] text-[#8b9bb4] uppercase block">PAPER PORTFOLIO</span>
              <div className="text-base font-bold text-[#00ff88]">
                {formatCurrency(paperBalanceUSD)}
              </div>
              <span className="text-[9px] text-white/40 block">Sandbox Balance</span>
            </div>

            {/* Simulated BTC Holding */}
            <div className="p-2.5 rounded-lg bg-[#0e131b] border border-white/[0.06] space-y-0.5">
              <span className="text-[9px] text-[#8b9bb4] uppercase block">SIMULATED BTC</span>
              <div className="text-base font-bold text-[#00f0ff]">
                {simulatedBTC} BTC
              </div>
              <span className="text-[9px] text-white/40 block">
                ≈ {formatCurrency(simulatedBTC * btcPrice)}
              </span>
            </div>

            {/* Simulated ETH / Stable Holding */}
            <div className="p-2.5 rounded-lg bg-[#0e131b] border border-white/[0.06] space-y-0.5">
              <span className="text-[9px] text-[#8b9bb4] uppercase block">SIMULATED ETH & USDC</span>
              <div className="text-base font-bold text-purple-300">
                {simulatedETH} ETH
              </div>
              <span className="text-[9px] text-white/40 block">
                + ${simulatedUSDC.toFixed(2)} USDC
              </span>
            </div>
          </div>

          {/* Faucet Top-Up Action */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-white/40">
              Need additional paper capital for execution testing?
            </span>
            <button
              onClick={handleFaucetTopUp}
              className="px-3 py-1.5 rounded-lg bg-[#00ff88]/10 hover:bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30 font-mono text-[10px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#00ff88]/10"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ $250 TESTNET FAUCET</span>
            </button>
          </div>
        </div>
      )}

      {/* Plain-Language Risk Disclosure Banner */}
      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-[10px] font-mono text-amber-200/90 leading-tight">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400 mt-0.5" />
        <span>
          <strong>DISCLOSURE (DEMO):</strong> This module operates strictly as a simulated paper wallet. It does not communicate with Ethereum/Bitcoin mainnet, holds no private keys, and cannot process real financial transactions.
        </span>
      </div>
    </div>
  );
}
