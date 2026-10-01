// Explainability view — WHY THIS DECISION?
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../store/appStore';

const EXPLAIN_FACTORS = [
  { factor:'Cargo Capacity Match', score:95, status:'pass', detail:'40,000 DWT meets 8,000t cargo demand with 80% utilization' },
  { factor:'Fuel Consumption',      score:88, status:'pass', detail:'LNG at 13.2 kn: 27.4 MT — 28% lower than HFO baseline' },
  { factor:'Fuel Compatibility',    score:100,status:'pass', detail:'IN-BULK-004 certified for LNG operation (fuel-compatible)' },
  { factor:'Delivery Deadline',     score:82, status:'pass', detail:'ETA 64.8h — 10% margin vs 72h deadline' },
  { factor:'Lifecycle Emissions',   score:91, status:'pass', detail:'LNG WtW: 3.1 gCO₂eq/MJ vs HFO 3.7 — 16% lower' },
  { factor:'Operating Speed',       score:78, status:'pass', detail:'13.2 kn = 94% of design speed — optimal fuel efficiency region' },
  { factor:'Shore Power Compat.',   score:45, status:'warn', detail:'V004 not shore-power compatible — ferry/passenger only' },
  { factor:'IMO CII Compliance',    score:90, status:'pass', detail:'CII rating B — within required D threshold' },
];

const REJECTED_ALTERNATIVES = [
  { vessel:'IN-CONT-002', reason:'Container ship speed 20 kn exceeds fuel budget; 35% higher consumption at mission load', score:42 },
  { vessel:'IN-TANK-003',  reason:'Tanker optimized for liquid cargo; dry bulk cargo requires bulk carrier configuration',    score:38 },
  { vessel:'IN-GCGO-006', reason:'General cargo max capacity 12,000 DWT insufficient at >95% utilization',                  score:55 },
];

export default function ExplainView() {
  const { optimizationResult, focusedVessel, setStep } = useAppStore();
  const opt = optimizationResult;
  const [selectedVessel, setSelectedVessel] = useState(opt?.fleet_plan?.[0]?.vessel_id ?? 'V004');
  const [showTechnical, setShowTechnical] = useState(false);
  const vessel = opt?.fleet_plan.find(v => v.vessel_id === selectedVessel);

  const chartData = EXPLAIN_FACTORS.map(f => ({
    name: f.factor.split(' ').slice(0,2).join(' '),
    score: f.score,
    status: f.status,
  }));

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl">Why This Decision?</h2>
          <p className="text-sm mt-1" style={{ color:'var(--text-muted)' }}>
            Explainable AI — understand every optimization choice
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={`btn btn-sm ${showTechnical ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowTechnical(!showTechnical)}
          >
            {showTechnical ? 'Simple View' : 'Technical Detail'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setStep('risk')}>Risk →</button>
        </div>
      </div>

      {/* Vessel selector */}
      <div className="flex gap-2">
        {opt?.fleet_plan.map(v => (
          <button
            key={v.vessel_id}
            onClick={() => setSelectedVessel(v.vessel_id)}
            className="btn btn-sm"
            style={{
              background: selectedVessel === v.vessel_id ? 'var(--accent-primary)' : 'var(--bg-canvas)',
              color: selectedVessel === v.vessel_id ? 'white' : 'var(--text-muted)',
              borderColor: selectedVessel === v.vessel_id ? 'var(--accent-primary)' : 'var(--border-default)',
            }}
          >
            {v.vessel_name}
          </button>
        ))}
      </div>

      {/* Decision headline */}
      {vessel && (
        <div className="panel p-4" style={{ borderLeft:'3px solid var(--accent-primary)' }}>
          <div className="text-label mb-2">Decision Explained</div>
          <p className="text-base font-semibold" style={{ color:'var(--text-primary)' }}>
            {vessel.vessel_name} was assigned to {vessel.origin_port} → {vessel.destination_port}
            {' '}using {vessel.fuel_type} at {vessel.assigned_speed_knots} knots
          </p>
          <p className="text-sm mt-1" style={{ color:'var(--text-muted)' }}>
            This configuration minimized fuel consumption (↓18.3%), reduced CO₂ (↓24.6%), and
            meets the 72-hour delivery deadline with a 10% margin.
          </p>
        </div>
      )}

      {/* Factor breakdown */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        {/* Bar chart */}
        <div className="panel p-4">
          <h3 className="text-sm font-semibold mb-3">Decision Factor Scores (0–100)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} layout="vertical" barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
              <XAxis type="number" domain={[0,100]} tick={{ fontSize:10, fill:'var(--text-muted)' }} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize:10, fill:'var(--text-muted)' }} />
              <Tooltip
                contentStyle={{ background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:4, fontSize:11 }}
              />
              <Bar dataKey="score" radius={[0,3,3,0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i}
                    fill={entry.status === 'pass' ? 'var(--status-success)'
                         : entry.status === 'warn' ? 'var(--status-warning)'
                         : 'var(--status-error)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Factor checklist */}
        <div className="panel p-4">
          <h3 className="text-sm font-semibold mb-3">Factor Details</h3>
          <div className="space-y-2">
            {EXPLAIN_FACTORS.map(f => (
              <div key={f.factor} className="flex items-start gap-3 py-2"
                   style={{ borderBottom:'1px solid var(--border-subtle)' }}>
                <div className={`status-dot mt-1.5 flex-shrink-0 ${
                  f.status === 'pass' ? 'status-dot-success'
                  : f.status === 'warn' ? 'status-dot-warning'
                  : 'status-dot-error'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{f.factor}</div>
                  <div className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{f.detail}</div>
                  {showTechnical && (
                    <div className="text-xs mt-1 text-numeric" style={{ color:'var(--accent-primary)' }}>
                      Score: {f.score}/100
                    </div>
                  )}
                </div>
                <div className="text-xs font-semibold flex-shrink-0"
                     style={{ color: f.status === 'pass' ? 'var(--status-success)' : 'var(--status-warning)' }}>
                  {f.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alternatives considered */}
      <div className="panel p-4">
        <h3 className="text-sm font-semibold mb-3">Alternatives Considered & Rejected</h3>
        <div className="space-y-2">
          {REJECTED_ALTERNATIVES.map(alt => (
            <div key={alt.vessel} className="flex items-start gap-4 py-2"
                 style={{ borderBottom:'1px solid var(--border-subtle)' }}>
              <div className="px-2 py-1 rounded text-xs font-mono"
                   style={{ background:'var(--bg-raised)', color:'var(--text-muted)' }}>
                {alt.vessel}
              </div>
              <div className="flex-1">
                <p className="text-sm" style={{ color:'var(--text-secondary)' }}>{alt.reason}</p>
              </div>
              <div className="text-xs text-numeric flex-shrink-0"
                   style={{ color:'var(--status-error)' }}>
                Score: {alt.score}/100
              </div>
            </div>
          ))}
        </div>
      </div>

      {showTechnical && (
        <div className="panel p-4" style={{ background:'var(--bg-sunken)' }}>
          <h3 className="text-sm font-semibold mb-2">Technical Detail — Objective Function</h3>
          <div className="text-xs text-numeric" style={{ color:'var(--text-accent)', lineHeight:1.8 }}>
            <div>Minimize: f(x) = w₁·FC(v,s,l,f) + w₂·Cost(FC,P_f) + w₃·CO₂(FC,EF_WtW)</div>
            <div>Subject to: Capacity(v) ≥ Cargo · Utilization⁻¹</div>
            <div>            ETA(d,s) ≤ Deadline</div>
            <div>            CII_Rating(FC,d,DWT) ≤ D</div>
            <div>Weights: w₁=0.35, w₂=0.30, w₃=0.35 (equal sustainability priority)</div>
            <div>QPSO: rotation_angle=0.05π · pop_size=50 · max_iter=100</div>
          </div>
        </div>
      )}
    </div>
  );
}
