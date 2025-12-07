import React from 'react';
import { motion } from 'framer-motion';

const STEPS = [
    { id: '01', title: 'INITIATE_HANDSHAKE', status: 'complete', time: '0.002s' },
    { id: '02', title: 'DECRYPT_PAYLOAD', status: 'complete', time: '0.045s' },
    { id: '03', title: 'VERIFY_SIGNATURE', status: 'processing', time: '...' },
    { id: '04', title: 'EXECUTE_PROTOCOL', status: 'pending', time: '-' },
    { id: '05', title: 'CLOSE_CONNECTION', status: 'pending', time: '-' },
];

export const SequenceSector: React.FC = () => {
    const MotionDiv = motion.div as any;

  return (
    <div className="max-w-3xl mx-auto py-12 relative">
        {/* Vertical Trace Line */}
        <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-void-border">
            <div className="absolute top-0 w-full h-1/2 bg-tech-cyan shadow-beam" />
        </div>

        <div className="flex flex-col gap-8">
            {STEPS.map((step, i) => (
                <MotionDiv 
                    key={step.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="relative pl-20"
                >
                    {/* Node on Line */}
                    <div className={`
                        absolute left-[19px] top-6 w-3 h-3 rounded-full border-2 z-10 bg-void-bg
                        ${step.status === 'complete' ? 'border-tech-cyan bg-tech-cyan' : 
                          step.status === 'processing' ? 'border-tech-amber animate-pulse' : 'border-void-dim'}
                    `} />
                    
                    {/* Horizontal Connector */}
                    <div className={`absolute left-6 top-[29px] w-10 h-[1px] ${step.status === 'pending' ? 'bg-void-border' : 'bg-tech-cyan/50'}`} />

                    {/* Card */}
                    <div className={`
                        border p-6 flex justify-between items-center group transition-all duration-300
                        ${step.status === 'processing' ? 'border-tech-amber bg-tech-amber/5' : 
                          step.status === 'complete' ? 'border-tech-cyan/30 bg-void-panel' : 'border-void-border opacity-50'}
                    `}>
                        <div>
                            <span className={`text-[10px] font-mono mb-1 block ${step.status === 'processing' ? 'text-tech-amber' : 'text-tech-cyan'}`}>
                                STEP_{step.id}
                            </span>
                            <h4 className="text-xl font-bold tracking-wide text-white">{step.title}</h4>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-mono text-void-dim uppercase">LATENCY</div>
                            <span className="font-mono text-sm text-white">{step.time}</span>
                        </div>
                    </div>
                </MotionDiv>
            ))}
        </div>
    </div>
  );
};