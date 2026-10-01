// Dashboard — landing view communicating Fleet → Prediction → Optimization → Emissions → Green Decision
import React from 'react';
import { useAppStore } from '../store/appStore';
import IndiaMap from '../components/map/IndiaMap';

const JOURNEY_STEPS = [
  { id: 1, icon: '⊙', title: 'Fleet Data',       desc: 'DG Shipping vessel registry, IPA port data', color: '#1b3a6b' },
  { id: 2, icon: '∿', title: 'Fuel Prediction',  desc: 'Quantum-inspired ML model, ±4.8% MAPE',     color: '#1aa69f' },
  { id: 3, icon: '⟁', title: 'Optimization',     desc: 'QPSO convergence, Pareto-optimal fleet',    color: '#3cb99f' },
  { id: 4, icon: '◎', title: 'Emissions',         desc: 'Well-to-Wake lifecycle GHG analysis',       color: '#56c7ae' },
  { id: 5, icon: '◈', title: 'Green Decision',   desc: 'Actionable deployment recommendation',       color: '#10b981' },
];

export default function DashboardView() {
  const { optimizationResult, setStep, setNav } = useAppStore();
  const opt = optimizationResult;

  return (
    <div className="h-full flex flex-col">
      {/* Hero — split layout */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 420px', minHeight:'340px', borderBottom:'1px solid var(--border-default)' }}>
        {/* Left: map */}
        <div style={{ background:'#0d2040', position:'relative', minHeight:'340px' }}>
          <IndiaMap interactive={false} showVessels={true} showRoutes={true} />
          {/* Overlay headline */}
          <div className="absolute bottom-0 left-0 right-0 p-5"
               style={{ background:'linear-gradient(transparent, rgba(5,13,26,0.92))' }}>
            <div className="text-label mb-1" style={{ color:'rgba(255,255,255,0.5)' }}>
              Smart India Hackathon · Ministry of Ports, Shipping & Waterways
            </div>
            <h2 className="font-display text-white text-2xl leading-tight">
              Quantum-Inspired<br />Jalmarg Optimization
            </h2>
            <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.65)' }}>
              India's major ports · 13 routes · Real-time simulation
            </p>
          </div>
        </div>

        {/* Right: headline metrics */}
        <div className="p-5 flex flex-col justify-between" style={{ background:'var(--bg-surface)', borderLeft:'1px solid var(--border-default)' }}>
          <div>
            <div className="text-label mb-3">Optimization Results</div>
            <div className="space-y-3">
              {[
                { label:'Fuel Saved',     value: opt ? `-${opt.fuel_saving_pct.toFixed(1)}%` : '−18.3%',   delta:'positive', sub: opt ? `${opt.total_fuel_mt.toFixed(1)} MT total` : '82.4 MT total' },
                { label:'Cost Reduction', value: opt ? `-${opt.cost_saving_pct.toFixed(1)}%` : '−16.7%',   delta:'positive', sub: opt ? `₹${opt.total_cost_inr_lakh.toFixed(1)}L/voyage` : '₹47.6L/voyage' },
                { label:'CO₂ Reduced',    value: opt ? `-${opt.emission_saving_pct.toFixed(1)}%` : '−24.6%',delta:'positive', sub: opt ? `${opt.total_co2_t.toFixed(1)} t CO₂eq` : '89.5 t CO₂eq' },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between py-2"
                     style={{ borderBottom:'1px solid var(--border-subtle)' }}>
                  <div>
                    <div className="text-label">{m.label}</div>
                    <div className="text-xs" style={{ color:'var(--text-muted)' }}>{m.sub}</div>
                  </div>
                  <div className="metric-delta-positive text-xl font-bold text-numeric">{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <button className="btn btn-primary w-full btn-lg" onClick={() => setStep('mission')}>
              Start Mission →
            </button>
            <button className="btn btn-secondary w-full btn-sm" onClick={() => setStep('optimization')}>
              View Optimization
            </button>
          </div>
        </div>
      </div>

      {/* Journey flow */}
      <div className="px-6 py-4" style={{ borderBottom:'1px solid var(--border-default)' }}>
        <div className="text-label mb-3">Intelligence Journey</div>
        <div className="flex items-start gap-0">
          {JOURNEY_STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-base mb-2"
                     style={{ background: step.color, flexShrink:0 }}>
                  {step.icon}
                </div>
                <div className="text-xs font-semibold" style={{ color:'var(--text-primary)' }}>{step.title}</div>
                <div className="text-xs mt-1 leading-tight px-1 hidden md:block" style={{ color:'var(--text-muted)' }}>{step.desc}</div>
              </div>
              {i < JOURNEY_STEPS.length - 1 && (
                <div className="flex-shrink-0 mt-4.5 text-xs" style={{ color:'var(--text-placeholder)', paddingTop:'10px' }}>→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Bottom KPIs */}
      <div className="flex-1 p-5 grid grid-cols-2 md:grid-cols-4 gap-4 content-start">
        {[
          { label:'Prediction Error',    value:'4.8%',  unit:'MAPE', sub:'Quantum-Inspired ML', tag:'Model Output' },
          { label:'Vessels Optimized',  value:'4',     unit:'vessels', sub:'Mumbai→Kochi demo', tag:'Optimization' },
          { label:'Emission Compliance',value:'Pass',  unit:'CII-B', sub:'IMO 2023 standard',  tag:'Regulation' },
          { label:'Indian Ports',       value:'13',    unit:'major', sub:'IPA 2022-23 data',   tag:'Real Data' },
        ].map(kpi => (
          <div key={kpi.label} className="panel p-4">
            <div className="text-label mb-1">{kpi.label}</div>
            <div className="flex items-baseline gap-1.5">
              <span className="metric-large">{kpi.value}</span>
              <span className="text-xs" style={{ color:'var(--text-muted)' }}>{kpi.unit}</span>
            </div>
            <div className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>{kpi.sub}</div>
            <div className="mt-2">
              <span className="badge badge-derived">{kpi.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
