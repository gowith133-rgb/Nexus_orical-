import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { formatCurrency, cn } from "../lib/utils";
import { Activity, TrendingUp, Zap } from "lucide-react";

export interface TickDataPoint {
  time: string;
  timestamp: number;
  price: number;
  volatility: number; // Volatility Expansion Ratio (VER)
  spreadBps: number;
}

interface RealtimeVolatilityChartProps {
  data: TickDataPoint[];
  currentPrice: number;
  className?: string;
}

export function RealtimeVolatilityChart({
  data,
  currentPrice,
  className
}: RealtimeVolatilityChartProps) {
  const [metricMode, setMetricMode] = useState<"PRICE" | "VOLATILITY" | "DUAL">("DUAL");

  // Calculate min/max for price axis auto-scaling
  const prices = data.map(d => d.price);
  const minPrice = prices.length ? Math.floor(Math.min(...prices) * 0.999) : 2400;
  const maxPrice = prices.length ? Math.ceil(Math.max(...prices) * 1.001) : 2500;

  // Latest metrics
  const latestTick = data[data.length - 1] || { volatility: 1.15, spreadBps: 3.4 };

  return (
    <div className={cn("rounded-2xl bg-[#0c1017] border border-white/5 p-4 sm:p-5 select-none space-y-3", className)}>
      {/* Top Controls: Mode Switch & Live Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.05] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
              Nexus Volatility & Price Stream
            </span>
            <span className="text-[9px] font-mono text-[#00ff88] font-bold">
              PAPER SIMULATION · RECHARTS ENGINE
            </span>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5 text-[9px] font-mono">
          {(["PRICE", "VOLATILITY", "DUAL"] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setMetricMode(mode)}
              className={cn(
                "px-2 py-0.5 rounded transition-all cursor-pointer font-bold",
                metricMode === mode
                  ? "bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 shadow-sm"
                  : "text-white/40 hover:text-white"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              {/* Nexus Emerald Gradient for Price */}
              <linearGradient id="nexusEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>

              {/* Nexus Cyan Gradient for Volatility */}
              <linearGradient id="nexusCyanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.6} />

            <XAxis
              dataKey="time"
              stroke="#4b5563"
              fontSize={10}
              fontFamily="ui-monospace, monospace"
              tickLine={false}
              axisLine={{ stroke: "#1f2937" }}
            />

            {/* Left YAxis for Price */}
            {(metricMode === "PRICE" || metricMode === "DUAL") && (
              <YAxis
                yAxisId="priceAxis"
                domain={[minPrice, maxPrice]}
                stroke="#00ff88"
                fontSize={10}
                fontFamily="ui-monospace, monospace"
                tickLine={false}
                axisLine={{ stroke: "#1f2937" }}
                tickFormatter={(val: number) => `$${val.toFixed(0)}`}
                orientation="left"
              />
            )}

            {/* Right YAxis for Volatility Expansion Ratio (VER) */}
            {(metricMode === "VOLATILITY" || metricMode === "DUAL") && (
              <YAxis
                yAxisId="volAxis"
                domain={[0.5, 3.0]}
                stroke="#00f0ff"
                fontSize={10}
                fontFamily="ui-monospace, monospace"
                tickLine={false}
                axisLine={{ stroke: "#1f2937" }}
                tickFormatter={(val: number) => `${val.toFixed(1)}x`}
                orientation="right"
              />
            )}

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const point = payload[0].payload as TickDataPoint;
                return (
                  <div className="bg-[#070a0e]/95 border border-[#00f0ff]/30 p-2.5 rounded-lg shadow-xl backdrop-blur-md font-mono text-[11px] space-y-1">
                    <div className="text-white/40 text-[9px]">{point.time} (Tick #{point.timestamp % 1000})</div>
                    <div className="text-[#00ff88] font-bold">
                      Price: ${point.price.toFixed(2)} USD
                    </div>
                    <div className="text-[#00f0ff]">
                      VER Ratio: {point.volatility.toFixed(2)}x
                    </div>
                    <div className="text-white/50 text-[10px]">
                      Spread: {point.spreadBps.toFixed(1)} bps
                    </div>
                  </div>
                );
              }}
            />

            {/* Price Area Wave (Emerald) */}
            {(metricMode === "PRICE" || metricMode === "DUAL") && (
              <Area
                yAxisId="priceAxis"
                type="monotone"
                dataKey="price"
                name="Price (USD)"
                stroke="#00ff88"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#nexusEmeraldGrad)"
                isAnimationActive={false}
              />
            )}

            {/* Volatility Area Wave (Cyan) */}
            {(metricMode === "VOLATILITY" || metricMode === "DUAL") && (
              <Area
                yAxisId="volAxis"
                type="monotone"
                dataKey="volatility"
                name="Volatility (VER)"
                stroke="#00f0ff"
                strokeWidth={1.8}
                strokeDasharray={metricMode === "DUAL" ? "4 4" : undefined}
                fillOpacity={1}
                fill="url(#nexusCyanGrad)"
                isAnimationActive={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Metrics Row */}
      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-white/[0.05] text-[10px] font-mono text-white/50">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00ff88]" />
            <span>Price: <strong className="text-white">${currentPrice.toFixed(2)}</strong></span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff]" />
            <span>VER: <strong className="text-[#00f0ff]">{latestTick.volatility.toFixed(2)}x</strong></span>
          </span>
          <span>Spread: <strong className="text-[#00ff88]">{latestTick.spreadBps.toFixed(1)} bps</strong></span>
        </div>

        <div className="text-[9px] text-[#8b9bb4]">
          Gate: {latestTick.volatility > 2.5 ? "CIRCUIT BREAKER" : "NOMINAL (<2.5x)"}
        </div>
      </div>
    </div>
  );
}
