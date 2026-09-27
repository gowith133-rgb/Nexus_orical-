import { useState, useRef, type MouseEvent } from "react";
import { motion } from "motion/react";
import { formatCurrency, cn } from "../lib/utils";

interface SomaSurgeGraphProps {
  currentPrice?: number;
  className?: string;
}

export function SomaSurgeGraph({ currentPrice = 2459.09, className }: SomaSurgeGraphProps) {
  const [activeRange, setActiveRange] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>('1M');
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number; val: number; label: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Background pillars with glowing caps matching the uploaded reference image
  const pillars = [
    { x: 120, height: 160, capColor: '#374151' }, // Jan start
    { x: 175, height: 115, capColor: '#4b5563' },
    { x: 230, height: 140, capColor: '#10b981' }, // Feb
    { x: 285, height: 75,  capColor: '#374151' },
    { x: 340, height: 210, capColor: '#10b981' }, // Mar
    { x: 395, height: 185, capColor: '#4b5563' },
    { x: 450, height: 210, capColor: '#10b981' }, // Apr
    { x: 505, height: 175, capColor: '#10b981' },
    { x: 560, height: 110, capColor: '#374151' }  // May
  ];

  // Bezier curve points: surging upward curve matching m_step3.0r2jwz-8y-lbj.png
  // SVG coordinates: viewBox 0 0 640 280
  // Start: (80, 240) -> (150, 205) -> (270, 195) [Node 1] -> (360, 130) -> (450, 85) [Node 2] -> (560, 65) -> (600, 75)
  const pathData = "M 80 240 C 130 200, 170 215, 220 205 C 250 200, 260 195, 275 190 C 310 175, 340 145, 370 120 C 400 95, 430 85, 460 80 C 490 75, 520 85, 560 65 C 580 55, 600 60, 615 70";
  const areaData = `${pathData} L 615 260 L 80 260 Z`;

  // Milestone glowing circular nodes coordinates
  const milestoneNodes = [
    { x: 275, y: 190, label: "Feb 14", value: 3420 },
    { x: 460, y: 80, label: "Apr 28", value: 14850 }
  ];

  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const svgX = xPct * 640;
    
    // Estimate y along the upward curve
    const normalizedY = 240 - (Math.pow(xPct, 1.2) * 175);
    const estimatedValue = 1800 + Math.pow(xPct, 1.3) * (currentPrice * 6.5);
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May"];
    const monthIdx = Math.min(4, Math.floor(xPct * 5));

    setHoverPoint({
      x: svgX,
      y: normalizedY,
      val: Math.round(estimatedValue),
      label: `${months[monthIdx]} 2026`
    });
  };

  return (
    <div ref={containerRef} className={cn("relative w-full rounded-2xl bg-[#0c1017] border border-white/5 p-4 sm:p-5 select-none overflow-hidden", className)}>
      {/* Top Bar inside the Card: Range Controls & Live Status */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
            Algorithmic Inflow Spectrum
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#10b981]/15 text-[#00ffaa] border border-[#10b981]/30">
            SURGING
          </span>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5 text-[10px] font-mono">
          {(['1D', '1W', '1M', '1Y', 'ALL'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setActiveRange(r)}
              className={cn(
                "px-2 py-0.5 rounded transition-all cursor-pointer",
                activeRange === r 
                  ? "bg-[#10b981]/20 text-[#00ffaa] font-bold border border-[#10b981]/40" 
                  : "text-white/40 hover:text-white"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas matching the reference screenshot */}
      <div className="relative w-full aspect-[2.3/1] min-h-[200px] max-h-[290px]">
        <svg
          viewBox="0 0 640 280"
          className="w-full h-full overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverPoint(null)}
        >
          <defs>
            {/* Surging line glow filter */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Area gradient under the bezier curve */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ffaa" stopOpacity="0.22" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#050a0f" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing curve stroke gradient */}
            <linearGradient id="curveGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="50%" stopColor="#00ffaa" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            {/* Metallic 3D Badge Gradients */}
            <radialGradient id="badgeBtc" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#2a3b4c" />
              <stop offset="60%" stopColor="#131c26" />
              <stop offset="100%" stopColor="#080e14" />
            </radialGradient>

            <radialGradient id="badgeTesla" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#2a3b4c" />
              <stop offset="60%" stopColor="#131c26" />
              <stop offset="100%" stopColor="#080e14" />
            </radialGradient>
          </defs>

          {/* L-Shaped Axis Lines */}
          <line x1="75" y1="30" x2="75" y2="250" stroke="#1f2937" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="75" y1="250" x2="620" y2="250" stroke="#1f2937" strokeWidth="1.2" strokeLinecap="round" />

          {/* Y-Axis Labels: 16K, 8K, 2K */}
          <text x="62" y="65" textAnchor="end" fill="#4b5563" fontSize="11" fontFamily="ui-monospace, monospace">16K</text>
          <text x="62" y="150" textAnchor="end" fill="#4b5563" fontSize="11" fontFamily="ui-monospace, monospace">8K</text>
          <text x="62" y="235" textAnchor="end" fill="#4b5563" fontSize="11" fontFamily="ui-monospace, monospace">2K</text>

          {/* Background Pillars with glowing pill caps */}
          {pillars.map((p, i) => {
            const pillY = 250 - p.height;
            return (
              <g key={i} className="transition-opacity hover:opacity-80">
                {/* Pillar body (subtle rounded bar) */}
                <rect
                  x={p.x - 14}
                  y={pillY}
                  width="28"
                  height={p.height}
                  rx="6"
                  fill="rgba(255, 255, 255, 0.015)"
                  stroke="rgba(255, 255, 255, 0.03)"
                  strokeWidth="1"
                />
                {/* Glowing rounded cap at the top of each pillar */}
                <rect
                  x={p.x - 14}
                  y={pillY}
                  width="28"
                  height="6"
                  rx="3"
                  fill={p.capColor}
                  className="transition-all"
                  style={{
                    filter: p.capColor === '#10b981' ? 'drop-shadow(0 0 6px rgba(16,185,129,0.7))' : 'none'
                  }}
                />
              </g>
            );
          })}

          {/* Gradient Area Fill under the curve */}
          <path d={areaData} fill="url(#areaGradient)" />

          {/* Surging Glowing Bezier Curve */}
          <path
            d={pathData}
            fill="none"
            stroke="url(#curveGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#neonGlow)"
          />

          {/* Floating Milestone Nodes (White/Cyan Glowing Dots) */}
          {milestoneNodes.map((node, idx) => (
            <g key={idx} className="cursor-pointer">
              {/* Outer pulsing ripple ring */}
              <circle
                cx={node.x}
                cy={node.y}
                r="10"
                fill="none"
                stroke="#00ffaa"
                strokeWidth="1.5"
                opacity="0.5"
                className="animate-ping"
                style={{ transformOrigin: `${node.x}px ${node.y}px` }}
              />
              {/* Outer border ring */}
              <circle
                cx={node.x}
                cy={node.y}
                r="7.5"
                fill="#0c1017"
                stroke="#00ffaa"
                strokeWidth="2.5"
                filter="url(#neonGlow)"
              />
              {/* Inner glowing center */}
              <circle
                cx={node.x}
                cy={node.y}
                r="4.5"
                fill="#ffffff"
              />
            </g>
          ))}

          {/* Floating Bitcoin ₿ Coin Badge (Above Jan/Feb peak) */}
          <g transform="translate(195, 38)" className="cursor-pointer transition-transform hover:scale-110">
            {/* Outer shadow / ring */}
            <circle cx="24" cy="24" r="23" fill="url(#badgeBtc)" stroke="rgba(0, 240, 255, 0.3)" strokeWidth="1.5" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.8))" />
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
            {/* Bitcoin ₿ icon */}
            <text
              x="24"
              y="32"
              textAnchor="middle"
              fill="#00ffaa"
              fontSize="20"
              fontFamily="sans-serif"
              fontWeight="bold"
              style={{ filter: "drop-shadow(0 0 4px rgba(0,255,170,0.8))" }}
            >
              ₿
            </text>
          </g>

          {/* Floating Tesla / Soma Badge (Above Apr peak) */}
          <g transform="translate(480, 25)" className="cursor-pointer transition-transform hover:scale-110">
            {/* Outer shadow / ring */}
            <circle cx="24" cy="24" r="23" fill="url(#badgeTesla)" stroke="rgba(16, 185, 129, 0.35)" strokeWidth="1.5" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.8))" />
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
            {/* Tesla 'T' / Soma stylized logo */}
            <path
              d="M 14 18 C 19 16, 29 16, 34 18 L 33 21 C 29 20, 19 20, 15 21 Z M 22 23 L 26 23 L 25 33 C 24.5 34, 23.5 34, 23 33 Z"
              fill="#00f0ff"
              style={{ filter: "drop-shadow(0 0 5px rgba(0,240,255,0.8))" }}
            />
          </g>

          {/* Interactive Hover Point & Crosshair */}
          {hoverPoint && (
            <g>
              <line
                x1={hoverPoint.x}
                y1="30"
                x2={hoverPoint.x}
                y2="250"
                stroke="#00ffaa"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <circle
                cx={hoverPoint.x}
                cy={hoverPoint.y}
                r="6"
                fill="#ffffff"
                stroke="#00ffaa"
                strokeWidth="2.5"
                filter="url(#neonGlow)"
              />
            </g>
          )}

          {/* X-Axis Labels: Jan, Feb, Mar, Apr, May */}
          <text x="175" y="270" textAnchor="middle" fill="#4b5563" fontSize="11" fontFamily="ui-monospace, monospace">Jan</text>
          <text x="260" y="270" textAnchor="middle" fill="#4b5563" fontSize="11" fontFamily="ui-monospace, monospace">Feb</text>
          <text x="360" y="270" textAnchor="middle" fill="#4b5563" fontSize="11" fontFamily="ui-monospace, monospace">Mar</text>
          <text x="460" y="270" textAnchor="middle" fill="#4b5563" fontSize="11" fontFamily="ui-monospace, monospace">Apr</text>
          <text x="560" y="270" textAnchor="middle" fill="#4b5563" fontSize="11" fontFamily="ui-monospace, monospace">May</text>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoverPoint && (
          <div
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 z-30 bg-[#0d131d]/95 border border-[#00ffaa]/40 px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-md text-center"
            style={{
              left: `${(hoverPoint.x / 640) * 100}%`,
              top: `${(hoverPoint.y / 280) * 100}%`
            }}
          >
            <span className="text-[10px] font-mono text-white/50 block">{hoverPoint.label}</span>
            <span className="text-xs font-mono font-bold text-[#00ffaa]">
              ${hoverPoint.val.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Step Indicator matching the image badge ("Step 3") */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        <div className="inline-flex items-center px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-white font-sans text-xs font-medium shadow-sm">
          <span>Step 3</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-white/40">
          <span>Vol: <strong className="text-white">12.4M</strong></span>
          <span>Spread: <strong className="text-[#00ffaa]">8.4 bps</strong></span>
          <span>Net Alpha: <strong className="text-[#00ffaa]">+342%</strong></span>
        </div>
      </div>
    </div>
  );
}
