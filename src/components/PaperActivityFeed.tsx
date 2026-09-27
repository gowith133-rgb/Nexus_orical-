import { useState, useEffect } from "react";
import { formatCurrency, cn } from "../lib/utils";
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Layers, 
  RefreshCw,
  Plus
} from "lucide-react";

export type PaperOrderStatus = 'FILLED' | 'ROUTED' | 'PENDING' | 'GATE_REJECTED';

export interface PaperOrder {
  id: string;
  timestamp: number;
  pair: string;
  side: 'BUY' | 'SELL';
  amountUSD: number;
  assetAmount: number;
  priceUSD: number;
  status: PaperOrderStatus;
  slippageBps: number;
  route: string;
  rejectionReason?: string;
  txHash: string;
}

interface PaperActivityFeedProps {
  orders?: PaperOrder[];
  onSimulateOrder?: (side: 'BUY' | 'SELL', amountUSD: number) => void;
  className?: string;
}

const DEFAULT_ORDERS: PaperOrder[] = [
  {
    id: "ord_p982a",
    timestamp: Date.now() - 1000 * 24, // 24 seconds ago
    pair: "BTC/USD",
    side: "BUY",
    amountUSD: 500.00,
    assetAmount: 0.007416,
    priceUSD: 67420.00,
    status: "FILLED",
    slippageBps: 3.2,
    route: "Universal Router V3 (500bps/3000bps split)",
    txHash: "0x8f2a...9c41"
  },
  {
    id: "ord_p981b",
    timestamp: Date.now() - 1000 * 142, // ~2.3 mins ago
    pair: "ETH/USDC",
    side: "BUY",
    amountUSD: 250.00,
    assetAmount: 0.07184,
    priceUSD: 3480.00,
    status: "ROUTED",
    slippageBps: 4.8,
    route: "Split Route: 80% 500bps / 20% 3000bps",
    txHash: "0x3d14...b02e"
  },
  {
    id: "ord_p980c",
    timestamp: Date.now() - 1000 * 380, // ~6.3 mins ago
    pair: "BTC/USD",
    side: "SELL",
    amountUSD: 1000.00,
    assetAmount: 0.01485,
    priceUSD: 67340.50,
    status: "GATE_REJECTED",
    slippageBps: 28.5,
    rejectionReason: "Spread Gate engaged: Bid/Ask spread 0.28% > 0.25% limit",
    route: "Execution halted by Spread Risk Gate",
    txHash: "0x0000...GATE"
  },
  {
    id: "ord_p979d",
    timestamp: Date.now() - 1000 * 690, // ~11.5 mins ago
    pair: "SOL/USD",
    side: "BUY",
    amountUSD: 150.00,
    assetAmount: 0.982,
    priceUSD: 152.75,
    status: "FILLED",
    slippageBps: 2.1,
    route: "Direct Uniswap V3 (500 bps pool)",
    txHash: "0xaa42...99ff"
  },
  {
    id: "ord_p978e",
    timestamp: Date.now() - 1000 * 1450, // ~24 mins ago
    pair: "BTC/USD",
    side: "BUY",
    amountUSD: 750.00,
    assetAmount: 0.01116,
    priceUSD: 67200.00,
    status: "FILLED",
    slippageBps: 3.9,
    route: "Universal Router Triple-Command (0x0a + 0x00 + 0x0c)",
    txHash: "0x77c2...5d21"
  }
];

export function PaperActivityFeed({
  orders = DEFAULT_ORDERS,
  onSimulateOrder,
  className
}: PaperActivityFeedProps) {
  const [filter, setFilter] = useState<'ALL' | 'FILLED' | 'ROUTED' | 'REJECTED'>('ALL');
  const [activeList, setActiveList] = useState<PaperOrder[]>(orders);

  // Sync if parent updates
  useEffect(() => {
    if (orders && orders.length) {
      setActiveList(orders);
    }
  }, [orders]);

  const displayOrders = (activeList.length ? activeList : orders).filter(order => {
    if (filter === 'ALL') return true;
    if (filter === 'FILLED') return order.status === 'FILLED';
    if (filter === 'ROUTED') return order.status === 'ROUTED';
    if (filter === 'REJECTED') return order.status === 'GATE_REJECTED';
    return true;
  });

  const handleQuickSimulate = (side: 'BUY' | 'SELL') => {
    const newOrder: PaperOrder = {
      id: `ord_p${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      pair: "BTC/USD",
      side,
      amountUSD: 100.00,
      assetAmount: parseFloat((100.00 / 67450).toFixed(6)),
      priceUSD: 67450.00,
      status: "FILLED",
      slippageBps: parseFloat((2.0 + Math.random() * 2.5).toFixed(1)),
      route: "Universal Router (500bps/3000bps LVR Protected)",
      txHash: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`
    };

    setActiveList(prev => [newOrder, ...prev]);
    if (onSimulateOrder) {
      onSimulateOrder(side, 100.00);
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className={cn("glass-panel rounded-xl p-4 select-none space-y-3", className)}>
      {/* Header with Title and Paper Verification Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00f0ff]" />
          <div>
            <h3 className="text-xs font-mono font-bold text-[#8b9bb4] tracking-wider uppercase">
              RECENT PAPER TRADING ACTIVITY
            </h3>
            <span className="text-[9px] font-mono text-[#00ff88]/80 block">
              100% PAPER SIMULATION · NO REAL CAPITAL
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5 text-[9px] font-mono">
          {(['ALL', 'FILLED', 'ROUTED', 'REJECTED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "px-2 py-0.5 rounded transition-all cursor-pointer",
                filter === tab
                  ? "bg-[#00f0ff]/20 text-[#00f0ff] font-bold border border-[#00f0ff]/40 shadow-sm"
                  : "text-white/40 hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Order List */}
      <div className="max-h-64 sm:max-h-72 overflow-y-auto pr-1 space-y-2 divide-y divide-white/[0.04]">
        {displayOrders.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-white/40">
            No paper orders matching filter "{filter}".
          </div>
        ) : (
          displayOrders.map(order => {
            const isBuy = order.side === 'BUY';
            const isFilled = order.status === 'FILLED';
            const isRouted = order.status === 'ROUTED';
            const isRejected = order.status === 'GATE_REJECTED';

            return (
              <div 
                key={order.id} 
                className="pt-2 first:pt-0 pb-1 flex flex-col gap-1.5 hover:bg-white/[0.02] p-2 rounded-lg transition-colors"
              >
                {/* Top Row: Timestamp, Pair, Side, Status Badge */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40">
                      {formatTime(order.timestamp)}
                    </span>

                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5",
                      isBuy ? "bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/30" : "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                    )}>
                      {isBuy ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownLeft className="w-2.5 h-2.5" />}
                      {order.side}
                    </span>

                    <span className="font-bold text-white tracking-wide">
                      {order.pair}
                    </span>
                  </div>

                  {/* Status Indicator Badge */}
                  <div>
                    {isFilled && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/40 shadow-sm shadow-[#00ff88]/10">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        FILLED
                      </span>
                    )}
                    {isRouted && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/40 shadow-sm shadow-[#00f0ff]/10">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                        ROUTED
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-red-500/15 text-red-300 border border-red-500/40">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        GATE REJECTED
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Row: Size, Price, and Execution Math */}
                <div className="flex items-center justify-between text-[11px] font-mono text-white/80">
                  <div>
                    <span className="text-white font-bold">{formatCurrency(order.amountUSD)}</span>
                    <span className="text-white/40 text-[10px] ml-1.5">
                      ({order.assetAmount} {order.pair.split('/')[0]})
                    </span>
                  </div>
                  <div className="text-right text-[10px] text-white/50">
                    @ ${order.priceUSD.toLocaleString()}
                  </div>
                </div>

                {/* Bottom Row: Microstructure Route & Slippage / Rejection metadata */}
                <div className="flex items-center justify-between text-[9px] font-mono text-white/40 pt-0.5">
                  <span className="truncate max-w-[260px] sm:max-w-xs text-white/60">
                    {isRejected ? order.rejectionReason : order.route}
                  </span>
                  {!isRejected && (
                    <span className="text-[#00ff88]/90 font-bold">
                      λ {order.slippageBps} bps
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer: Quick Simulated Paper Order Trigger */}
      <div className="border-t border-white/[0.06] pt-2.5 flex items-center justify-between text-[10px] font-mono text-white/40">
        <span>Simulate instant paper execution:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuickSimulate('BUY')}
            className="px-2 py-1 rounded bg-[#00ff88]/10 hover:bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30 transition-colors flex items-center gap-1 cursor-pointer font-bold"
          >
            <Plus className="w-3 h-3" />
            <span>+ $100 BUY</span>
          </button>
          <button
            onClick={() => handleQuickSimulate('SELL')}
            className="px-2 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-colors flex items-center gap-1 cursor-pointer font-bold"
          >
            <Plus className="w-3 h-3" />
            <span>+ $100 SELL</span>
          </button>
        </div>
      </div>
    </div>
  );
}
