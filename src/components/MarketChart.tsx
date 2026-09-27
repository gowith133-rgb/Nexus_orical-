import { ResponsiveContainer, Area, AreaChart } from 'recharts';
import { formatCurrency } from "@/src/lib/utils";
import { Activity } from "lucide-react";

interface MarketChartProps {
  data: { price: number; timestamp: number }[];
}

export function MarketChart({ data }: MarketChartProps) {
  return (
    <div className="h-[250px] md:h-[300px] w-full glass-panel border border-nexus-emerald/10 p-4 md:p-6 relative overflow-hidden rounded-xl">
      <div className="absolute top-4 left-4 z-10 font-mono text-[9px] text-nexus-emerald flex items-center gap-2 opacity-60">
        <Activity className="w-3 h-3 text-cyan-400 gear-icon" />
        NODE_TELEMETRY::BTC_WAVEFORM
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#10b981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none mechanical-grid opacity-10" />
    </div>
  );
}
