import React from 'react';
import { motion } from 'framer-motion';

const NODES = Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    status: Math.random() > 0.9 ? 'error' : 'active',
    load: Math.floor(Math.random() * 100)
}));

export const GridSector: React.FC = () => {
  const MotionDiv = motion.div as any;
  
  return (
    <div className="max-w-7xl mx-auto relative">
        {/* Scanning Line */}
        <MotionDiv 
            className="absolute top-0 left-0 w-1 h-full bg-tech-cyan/50 shadow-beam z-20 pointer-events-none"
            animate={{ left: ['0%', '100%', '0%'] }}
            transition={{ duration: 10, ease: "linear", repeat: Infinity }}
        />

        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1 border-t border-l border-void-border">
            {NODES.map((node, i) => (
                <MotionDiv
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`
                        aspect-square border-r border-b border-void-border 
                        relative group hover:bg-void-light/5 transition-colors duration-200
                        flex flex-col justify-between p-3
                    `}
                >
                    <div className="flex justify-between items-start">
                        <span className="font-mono text-[10px] text-void-dim">{node.id.toString().padStart(2, '0')}</span>
                        <div className={`w-1.5 h-1.5 rounded-sm ${node.status === 'error' ? 'bg-tech-alert animate-pulse' : 'bg-tech-cyan'}`} />
                    </div>
                    
                    {/* SVG Connection Trace (Decorative) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 group-hover:opacity-60 transition-opacity">
                        <path d={`M0,${100 - node.load} L100,${node.load}`} stroke={node.status === 'error' ? '#FF2A2A' : '#00F0FF'} strokeWidth="1" fill="none" />
                    </svg>

                    <div className="font-sans font-bold text-lg text-white opacity-80">{node.load}%</div>
                </MotionDiv>
            ))}
        </div>
        
        <div className="mt-8 flex justify-between items-center bg-void-panel border border-void-border p-4">
            <div className="flex gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-tech-cyan rounded-sm" />
                    <span className="text-xs font-mono text-void-dim">ACTIVE</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-tech-alert rounded-sm" />
                    <span className="text-xs font-mono text-void-dim">CRITICAL</span>
                </div>
            </div>
            <div className="font-mono text-xs text-tech-cyan">SYNC_COMPLETE</div>
        </div>
    </div>
  );
};