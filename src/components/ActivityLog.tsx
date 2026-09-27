import { memo } from "react";
import { motion } from "motion/react";
import { ActivityEntry } from "../types";
import { cn } from "../lib/utils";
import { CheckCircle2, AlertCircle, MessageSquare, Activity } from "lucide-react";

interface ActivityLogProps {
  logs: ActivityEntry[];
}

export const ActivityLog = memo(({ logs }: ActivityLogProps) => {
  return (
    <div className="glass-panel rounded-2xl border-white/5 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Deterministic Activity Feed</span>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-nexus-emerald" />
          <div className="w-1.5 h-1.5 rounded-full bg-nexus-emerald/20" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 custom-scrollbar">
        {logs?.map((log, index) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={log.id}
            className="flex gap-3 relative"
          >
            {index !== logs.length - 1 && (
              <div className="absolute left-[11px] top-6 bottom-[-20px] w-px bg-white/5" />
            )}
            <div className={cn(
              "z-10 mt-1 h-6 w-6 rounded-full flex items-center justify-center border",
              log.type === 'STATUS' ? "bg-nexus-bg border-nexus-emerald/30 text-nexus-emerald shadow-[0_0_10px_rgba(16,185,129,0.1)]" :
              log.type === 'LABEL_CHANGE' ? "bg-nexus-bg border-nexus-cyan/30 text-nexus-cyan" :
              log.type === 'TRADE' ? "bg-nexus-bg border-nexus-emerald/50 text-nexus-emerald" :
              "bg-nexus-bg border-white/10 text-white/40"
            )}>
              {log.type === 'STATUS' && <CheckCircle2 className="w-3 h-3" />}
              {log.type === 'LABEL_CHANGE' && <AlertCircle className="w-3 h-3" />}
              {log.type === 'MENTION' && <MessageSquare className="w-3 h-3" />}
              {log.type === 'TRADE' && <Activity className="w-3 h-3" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-bold text-white/80">
                  {log.user || 'enclave_root'}
                  <span className="text-white/30 font-medium ml-2 uppercase tracking-tighter">[{log.type}]</span>
                </span>
                <span className="text-[9px] font-mono text-white/20">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed font-sans">{log.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});
