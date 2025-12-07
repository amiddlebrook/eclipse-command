import React, { useState, useEffect } from 'react';
import { LayoutGroup } from 'framer-motion';
import { SectorID } from './types';
import { GyroNav } from './components/SolarNavigation';
import { TechPanel } from './components/ui/Card';

// Sectors
import { StatusSector } from './components/Dashboard';
import { GridSector } from './components/DataGrid';
import { SequenceSector } from './components/ProcessFlow';
import { MetricSector } from './components/ControlPanel';

const App: React.FC = () => {
  const [activeSector, setActiveSector] = useState<SectorID | null>(null);
  const [time, setTime] = useState('');

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => {
        const d = new Date();
        setTime(d.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-screen w-screen bg-void-bg text-white relative overflow-hidden selection:bg-tech-cyan selection:text-black">
      {/* Cinematic Grain Overlay */}
      <div className="noise-overlay" />
      
      {/* 3D Perspective Grid Background */}
      <div className="perspective-grid" />

      {/* Persistent HUD Layers */}
      <div className="fixed top-6 left-8 z-30 pointer-events-none hidden md:block">
          <div className="text-xs font-mono text-tech-cyan tracking-widest mb-1">ECLIPSE_OS_V4.2</div>
          <div className="w-24 h-[2px] bg-void-border relative">
              <div className="absolute top-0 left-0 h-full w-1/3 bg-tech-cyan" />
          </div>
      </div>

      <div className="fixed top-6 right-8 z-30 pointer-events-none text-right hidden md:block">
          <div className="text-xl font-mono text-white font-bold tracking-tight">{time}</div>
          <div className="text-[10px] font-mono text-void-dim tracking-widest">UTC // ZULU</div>
      </div>

      <div className="fixed bottom-6 left-8 z-30 pointer-events-none hidden md:flex items-end gap-4">
          <div className="w-8 h-8 border border-void-border flex items-center justify-center">
              <div className="w-4 h-4 bg-tech-cyan/20 animate-pulse" />
          </div>
          <div className="text-[10px] font-mono text-void-dim">
              NET: CONNECTED<br/>
              LAT: 24ms
          </div>
      </div>

      <div className="fixed bottom-6 right-8 z-30 pointer-events-none hidden md:block text-right">
          <div className="text-[10px] font-mono text-tech-amber tracking-widest">SECURE_CHANNEL</div>
          <div className="text-[10px] font-mono text-void-dim">ENC_256</div>
      </div>

      <LayoutGroup>
        {/* Main Navigation Gyro */}
        <GyroNav 
            activeSector={activeSector} 
            onActivate={setActiveSector} 
            onReset={() => setActiveSector(null)} 
        />

        {/* 
            Content Layer 
            It renders inside the "Frame" created by the GyroNav's expanded state.
        */}
        <div className={`
            fixed inset-0 z-40 flex items-center justify-center pointer-events-none
            transition-all duration-500
        `}>
            <div className={`
                w-[96vw] h-[92vh] pointer-events-auto
                ${activeSector ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}>
                {activeSector === SectorID.STATUS && (
                    <TechPanel title="System Status" isActive={activeSector === SectorID.STATUS}>
                        <StatusSector />
                    </TechPanel>
                )}
                {activeSector === SectorID.GRID && (
                    <TechPanel title="Node Grid" isActive={activeSector === SectorID.GRID}>
                        <GridSector />
                    </TechPanel>
                )}
                {activeSector === SectorID.SEQUENCE && (
                    <TechPanel title="Sequence" isActive={activeSector === SectorID.SEQUENCE}>
                        <SequenceSector />
                    </TechPanel>
                )}
                {activeSector === SectorID.METRICS && (
                    <TechPanel title="Metrics" isActive={activeSector === SectorID.METRICS}>
                        <MetricSector />
                    </TechPanel>
                )}
            </div>
        </div>
      </LayoutGroup>
    </div>
  );
};

export default App;