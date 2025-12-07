import React from 'react';
import { motion } from 'framer-motion';

const DataModule = ({ label, value, sub, delay, color = "cyan" }: any) => {
    const MotionDiv = motion.div as any;
    const colorClass = color === 'amber' ? 'text-tech-amber' : 'text-tech-cyan';
    const bgClass = color === 'amber' ? 'bg-tech-amber' : 'bg-tech-cyan';
    
    return (
        <MotionDiv 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="border border-void-border bg-void-panel/50 p-4 relative overflow-hidden group hover:border-white/20 transition-colors"
        >
            <div className={`absolute top-0 right-0 w-16 h-16 ${bgClass} opacity-[0.03] rounded-bl-full`} />
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono text-void-dim uppercase tracking-widest">{label}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${bgClass} shadow-beam`} />
            </div>
            <div className={`text-3xl font-bold ${colorClass} tracking-tight font-sans`}>{value}</div>
            <div className="text-[10px] font-mono text-void-dim mt-1 border-t border-void-border/50 pt-2 flex justify-between">
                <span>DELTA</span>
                <span className="text-white opacity-60">{sub}</span>
            </div>
        </MotionDiv>
    );
};

export const StatusSector: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
        {/* Left Column - Core Stats */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
            <h3 className="text-tech-cyan font-mono text-xs tracking-widest mb-2 flex items-center gap-2">
                <div className="w-4 h-[1px] bg-tech-cyan" />
                CORE_TELEMETRY
            </h3>
            <DataModule label="CPU_LOAD" value="98.4%" sub="+2.4%" delay={0.1} />
            <DataModule label="THERMAL" value="64°C" sub="NOMINAL" delay={0.2} color="amber" />
            <DataModule label="MEMORY" value="32GB" sub="64% USE" delay={0.3} />
            
            <div className="mt-8 border border-void-border p-4">
                <div className="text-[10px] text-void-dim font-mono mb-2">SIGNAL_STRENGTH</div>
                <div className="flex gap-1 h-12 items-end">
                    {[...Array(20)].map((_, i) => (
                         <div 
                            key={i} 
                            className="flex-1 bg-tech-cyan/20 hover:bg-tech-cyan transition-colors" 
                            style={{ height: `${Math.random() * 100}%` }} 
                        />
                    ))}
                </div>
            </div>
        </div>
        
        {/* Right Column - Visualizer */}
        <div className="col-span-12 md:col-span-8 flex flex-col h-full min-h-[400px]">
            <h3 className="text-white font-mono text-xs tracking-widest mb-2 flex items-center gap-2 justify-end">
                ACTIVE_NODES_VISUAL
                <div className="w-4 h-[1px] bg-white" />
            </h3>
            <div className="flex-1 border border-void-border relative bg-black flex items-center justify-center overflow-hidden">
                 {/* Grid BG */}
                 <div className="absolute inset-0 tech-grid-bg opacity-30" />
                 
                 {/* Central Viz */}
                 <div className="relative w-64 h-64 border border-void-border rounded-full flex items-center justify-center animate-spin-slow">
                     <div className="absolute inset-0 border border-dashed border-void-dim rounded-full" />
                     <div className="w-48 h-48 border border-tech-cyan/30 rounded-full flex items-center justify-center">
                         <span className="text-4xl font-bold text-white animate-pulse">404</span>
                     </div>
                     
                     {/* Satellites */}
                     {[0, 90, 180, 270].map((deg, i) => (
                         <div 
                            key={i}
                            className="absolute w-3 h-3 bg-void-panel border border-tech-cyan" 
                            style={{ transform: `rotate(${deg}deg) translateX(128px)` }} 
                         />
                     ))}
                 </div>
                 
                 {/* Overlay Text */}
                 <div className="absolute bottom-4 left-4 font-mono text-xs text-tech-amber">
                     WARN: SECTOR 7 UNSTABLE
                 </div>
            </div>
        </div>
    </div>
  );
};