import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectorID } from '../types';

interface GyroNavProps {
  activeSector: SectorID | null;
  onActivate: (id: SectorID) => void;
  onReset: () => void;
}

export const GyroNav: React.FC<GyroNavProps> = ({ activeSector, onActivate, onReset }) => {
  const MotionDiv = motion.div as any;
  const MotionButton = motion.button as any;
  const MotionSvg = motion.svg as any;

  // Configuration for sectors
  const sectors = [
    { id: SectorID.STATUS, label: 'STATUS', cx: '50%', cy: '10%', angle: -90 },
    { id: SectorID.GRID, label: 'GRID', cx: '90%', cy: '50%', angle: 0 },
    { id: SectorID.SEQUENCE, label: 'SEQ', cx: '50%', cy: '90%', angle: 90 },
    { id: SectorID.METRICS, label: 'DATA', cx: '10%', cy: '50%', angle: 180 },
  ];

  return (
    <>
      {/* 
        The Core Ring Container (Gyroscope)
        Expands to viewport frame when active.
      */}
      <MotionDiv
        layoutId="gyro-core"
        className={`
           fixed z-40 border border-void-light/20 shadow-glow
           flex items-center justify-center overflow-hidden bg-black/40 backdrop-blur-sm
        `}
        initial={false}
        animate={{
            width: activeSector ? '96vw' : '260px',
            height: activeSector ? '92vh' : '260px',
            borderRadius: activeSector ? '4px' : '50%',
            left: '50%',
            top: '50%',
            x: '-50%',
            y: '-50%',
            borderColor: activeSector ? 'rgba(0, 240, 255, 0.5)' : 'rgba(255,255,255,0.1)'
        }}
        transition={{ 
            type: "spring", 
            stiffness: 70, 
            damping: 15,
            mass: 0.8
        }}
      >
          {/* Inner Decorative Rings (Only visible in center/idle mode) */}
          <AnimatePresence>
            {!activeSector && (
                <MotionDiv
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    {/* Ring 1: Dashed Rotating Clockwise */}
                    <div className="absolute w-[85%] h-[85%] border border-dashed border-tech-cyan/30 rounded-full animate-spin-slow" />
                    
                    {/* Ring 2: Solid Reverse Rotating */}
                    <div className="absolute w-[70%] h-[70%] border border-white/10 rounded-full animate-spin-reverse-slow border-t-transparent border-l-transparent" />
                    
                    {/* Ring 3: Static Ticks */}
                    <div className="absolute w-[95%] h-[95%] rounded-full flex items-center justify-center">
                        <div className="absolute top-0 w-[1px] h-3 bg-tech-cyan/50" />
                        <div className="absolute bottom-0 w-[1px] h-3 bg-tech-cyan/50" />
                        <div className="absolute left-0 w-3 h-[1px] bg-tech-cyan/50" />
                        <div className="absolute right-0 w-3 h-[1px] bg-tech-cyan/50" />
                    </div>

                    {/* Center Point */}
                    <div className="w-2 h-2 bg-tech-cyan rounded-full shadow-beam" />
                </MotionDiv>
            )}
          </AnimatePresence>
      </MotionDiv>

      {/* 
        Orbital Navigation Controls (Idle State)
      */}
      {!activeSector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="relative w-[500px] h-[500px] pointer-events-auto">
                {/* Connecting Lines SVG */}
                <MotionSvg className="absolute inset-0 w-full h-full pointer-events-none">
                     <circle cx="250" cy="250" r="130" fill="none" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                </MotionSvg>
                
                {sectors.map((sector) => (
                    <MotionButton
                        key={sector.id}
                        className="absolute w-24 h-24 flex flex-col items-center justify-center group"
                        style={{ 
                            left: sector.cx, 
                            top: sector.cy, 
                            x: '-50%', 
                            y: '-50%' 
                        }}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => onActivate(sector.id)}
                    >
                        {/* Button Visuals */}
                        <div className="absolute inset-0 bg-void-panel border border-void-border group-hover:border-tech-cyan/50 rotate-45 transition-colors duration-300" />
                        
                        <div className="relative z-10 flex flex-col items-center gap-1">
                             <div className="text-[10px] font-mono text-void-dim group-hover:text-tech-cyan transition-colors">SEC_{sector.id.substring(0,2)}</div>
                             <span className="text-sm font-bold tracking-widest text-white group-hover:text-tech-cyan transition-colors">
                                {sector.label}
                             </span>
                        </div>

                        {/* Connection Line Trace */}
                        <div className="absolute w-[1px] h-[60px] bg-gradient-to-b from-transparent via-tech-cyan/20 to-transparent group-hover:via-tech-cyan transition-all" 
                             style={{ 
                                 top: '50%', left: '50%', 
                                 transformOrigin: 'top center',
                                 transform: `translate(-50%, -50%) rotate(${sector.angle + 180}deg) translateY(45px)` 
                             }} 
                        />
                    </MotionButton>
                ))}
            </div>
        </div>
      )}

      {/* 
        Close Button (Active State)
      */}
      <AnimatePresence>
        {activeSector && (
            <MotionButton
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.8 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] group flex items-center gap-3 bg-black/80 px-6 py-2 border border-void-border hover:border-tech-alert transition-colors backdrop-blur-md"
                onClick={onReset}
            >
                <div className="w-2 h-2 bg-tech-alert rounded-full animate-pulse" />
                <span className="text-xs font-mono tracking-widest text-void-dim group-hover:text-white transition-colors uppercase">
                    Abort View
                </span>
            </MotionButton>
        )}
      </AnimatePresence>
    </>
  );
};