// Quantum-Inspired Optimization view with live convergence animation
import React, { useEffect, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../store/appStore';

const OPT_STAGES = [
  { label: 'Generating Solutions',        desc: 'Initializing quantum population' },
  { label: 'Evaluating Configurations',   desc: 'Multi-objective fitness scoring' },
  { label: 'Quantum-Inspired Search',     desc: 'Applying quantum rotation gate' },
  { label: 'Constraint Handling',         desc: 'Checking hard/soft constraints' },
  { label: 'Pareto Exploration',          desc: 'Building non-dominated front' },
  { label: 'Solutions Found',             desc: 'Optimal deployment plan ready' },
];

const FUEL_COLORS: Record<string, string> = {
  HFO:'#ef4444', MGO:'#f97316', LNG:'#3b82f6', Methanol:'#8b5cf6', Hydrogen:'#10b981', Ammonia:'#f59e0b',
};

export default function OptimizationView() {
  const { optimizationResult, optimizationLoading, optimizationStage, runOptimization, setStep } = useAppStore();
  const opt = optimizationResult;
  const [shownIter, setShownIter] = useState(50);
  const animRef = useRef<number | null>(null);

  // Animate convergence
  useEffect(() => {
    if (opt && !optimizationLoading) {
      setShownIter(opt.convergence_curve.length);
    }
  }, [opt, optimizationLoading]);

  const convergenceData = opt?.convergence_curve.slice(0, shownIter).map((p, i) => ({
    iter: p.iteration,
    fitness: parseFloat(p.best_fitness.toFixed(2)),
    label: i === 0 ? 'Start' : '',
  })) || [];

  if (optimizationLoading) {
    return (
      <div className="p-5 space-y-4">
        <h2 className="font-display text-xl">Quantum-Inspired Optimization Running</h2>
        <div className="space-y-2">
          {OPT_STAGES.map((stage, i) => {
            const status = i < optimizationStage ? 'done' : i === optimizationStage ? 'running' : 'waiting';
            return (
              <div key={i} className={`opt-stage ${status}`}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                     style={{
                       background: status === 'done' ? 'var(--status-success)'
                                 : status === 'running' ? 'var(--accent-primary)' : 'var(--border-default)',
                       color: 'white',
                     }}>
                  {status === 'done' ? '✓' : i + 1}
                </div>
                <div>
                  <div className="font-medium">{stage.label}</div>
                  <div className="text-xs" style={{ color:'var(--text-muted)' }}>{stage.desc}</div>
                </div>
                {status === 'running' && (
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                         style={{ borderColor:'var(--accent-primary)', borderTopColor:'transparent' }}></div>
                    <span className="text-xs" style={{ color:'var(--accent-primary)' }}>Running…</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl">Jalmarg Optimization Engine</h2>
          <p className="text-sm mt-1" style={{ color:'var(--text-muted)' }}>
            Quantum-Inspired Particle Swarm Optimization (QPSO) · Run ID: {opt?.run_id || '—'}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary btn-lg" onClick={runOptimization}>
            ↻ Run Optimization
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setStep('digital_twin')}>
            Launch Twin →
          </button>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Fuel Saved',     value: opt ? `-${opt.fuel_saving_pct.toFixed(1)}%` : '—', sub: opt ? `${opt.total_fuel_mt.toFixed(1)} MT total` : '—', color:'var(--status-success)' },
          { label:'Cost Reduced',   value: opt ? `-${opt.cost_saving_pct.toFixed(1)}%` : '—', sub: opt ? `₹${opt.total_cost_inr_lakh.toFixed(1)}L/voyage` : '—', color:'var(--status-success)' },
          { label:'CO₂ Reduced',    value: opt ? `-${opt.emission_saving_pct.toFixed(1)}%` : '—', sub: opt ? `${opt.total_co2_t.toFixed(1)} t CO₂eq WtW` : '—', color:'var(--status-success)' },
        ].map(m => (
          <div key={m.label} className="panel p-4">
            <div className="text-label mb-1">{m.label}</div>
            <div className="metric-large" style={{ color:m.color }}>{m.value}</div>
            <div className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Fleet plan table */}
      <div className="panel">
        <div className="px-4 py-3 border-b flex items-center justify-between"
             style={{ borderColor:'var(--border-default)' }}>
          <h3 className="text-sm font-semibold">Optimal Fleet Deployment Plan</h3>
          <span className="badge badge-derived">Optimizer Output</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background:'var(--bg-raised)' }}>
              {['Vessel','Route','Opt. Speed (kn)','Fuel','Load%','Fuel (MT)','Cost (₹L)','CO₂ (t)','ETA (h)'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-label">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {opt?.fleet_plan.map((row, i) => {
              const fuelColor = FUEL_COLORS[row.fuel_type] || '#888';
              return (
                <tr key={row.vessel_id}
                    style={{ borderTop:'1px solid var(--border-subtle)', background: i%2===0 ? 'var(--bg-surface)' : 'var(--bg-canvas)' }}>
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{row.vessel_name}</div>
                    <div className="text-xs" style={{ color:'var(--text-muted)' }}>{row.vessel_type.replace('_',' ')}</div>
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    <div style={{ color:'var(--text-primary)' }}>{row.origin_port}</div>
                    <div style={{ color:'var(--text-muted)' }}>→ {row.destination_port}</div>
                  </td>
                  <td className="px-4 py-2.5 text-numeric font-semibold" style={{ color:'var(--accent-primary)' }}>{row.assigned_speed_knots}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold text-white"
                          style={{ background: fuelColor }}>
                      {row.fuel_type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-numeric">{row.cargo_load_pct}%</td>
                  <td className="px-4 py-2.5 text-numeric font-semibold">{row.fuel_mt.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-numeric">₹{row.cost_inr_lakh.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-numeric">{row.co2_t.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-numeric">{row.eta_hours.toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Convergence curve */}
      <div className="panel p-4">
        <h3 className="text-sm font-semibold mb-1">QPSO Convergence Curve</h3>
        <p className="text-xs mb-3" style={{ color:'var(--text-muted)' }}>
          Best fitness value per iteration — lower = better fleet deployment
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={convergenceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="iter" label={{ value:'Iteration', position:'insideBottom', offset:-2, fontSize:11, fill:'var(--text-muted)' }}
                   tick={{ fontSize:11, fill:'var(--text-muted)' }} />
            <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} domain={['auto','auto']} />
            <Tooltip
              contentStyle={{ background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:4, fontSize:12 }}
              labelFormatter={(l) => `Iteration ${l}`}
            />
            <Line type="monotone" dataKey="fitness" name="Best Fitness"
                  stroke="var(--accent-primary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs mt-2" style={{ color:'var(--text-muted)' }}>
          Population size: 50 · Max iterations: 100 · Quantum rotation angle: 0.05π · Seed: 42
        </p>
      </div>
    </div>
  );
}
