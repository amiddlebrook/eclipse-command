import React from 'react';
import { motion } from 'framer-motion';

interface TechPanelProps {
  children: React.ReactNode;
  title: string;
  isActive: boolean;
}

export const TechPanel: React.FC<TechPanelProps> = ({ children, title, isActive }) => {
  const MotionDiv = motion.div as any;

  if (!isActive) return null;

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: "circOut" }}
      className="w-full h-full flex flex-col relative bg-void-panel/90 border border-void-border backdrop-blur-md overflow-hidden"
    >
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-tech-cyan z-20" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-tech-cyan z-20" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-tech-cyan z-20" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-tech-cyan z-20" />

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-void-border flex justify-between items-center bg-void-bg/50">
        <div className="flex items-center gap-4">
            <div className="flex gap-1">
                <div className="w-1.5 h-6 bg-tech-cyan animate-pulse" />
                <div className="w-1.5 h-6 bg-tech-cyan/50" />
                <div className="w-1.5 h-6 bg-tech-cyan/20" />
            </div>
            <div>
                <h1 className="text-3xl font-bold uppercase tracking-widest text-white leading-none">{title}</h1>
                <div className="text-[10px] text-tech-cyan font-mono tracking-[0.3em] opacity-80">SECTOR_ACTIVE // SECURE</div>
            </div>
        </div>
        <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-void-dim font-mono">OP_TIME</span>
                <span className="text-sm font-mono text-tech-amber">00:04:22</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-tech-cyan shadow-beam animate-pulse-fast" />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 tech-grid-bg opacity-20 pointer-events-none" />
        <div className="relative z-10 h-full overflow-auto custom-scrollbar p-8 md:p-12">
            {children}
        </div>
      </div>

      {/* Footer Decor */}
      <div className="h-2 w-full bg-void-bg border-t border-void-border flex items-center justify-center gap-32 overflow-hidden">
         {Array.from({length: 20}).map((_, i) => (
             <div key={i} className="w-12 h-[1px] bg-void-dim/20" />
         ))}
      </div>
    </MotionDiv>
  );
};