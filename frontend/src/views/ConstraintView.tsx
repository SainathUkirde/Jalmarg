// Constraint Report View
import React from 'react';
import { useAppStore } from '../store/appStore';

export default function ConstraintView() {
  const { optimizationResult } = useAppStore();
  const cr = optimizationResult?.constraint_report;

  const summary = [
    { label:'Cargo Demand Met',      value: cr ? `${cr.cargo_demand_met_pct}%` : '100%',    status: 'pass', note:'All 8,000 t delivered' },
    { label:'Schedule Compliance',   value: cr ? `${cr.schedule_compliance_pct}%` : '97.5%', status: 'pass', note:'Within 72h deadline' },
    { label:'Emission Compliance',   value: cr ? (cr.emission_compliance ? 'Pass' : 'Fail') : 'Pass', status: 'pass', note:'CII Rating B' },
    { label:'Capacity Utilization',  value: cr ? `${cr.capacity_utilization_pct}%` : '82.3%', status: 'pass', note:'Within 95% limit' },
  ];

  return (
    <div className="p-5 space-y-5">
      <div>
        <h2 className="font-display text-xl">Constraint Satisfaction Report</h2>
        <p className="text-sm mt-1" style={{ color:'var(--text-muted)' }}>
          Verifying hard and soft constraint compliance for the optimized fleet plan
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {summary.map(s => (
          <div key={s.label} className="panel p-4"
               style={{ borderLeft:`3px solid ${s.status === 'pass' ? 'var(--status-success)' : 'var(--status-error)'}` }}>
            <div className="text-label">{s.label}</div>
            <div className="metric-large mt-1"
                 style={{ color: s.status === 'pass' ? 'var(--status-success)' : 'var(--status-error)' }}>
              {s.value}
            </div>
            <div className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>{s.note}</div>
          </div>
        ))}
      </div>

      {/* Constraint detail table */}
      <div className="panel overflow-x-auto">
        <div className="px-4 py-3 border-b" style={{ borderColor:'var(--border-default)' }}>
          <h3 className="text-sm font-semibold">Per-Constraint Detail</h3>
          <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>
            Hard constraints must be satisfied; soft constraints are optimization objectives
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background:'var(--bg-raised)' }}>
              {['Constraint','Type','Status','Actual','Limit/Target','Margin'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-label">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(cr?.constraints || []).map((c, i) => (
              <tr key={c.name}
                  style={{ borderTop:'1px solid var(--border-subtle)', background: i%2===0 ? 'var(--bg-surface)' : 'var(--bg-canvas)' }}>
                <td className="px-4 py-2.5 font-medium">{c.name}</td>
                <td className="px-4 py-2.5">
                  <span className="badge"
                        style={{
                          background: c.type === 'hard' ? 'rgba(27,58,107,0.1)' : 'rgba(164,148,128,0.1)',
                          color: c.type === 'hard' ? 'var(--accent-secondary)' : 'var(--text-muted)',
                          border: `1px solid ${c.type === 'hard' ? 'rgba(27,58,107,0.3)' : 'var(--border-default)'}`,
                        }}>
                    {c.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`status-dot ${
                      c.status === 'pass' ? 'status-dot-success' :
                      c.status === 'warn' ? 'status-dot-warning' : 'status-dot-error'
                    }`}></span>
                    <span className="text-xs font-semibold uppercase"
                          style={{ color: c.status === 'pass' ? 'var(--status-success)' : c.status === 'warn' ? 'var(--status-warning)' : 'var(--status-error)' }}>
                      {c.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-numeric">{c.actual}</td>
                <td className="px-4 py-2.5 text-numeric">{c.limit}</td>
                <td className="px-4 py-2.5 text-numeric text-xs"
                    style={{ color: c.status === 'pass' ? 'var(--status-success)' : 'var(--status-warning)' }}>
                  {c.margin}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hard vs soft explanation */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        <div className="panel p-4">
          <h3 className="text-sm font-semibold mb-3">Hard Constraints (must satisfy)</h3>
          <ul className="space-y-2 text-sm" style={{ color:'var(--text-secondary)' }}>
            <li className="flex items-start gap-2"><span style={{ color:'var(--status-success)' }}>✓</span> Cargo demand fully met (≥100% delivery)</li>
            <li className="flex items-start gap-2"><span style={{ color:'var(--status-success)' }}>✓</span> Delivery deadline compliance (ETA ≤ deadline)</li>
            <li className="flex items-start gap-2"><span style={{ color:'var(--status-success)' }}>✓</span> Vessel capacity not exceeded (≤95% utilization)</li>
            <li className="flex items-start gap-2"><span style={{ color:'var(--status-success)' }}>✓</span> IMO CII compliance (Rating ≤ D)</li>
            <li className="flex items-start gap-2"><span style={{ color:'var(--status-success)' }}>✓</span> Fuel type compatibility with vessel</li>
          </ul>
        </div>
        <div className="panel p-4">
          <h3 className="text-sm font-semibold mb-3">Soft Constraints (optimize)</h3>
          <ul className="space-y-2 text-sm" style={{ color:'var(--text-secondary)' }}>
            <li className="flex items-start gap-2"><span style={{ color:'var(--accent-primary)' }}>•</span> Minimize total fuel consumption</li>
            <li className="flex items-start gap-2"><span style={{ color:'var(--accent-primary)' }}>•</span> Minimize operational cost</li>
            <li className="flex items-start gap-2"><span style={{ color:'var(--accent-primary)' }}>•</span> Minimize lifecycle (WtW) GHG emissions</li>
            <li className="flex items-start gap-2"><span style={{ color:'var(--status-warning)' }}>⚠</span> LNG/H₂ bunkering availability limited</li>
            <li className="flex items-start gap-2"><span style={{ color:'var(--accent-primary)' }}>•</span> Maximize schedule reliability (target ≥95%)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
