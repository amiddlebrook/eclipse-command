import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const DATA = Array.from({ length: 50 }).map((_, i) => ({
    time: i,
    val: 40 + Math.random() * 40 + (Math.sin(i * 0.2) * 20),
    val2: 30 + Math.random() * 20
}));

export const MetricSector: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
        {/* Top Chart */}
        <div className="h-[60%] w-full border border-void-border bg-void-panel/50 p-2 relative group">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none z-10">
                <div className="text-xs font-mono text-tech-cyan tracking-widest bg-black/50 px-2">FLUX_CAPACITY</div>
                <div className="flex gap-2">
                    <span className="text-xs font-mono text-white">MAX: 98.2</span>
                    <span className="text-xs font-mono text-void-dim">MIN: 12.4</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DATA}>
                    <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorVal2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFB800" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#FFB800" stopOpacity={0}/>
                        </linearGradient>
                        <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#333" strokeWidth="0.5"/>
                        </pattern>
                    </defs>
                    <CartesianGrid stroke="#1A1A1A" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#050505', border: '1px solid #333', color: '#fff' }}
                        itemStyle={{ fontFamily: 'monospace', fontSize: '11px' }}
                        cursor={{ stroke: '#fff', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="val" 
                        stroke="#00F0FF" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorVal)" 
                        isAnimationActive={true}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="val2" 
                        stroke="#FFB800" 
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        fillOpacity={1} 
                        fill="url(#colorVal2)" 
                        isAnimationActive={true}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>

        {/* Bottom Metrics Grid */}
        <div className="h-[40%] grid grid-cols-3 gap-4">
            {[1,2,3].map(i => (
                <div key={i} className="border border-void-border bg-void-panel p-4 flex flex-col justify-between hover:border-tech-cyan/30 transition-colors">
                    <div className="text-[10px] font-mono text-void-dim uppercase">Metric_0{i}</div>
                    <div className="text-2xl font-bold text-white font-sans">
                        {Math.floor(Math.random() * 1000)}
                        <span className="text-xs text-void-dim ml-1 font-normal">HZ</span>
                    </div>
                    <div className="w-full h-1 bg-void-border mt-2 overflow-hidden">
                        <div className="h-full bg-tech-cyan" style={{ width: `${Math.random() * 100}%` }} />
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};