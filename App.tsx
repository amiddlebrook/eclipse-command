import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertCircle, ArrowDownRight, ArrowRight, ArrowUpRight, Bell,
  Check, CheckCircle2, ChevronDown, CircleDot, Clock3, Command, Cpu,
  Download, Gauge, GitBranch, Layers3, LayoutDashboard, Network,
  Pause, Play, Radar, RotateCcw, Search, ShieldCheck, TerminalSquare,
  Waves, X
} from 'lucide-react';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import './styles.css';

type View = 'overview' | 'nodes' | 'playbooks' | 'telemetry';
type Health = 'healthy' | 'degraded' | 'critical';
type Severity = 'high' | 'medium' | 'low';
type NodeRecord = {
  id: string; name: string; region: string; cluster: string;
  health: Health; load: number; latency: number; uptime: string;
};
type Incident = {
  id: string; title: string; summary: string; node: string;
  severity: Severity; opened: string;
};
type EventRecord = { id: number; at: string; message: string; kind: string };

const NAV: { id: View; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'nodes', label: 'Node network', icon: Network },
  { id: 'playbooks', label: 'Playbooks', icon: GitBranch },
  { id: 'telemetry', label: 'Telemetry', icon: Activity }
];

const INCIDENTS: Incident[] = [
  { id: 'INC-2048', title: 'Elevated packet loss', summary: 'Intermittent loss at the North relay ingress.', node: 'N-04', severity: 'high', opened: '07:42 UTC' },
  { id: 'INC-2047', title: 'Compute saturation', summary: 'Sustained utilization above the scenario threshold.', node: 'N-11', severity: 'medium', opened: '07:26 UTC' },
  { id: 'INC-2046', title: 'Replica lag', summary: 'Secondary replication delay exceeds target.', node: 'N-16', severity: 'medium', opened: '06:58 UTC' },
  { id: 'INC-2045', title: 'Heartbeat jitter', summary: 'Non-critical variance in simulated heartbeat.', node: 'N-07', severity: 'low', opened: '06:41 UTC' }
];

const PLAYBOOKS = [
  { id: 'diagnostics', name: 'Full system diagnostics', description: 'Simulate checks across compute, routing and replica health.', duration: '~12 sec', checks: ['Inventory nodes', 'Check health thresholds', 'Generate diagnostic report'] },
  { id: 'failover', name: 'Regional failover rehearsal', description: 'Walk through the failover decision path without changing infrastructure.', duration: '~18 sec', checks: ['Validate standby region', 'Rehearse traffic shift', 'Record recovery checkpoints'] },
  { id: 'incident', name: 'Incident triage', description: 'Practice incident classification, ownership and response verification.', duration: '~8 sec', checks: ['Review open incidents', 'Classify severity', 'Generate next actions'] }
];

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem('eclipse:' + key);
    return value === null ? fallback : JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function makeNodes(tick: number): NodeRecord[] {
  const locations = ['US East', 'US West', 'EU Central', 'AP Southeast'];
  return Array.from({ length: 18 }, (_, i) => {
    const id = 'N-' + String(i + 1).padStart(2, '0');
    const health: Health = i === 3 ? 'critical' : [6, 10, 15].includes(i) ? 'degraded' : 'healthy';
    const load = Math.min(98, Math.max(18, Math.round(34 + ((i * 17) % 42) + Math.sin(tick * 0.47 + i * 0.8) * 9)));
    const latency = Math.max(8, Math.round(16 + (i * 11) % 66 + Math.sin(tick * 0.3 + i) * 6 + (health === 'critical' ? 92 : 0)));
    return { id, name: ['Relay', 'Compute', 'Storage', 'Gateway', 'Edge', 'Cache'][i % 6] + ' ' + String(i + 1).padStart(2, '0'),
      region: locations[i % 4], cluster: 'CL-' + String(Math.floor(i / 6) + 1).padStart(2, '0'),
      health, load, latency, uptime: health === 'critical' ? '96.21%' : '99.' + String(92 + i % 7).padStart(2, '0') + '%' };
  });
}

function seriesFor(tick: number) {
  return Array.from({ length: 36 }, (_, i) => ({
    time: String(i * 2).padStart(2, '0') + 'm',
    compute: Math.round(49 + Math.sin((i + tick) / 4) * 17 + Math.cos(i / 2.7) * 5),
    traffic: Math.round(38 + Math.cos((i + tick) / 5) * 16 + Math.sin(i / 3.2) * 7)
  }));
}

function formatUtc(date: Date): string {
  return date.toISOString().slice(11, 19) + ' UTC';
}

function StatusTag({ health }: { health: Health }) {
  return <span className={'status-tag ' + health}><span className="status-dot" />{health}</span>;
}

function Panel({ children, title, eyebrow, action, className = '' }: {
  children: React.ReactNode; title: string; eyebrow?: string; action?: React.ReactNode; className?: string;
}) {
  return <section className={'panel ' + className}>
    <div className="panel-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2></div>{action}</div>
    {children}
  </section>;
}

function Stat({ title, value, detail, icon: Icon, tone = 'default' }: {
  title: string; value: string; detail: string; icon: React.ElementType; tone?: string;
}) {
  return <div className={'stat-card stat-' + tone}>
    <div className="stat-top"><span>{title}</span><Icon size={17} strokeWidth={1.8} /></div>
    <strong>{value}</strong><div className="stat-detail">{detail}</div>
  </div>;
}

export default function App() {
  const [view, setView] = useState<View>('overview');
  const [now, setNow] = useState(() => new Date());
  const [running, setRunning] = useState(true);
  const [tick, setTick] = useState(0);
  const [acknowledged, setAcknowledged] = useState<string[]>(() => loadLocal('acknowledged', []));
  const [events, setEvents] = useState<EventRecord[]>(() => loadLocal('events', []));
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | Health>('all');
  const [selectedId, setSelectedId] = useState('N-04');
  const [activePlaybook, setActivePlaybook] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setTick(t => t + 1), 4000);
    return () => window.clearInterval(timer);
  }, [running]);
  useEffect(() => {
    try { localStorage.setItem('eclipse:acknowledged', JSON.stringify(acknowledged)); } catch { /* optional persistence */ }
  }, [acknowledged]);
  useEffect(() => {
    try { localStorage.setItem('eclipse:events', JSON.stringify(events)); } catch { /* optional persistence */ }
  }, [events]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3400);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (event.altKey || event.ctrlKey || event.metaKey || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (event.key === 'Escape') { setView('overview'); return; }
      const index = Number(event.key) - 1;
      if (index >= 0 && index < NAV.length) setView(NAV[index].id);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const nodes = useMemo(() => makeNodes(tick), [tick]);
  const chart = useMemo(() => seriesFor(tick), [tick]);
  const selectedNode = nodes.find(n => n.id === selectedId) || nodes[0];
  const visibleNodes = nodes.filter(n => (filter === 'all' || n.health === filter) &&
    (n.name + ' ' + n.id + ' ' + n.region + ' ' + n.cluster).toLowerCase().includes(query.toLowerCase()));
  const healthy = nodes.filter(n => n.health === 'healthy').length;
  const openIncidents = INCIDENTS.filter(i => !acknowledged.includes(i.id));
  const averageLoad = Math.round(nodes.reduce((sum, n) => sum + n.load, 0) / nodes.length);
  const averageLatency = Math.round(nodes.reduce((sum, n) => sum + n.latency, 0) / nodes.length);
  const viewName = NAV.find(n => n.id === view)?.label || 'Overview';

  function record(message: string, kind = 'info') {
    setEvents(previous => [{ id: Date.now(), at: formatUtc(new Date()), message, kind }, ...previous].slice(0, 40));
  }
  function acknowledge(incident: Incident) {
    if (acknowledged.includes(incident.id)) return;
    setAcknowledged(ids => [...ids, incident.id]);
    record('Acknowledged ' + incident.id + ' (' + incident.node + ')', 'success');
    setToast(incident.id + ' acknowledged locally');
  }
  function runPlaybook(id: string) {
    if (activePlaybook) return;
    const playbook = PLAYBOOKS.find(p => p.id === id);
    if (!playbook) return;
    setActivePlaybook(id);
    record('Started simulated playbook: ' + playbook.name);
    window.setTimeout(() => {
      setActivePlaybook(current => current === id ? null : current);
      record('Completed simulated playbook: ' + playbook.name, 'success');
      setToast('Simulation complete: ' + playbook.name);
    }, 1800);
  }
  function exportSnapshot() {
    const snapshot = {
      product: 'Eclipse Command', mode: 'LOCAL_DEMO', exportedAt: new Date().toISOString(),
      tick, nodes, incidents: INCIDENTS.map(i => ({ ...i, acknowledged: acknowledged.includes(i.id) })),
      events, metrics: { averageLoad, averageLatency }
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'eclipse-snapshot-' + new Date().toISOString().slice(0, 10) + '.json';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    record('Exported local demo snapshot', 'success');
    setToast('JSON snapshot downloaded');
  }
  function resetDemo() {
    setTick(0);
    setAcknowledged([]);
    setEvents([]);
    setRunning(true);
    setActivePlaybook(null);
    setToast('Demo state reset');
  }

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Command size={23} strokeWidth={2.1} /></div>
        <div className="brand-name">ECLIPSE<span>COMMAND</span><small>OPERATIONS CONSOLE</small></div>
      </div>
      <div className="side-section-label">WORKSPACE <span>01 / 04</span></div>
      <nav className="side-nav" aria-label="Main navigation">
        {NAV.map((item, index) => <button key={item.id} className={'nav-link ' + (view === item.id ? 'selected' : '')}
          onClick={() => setView(item.id)} aria-current={view === item.id ? 'page' : undefined}>
          <item.icon size={18} strokeWidth={1.85} /><span>{item.label}</span><kbd>{index + 1}</kbd>
        </button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="demo-card"><div className="demo-card-head"><span className="pulse-dot" />SANDBOX ACTIVE</div>
          <strong>Interactive demo environment</strong>
          <p>All telemetry, nodes and incidents are simulated. No production systems are connected.</p>
        </div>
        <div className="sidebar-footer"><ShieldCheck size={15} /> Local-first · No account required</div>
      </div>
    </aside>

    <div className="workspace">
      <header className="topbar">
        <div className="breadcrumbs"><span>Workspace</span><span className="crumb-separator">/</span><strong>{viewName}</strong></div>
        <div className="top-actions">
          <span className="environment"><span className="pulse-dot" />DEMO ENVIRONMENT</span>
          <span className="utc-clock"><Clock3 size={15} />{formatUtc(now)}</span>
          <button className="icon-button" aria-label="Go to incidents" title="Open incidents" onClick={() => setView('overview')}>
            <Bell size={18}/>{openIncidents.length > 0 && <i />}
          </button>
        </div>
      </header>

      <main className="content">
        <div className="page-intro">
          <div><div className="eyebrow intro-eyebrow"><span className="live-line"/>OPERATIONS / {view.toUpperCase()}</div>
            <h1>{view === 'overview' ? 'Mission overview' : view === 'nodes' ? 'Node network' : view === 'playbooks' ? 'Response playbooks' : 'System telemetry'}</h1>
            <p>{view === 'overview' ? 'A single view of your simulated infrastructure and response activity.'
              : view === 'nodes' ? 'Explore the synthetic topology, filter health states and inspect node details.'
              : view === 'playbooks' ? 'Rehearse operational response workflows without affecting any real systems.'
              : 'Monitor generated sample metrics for visualization and workflow testing.'}</p>
          </div>
          <div className="intro-controls">
            <button className="button button-muted" onClick={() => setRunning(v => !v)}>
              {running ? <Pause size={15}/> : <Play size={15}/>} {running ? 'Pause feed' : 'Resume feed'}
            </button>
            <button className="button button-primary" onClick={exportSnapshot}><Download size={15}/> Export snapshot</button>
          </div>
        </div>

        <div className="context-strip"><div><CircleDot size={15} /> <strong>SIMULATION MODE</strong><span className="strip-divider">/</span>Data is generated in your browser and never represents live infrastructure.</div>
          <span className="strip-right">{running ? 'FEED RUNNING' : 'FEED PAUSED'} <span className={'tiny-led ' + (running ? '' : 'off')}/></span>
        </div>

        {view === 'overview' && <>
          <div className="stats-grid">
            <Stat title="Total nodes" value={String(nodes.length).padStart(2, '0')} detail="Across 4 synthetic regions" icon={Network}/>
            <Stat title="Healthy nodes" value={String(healthy).padStart(2, '0')} detail={Math.round(healthy / nodes.length * 100) + '% operating normally'} icon={CheckCircle2} tone="good"/>
            <Stat title="Open incidents" value={String(openIncidents.length).padStart(2, '0')} detail={INCIDENTS.length - openIncidents.length + ' acknowledged locally'} icon={AlertCircle} tone="warn"/>
            <Stat title="Avg. node load" value={averageLoad + '%'} detail="Synthetic utilization" icon={Gauge} tone="blue"/>
          </div>
          <div className="overview-grid">
            <Panel title="Network performance" eyebrow="01 / SIGNAL MONITOR" className="performance-panel"
              action={<button className="text-button" onClick={() => setView('telemetry')}>Full telemetry <ArrowRight size={15}/></button>}>
              <div className="chart-legend"><span><i className="legend-line cyan"/>Compute utilization</span><span><i className="legend-line purple"/>Traffic index</span><span className="chart-label">SAMPLE DATA · RELATIVE UNITS</span></div>
              <div className="large-chart"><ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart} margin={{ top: 12, right: 8, left: -30, bottom: 0 }}>
                  <defs><linearGradient id="computeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4edbc9" stopOpacity={0.25}/><stop offset="100%" stopColor="#4edbc9" stopOpacity={0}/></linearGradient>
                    <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9386f8" stopOpacity={0.15}/><stop offset="100%" stopColor="#9386f8" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid vertical={false} stroke="#273345" strokeDasharray="3 6"/>
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: '#738199', fontSize: 10 }} interval={6}/>
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: '#738199', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#101b2c', border: '1px solid #344159', borderRadius: 10, fontSize: 12 }} />
                  <Area type="monotone" dataKey="compute" stroke="#4edbc9" strokeWidth={2.5} fill="url(#computeFill)" isAnimationActive={false}/>
                  <Area type="monotone" dataKey="traffic" stroke="#9386f8" strokeWidth={2} fill="url(#trafficFill)" isAnimationActive={false}/>
                </AreaChart>
              </ResponsiveContainer></div>
              <div className="panel-foot"><span><span className="dot green"/>Data replay active</span><span>Updated every 4 sec</span></div>
            </Panel>
            <Panel title="Network health" eyebrow="02 / TOPOLOGY" action={<span className="mini-label">18 NODES</span>}>
              <div className="health-ring-layout">
                <div className="health-ring" style={{ '--healthy-pct': String(healthy / nodes.length * 100) + '%' } as React.CSSProperties}>
                  <div className="health-ring-center"><strong>{Math.round(healthy / nodes.length * 100)}%</strong><small>HEALTHY</small></div>
                </div>
                <div className="health-breakdown">
                  <div><span className="dot green"/> Healthy <strong>{healthy}</strong></div>
                  <div><span className="dot amber"/> Degraded <strong>{nodes.filter(n => n.health === 'degraded').length}</strong></div>
                  <div><span className="dot red"/> Critical <strong>{nodes.filter(n => n.health === 'critical').length}</strong></div>
                </div>
              </div>
              <div className="region-list"><div className="subsection-label">REGIONAL DISTRIBUTION</div>
                {['US East', 'US West', 'EU Central', 'AP Southeast'].map(region => <div key={region}><span>{region}</span><div className="region-track"><i style={{ width: (nodes.filter(n=> n.region === region).length / 6 * 100) + '%' }}/></div><strong>{nodes.filter(n => n.region === region).length}</strong></div>)}
              </div>
            </Panel>
          </div>
          <div className="overview-grid lower-grid">
            <Panel title="Incident queue" eyebrow="03 / ACTIVE ALERTS" action={<span className="mini-label">{openIncidents.length} OPEN</span>}>
              <div className="incident-list">{INCIDENTS.map(incident => <div className={'incident-row ' + (acknowledged.includes(incident.id) ? 'muted-row' : '')} key={incident.id}>
                <div className={'severity-mark ' + incident.severity}/><div className="incident-main"><div><strong>{incident.title}</strong><span className={'severity-tag ' + incident.severity}>{incident.severity}</span></div><p>{incident.id} · {incident.node} · {incident.opened}</p></div>
                <button className="small-button" onClick={() => acknowledge(incident)} disabled={acknowledged.includes(incident.id)}>
                  {acknowledged.includes(incident.id) ? <><Check size={13}/> Acked</> : 'Acknowledge'}
                </button>
              </div>)}</div>
            </Panel>
            <Panel title="Activity log" eyebrow="04 / OPERATOR ACTIONS" action={<span className="mini-label">LOCAL ONLY</span>}>
              <div className="activity-list">
                {events.length === 0 ? <div className="empty-activity"><TerminalSquare size={24}/><strong>No actions recorded</strong><span>Acknowledge an incident or run a playbook to build your local activity trail.</span></div> :
                  events.slice(0, 5).map(event => <div className="activity-item" key={event.id}><span className={'activity-icon ' + event.kind}>{event.kind === 'success' ? <Check size={13}/> : <CircleDot size={13}/>}</span><div><strong>{event.message}</strong><span>{event.at}</span></div></div>)}
              </div>
              <div className="panel-foot"><span>Stored in this browser</span><button className="text-button" onClick={() => setView('playbooks')}>Open playbooks <ArrowRight size={14}/></button></div>
            </Panel>
          </div>
        </>}

        {view === 'nodes' && <div className="nodes-layout">
          <Panel title="Node inventory" eyebrow="DISCOVERY / SYNTHETIC ASSETS" className="inventory-panel" action={<span className="mini-label">{visibleNodes.length} RESULTS</span>}>
            <div className="filter-bar"><label className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search nodes, region or cluster..." aria-label="Search nodes"/></label>
              <label className="filter-select"><span className="sr-only">Filter by status</span><select value={filter} onChange={e => setFilter(e.target.value as typeof filter)}><option value="all">All statuses</option><option value="healthy">Healthy</option><option value="degraded">Degraded</option><option value="critical">Critical</option></select><ChevronDown size={14}/></label></div>
            <div className="table-scroll"><table className="nodes-table"><thead><tr><th>NODE</th><th>REGION</th><th>STATUS</th><th>LOAD</th><th>LATENCY</th><th></th></tr></thead><tbody>
              {visibleNodes.map(node => <tr key={node.id} className={selectedId === node.id ? 'active-tr' : ''} onClick={() => setSelectedId(node.id)}>
                <td><button className="node-name" onClick={() => setSelectedId(node.id)}><span className="node-symbol"><Cpu size={15}/></span><span><strong>{node.name}</strong><small>{node.id} · {node.cluster}</small></span></button></td>
                <td>{node.region}</td><td><StatusTag health={node.health}/></td><td><div className="load-meter"><span>{node.load}%</span><i><b style={{ width: node.load + '%' }}/></i></div></td><td>{node.latency} ms</td><td><ArrowUpRight size={15}/></td>
              </tr>)}
            </tbody></table>{visibleNodes.length === 0 && <div className="empty-state">No nodes match your filters.</div>}</div>
          </Panel>
          <Panel title="Node inspector" eyebrow="ASSET DETAILS" className="inspector-panel">
            <div className="inspector-icon"><Cpu size={30}/></div><div className="inspector-id">{selectedNode.id} / {selectedNode.cluster}</div><h3>{selectedNode.name}</h3>
            <StatusTag health={selectedNode.health}/>
            <div className="inspector-stats">
              <div><span>Region</span><strong>{selectedNode.region}</strong></div><div><span>Utilization</span><strong>{selectedNode.load}%</strong></div><div><span>Latency</span><strong>{selectedNode.latency} ms</strong></div><div><span>Uptime target</span><strong>{selectedNode.uptime}</strong></div>
            </div>
            <div className="inspector-notice"><AlertCircle size={16}/>Read-only demo topology. No infrastructure control endpoints are connected.</div>
            <button className="button button-outline full" onClick={() => { setView('playbooks'); setToast('Choose a rehearsal playbook'); }}><GitBranch size={16}/> Open response playbooks</button>
          </Panel>
        </div>}

        {view === 'playbooks' && <>
          <div className="playbook-intro"><div className="playbook-symbol"><GitBranch size={24}/></div><div><strong>Safe rehearsal mode</strong><p>These playbooks create local log entries only. They never dispatch commands, change configuration or contact remote hosts.</p></div></div>
          <div className="playbooks-grid">{PLAYBOOKS.map((playbook, i) => <div className="playbook-card" key={playbook.id}>
            <div className="playbook-top"><span className="playbook-index">0{i + 1} / SIMULATOR</span><span className="tag-outline">AVAILABLE</span></div>
            <div className="playbook-icon"><Layers3 size={25}/></div><h2>{playbook.name}</h2><p>{playbook.description}</p>
            <div className="playbook-steps"><div className="subsection-label">EXECUTION CHECKLIST</div>{playbook.checks.map((check, idx) => <div key={check}><span>{idx + 1}</span>{check}</div>)}</div>
            <div className="playbook-bottom"><span><Clock3 size={14}/> Demo ~2 sec</span><button className="button button-primary" disabled={activePlaybook !== null} onClick={() => runPlaybook(playbook.id)}>
              {activePlaybook === playbook.id ? <><Radar size={15} className="spin"/> Running</> : <><Play size={15}/> Rehearse</>}
            </button></div>
          </div>)}</div>
          <Panel title="Execution history" eyebrow="LOCAL ACTIVITY" action={<button className="text-button" onClick={() => setEvents([])}>Clear history <X size={14}/></button>}>
            <div className="history-list">{events.length === 0 ? <div className="empty-state">No playbooks or other local actions have run yet.</div> : events.map(event => <div className="history-row" key={event.id}><span className="history-time">{event.at}</span><span className="dot green"/><strong>{event.message}</strong></div>)}</div>
          </Panel>
        </>}

        {view === 'telemetry' && <>
          <div className="stats-grid"><Stat title="Mean utilization" value={averageLoad + '%'} detail="Synthetic compute index" icon={Cpu}/><Stat title="Mean latency" value={averageLatency + ' ms'} detail="Synthetic regional latency" icon={Waves} tone="blue"/>
            <Stat title="Healthy capacity" value={Math.round(healthy / nodes.length * 100) + '%'} detail="Scenario node health" icon={ShieldCheck} tone="good"/><Stat title="Sample interval" value="4 sec" detail={running ? 'Generator running' : 'Generator paused'} icon={Clock3} tone="warn"/></div>
          <Panel title="Signal analysis" eyebrow="TIME SERIES / BROWSER GENERATED" action={<span className="mini-label">36 SAMPLES</span>}>
            <div className="chart-legend"><span><i className="legend-line cyan"/>Compute utilization</span><span><i className="legend-line purple"/>Traffic index</span></div>
            <div className="telemetry-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}><CartesianGrid stroke="#273345" strokeDasharray="3 6" vertical={false}/>
              <XAxis dataKey="time" tick={{ fill: '#738199', fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis domain={[0,100]} tick={{ fill: '#738199', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background: '#101b2c', border: '1px solid #344159', borderRadius: 10, fontSize: 12 }}/>
              <Area dataKey="compute" stroke="#4edbc9" strokeWidth={2.5} fill="#4edbc9" fillOpacity={0.09} type="monotone" isAnimationActive={false}/>
              <Area dataKey="traffic" stroke="#9386f8" strokeWidth={2} fill="#9386f8" fillOpacity={0.05} type="monotone" isAnimationActive={false}/>
            </AreaChart></ResponsiveContainer></div>
            <div className="panel-foot"><span><span className="dot green"/>Generated inside browser</span><button className="text-button" onClick={() => setTick(t => t + 1)}>Advance sample <ArrowRight size={14}/></button></div>
          </Panel>
          <Panel title="Simulation controls" eyebrow="SCENARIO / CONFIGURATION"><div className="simulation-controls"><div><strong>Playback controls</strong><p>Pause or advance the deterministic scenario. This does not connect to external monitoring services.</p></div><div><button className="button button-muted" onClick={() => setRunning(v => !v)}>{running ? <Pause size={15}/> : <Play size={15}/>} {running ? 'Pause' : 'Resume'}</button><button className="button button-outline" onClick={resetDemo}><RotateCcw size={15}/> Reset scenario</button></div></div></Panel>
        </>}

        <footer className="page-footer"><span>© 2026 ECLIPSE COMMAND <i/> SANDBOX / LOCAL STATE</span><span>Built for Cloudflare Workers <ArrowUpRight size={13}/></span></footer>
      </main>
    </div>
    {toast && <div className="toast" role="status"><CheckCircle2 size={18}/>{toast}</div>}
  </div>;
}
