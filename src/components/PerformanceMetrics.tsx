import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from "recharts";
import { ArticleMetrics } from "../types";

interface PerformanceMetricsProps {
  metrics: ArticleMetrics;
}

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  if (!metrics?.views) return null;
  const chartData = metrics.views.map((v, i) => ({
    index: i,
    views: v,
    citations: metrics.citations[i],
    downloads: metrics.downloads[i]
  }));

  const systems = [
    { name: 'Citations', key: 'citations', color: '#10b981' },
    { name: 'Views', key: 'views', color: '#06b6d4' },
    { name: 'Strategy Downloads', key: 'downloads', color: '#3b82f6' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {systems.map((sys) => (
        <div key={sys.name} className="glass-panel p-4 rounded-xl border-white/5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{sys.name}</span>
            <span className="text-xl font-serif italic text-white emerald-glow">{chartData[chartData.length - 1][sys.key as keyof typeof chartData[0]]}</span>
          </div>
          <div className="h-20 w-full opacity-60 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                   <linearGradient id={`grad-${sys.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={sys.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={sys.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey={sys.key} 
                  stroke={sys.color} 
                  strokeWidth={1.5}
                  fill={`url(#grad-${sys.key})`}
                  isAnimationActive={false}
                />
                <XAxis dataKey="index" hide />
                <YAxis hide domain={['auto', 'auto']} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute inset-0 mechanical-grid opacity-10 pointer-events-none" />
        </div>
      ))}
    </div>
  );
}
