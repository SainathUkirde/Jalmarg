// Pareto Decision Explorer
import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAppStore } from '../store/appStore';
import type { ParetoSolution } from '../types';

export default function ParetoView() {
  const { optimizationResult, selectedParetoSolution, selectParetoSolution, preferenceWeight, setPreferenceWeight, adoptPlan, setStep } = useAppStore();
  const solutions = optimizationResult?.pareto_solutions || [];
  const [xAxis, setXAxis] = useState<'total_cost_inr_lakh' | 'total_fuel_mt'>('total_cost_inr_lakh');
  const [yAxis, setYAxis] = useState<'total_co2_t' | 'schedule_reliability_pct'>('total_co2_t');

  // Preference-based recommendation
  const getScore = (sol: ParetoSolution) => {
    const costNorm = (sol.total_cost_inr_lakh - 40) / 20;
    const emNorm   = (sol.total_co2_t - 80) / 40;
    return (1 - preferenceWeight) * costNorm + preferenceWeight * emNorm;
  };

  const recommended = [...solutions].sort((a, b) => getScore(a) - getScore(b))[0];

  const scatterData = solutions.map(s => ({
    x: s[xAxis],
    y: s[yAxis],
    id: s.id,
    isSelected: s.id === selectedParetoSolution?.id,
    isRecommended: s.id === recommended?.id,
    sol: s,
  }));

  const AXIS_LABELS: Record<string, string> = {
    total_cost_inr_lakh: 'Cost (₹ Lakh)',
    total_fuel_mt: 'Fuel (MT)',
    total_co2_t: 'CO₂ (t)',
    schedule_reliability_pct: 'Reliability (%)',
  };

  const handleAdopt = () => {
    if (selectedParetoSolution && optimizationResult) {
      // Use the main fleet plan (in real system each pareto point would have its own)
      adoptPlan(optimizationResult.fleet_plan);
      setStep('copilot');
    }
  };

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl">Jalmarg Decision Explorer</h2>
          <p className="text-sm mt-1" style={{ color:'var(--text-muted)' }}>
            {solutions.length} feasible Pareto-optimal solutions · Cost vs Emissions trade-off
          </p>
        </div>
        <div className="flex gap-2">
          {selectedParetoSolution && (
            <button className="btn btn-navy" onClick={handleAdopt}>
              Adopt This Plan →
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => setStep('copilot')}>Copilot →</button>
        </div>
      </div>

      {/* Preference slider */}
      <div className="panel p-4">
        <h3 className="text-sm font-semibold mb-2">Preference: Cost ↔ Emissions</h3>
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium" style={{ color:'var(--status-warning)', minWidth:80 }}>Lower Cost</span>
          <div className="flex-1">
            <input
              type="range" min={0} max={1} step={0.05}
              value={preferenceWeight}
              onChange={e => setPreferenceWeight(parseFloat(e.target.value))}
              className="w-full"
              style={{ accentColor:'var(--accent-primary)' }}
            />
          </div>
          <span className="text-xs font-medium" style={{ color:'var(--status-success)', minWidth:100 }}>Lower Emissions</span>
        </div>
        <div className="text-xs mt-1 text-center" style={{ color:'var(--text-muted)' }}>
          Current weight: {Math.round(preferenceWeight * 100)}% emissions priority
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'16px', alignItems:'start' }}>
        {/* Scatter chart */}
        <div className="panel p-4">
          <div className="flex items-center gap-4 mb-3">
            <div>
              <label className="text-label block mb-1">X Axis</label>
              <select className="input select text-xs py-1"
                      value={xAxis}
                      onChange={e => setXAxis(e.target.value as typeof xAxis)}>
                <option value="total_cost_inr_lakh">Cost (₹L)</option>
                <option value="total_fuel_mt">Fuel (MT)</option>
              </select>
            </div>
            <div>
              <label className="text-label block mb-1">Y Axis</label>
              <select className="input select text-xs py-1"
                      value={yAxis}
                      onChange={e => setYAxis(e.target.value as typeof yAxis)}>
                <option value="total_co2_t">CO₂ (t)</option>
                <option value="schedule_reliability_pct">Reliability (%)</option>
              </select>
            </div>
            <div className="ml-auto flex items-center gap-3 text-xs" style={{ color:'var(--text-muted)' }}>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ background:'var(--accent-primary)', display:'inline-block' }}></span>
                Selected
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ background:'#f59e0b', display:'inline-block' }}></span>
                Recommended
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ background:'var(--border-strong)', display:'inline-block' }}></span>
                Other
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top:10, right:20, bottom:20, left:10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis
                type="number"
                dataKey="x"
                name={AXIS_LABELS[xAxis]}
                label={{ value: AXIS_LABELS[xAxis], position:'insideBottom', offset:-8, fontSize:11, fill:'var(--text-muted)' }}
                tick={{ fontSize:11, fill:'var(--text-muted)' }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={AXIS_LABELS[yAxis]}
                label={{ value: AXIS_LABELS[yAxis], angle:-90, position:'insideLeft', fontSize:11, fill:'var(--text-muted)' }}
                tick={{ fontSize:11, fill:'var(--text-muted)' }}
              />
              <Tooltip
                cursor={{ strokeDasharray:'3 3' }}
                content={({ active, payload }) => {
                  if (active && payload?.[0]) {
                    const d = (payload[0] as { payload: typeof scatterData[0] }).payload;
                    return (
                      <div className="tooltip-content">
                        <div className="font-semibold mb-1">Solution #{d.id}</div>
                        <div>Cost: ₹{d.sol.total_cost_inr_lakh.toFixed(1)}L</div>
                        <div>Fuel: {d.sol.total_fuel_mt.toFixed(1)} MT</div>
                        <div>CO₂: {d.sol.total_co2_t.toFixed(1)} t</div>
                        <div>Reliability: {d.sol.schedule_reliability_pct.toFixed(1)}%</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                data={scatterData}
                onClick={(data: unknown) => selectParetoSolution(((data as Record<string,unknown>)['id'] as number))}
              >
                {scatterData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.isSelected ? 'var(--accent-primary)'
                      : entry.isRecommended ? '#f59e0b'
                      : '#5585c7'
                    }
                    r={entry.isSelected ? 8 : entry.isRecommended ? 7 : 5}
                    strokeWidth={entry.isSelected ? 2 : 0}
                    stroke="white"
                    fillOpacity={entry.isSelected ? 1 : entry.isRecommended ? 0.9 : 0.5}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-xs mt-1 text-center" style={{ color:'var(--text-muted)' }}>
            Click a point to inspect solution · {solutions.length} non-dominated solutions
          </p>
        </div>

        {/* Detail panel */}
        <div className="space-y-3">
          {/* Recommended */}
          {recommended && (
            <div className="panel p-4" style={{ borderLeft:'3px solid #f59e0b' }}>
              <div className="text-label mb-2" style={{ color:'#f59e0b' }}>Recommended Solution</div>
              <div className="text-sm font-semibold">Solution #{recommended.id}</div>
              <div className="space-y-1 mt-2">
                {[
                  { l:'Cost',        v:`₹${recommended.total_cost_inr_lakh.toFixed(1)}L` },
                  { l:'Fuel',        v:`${recommended.total_fuel_mt.toFixed(1)} MT` },
                  { l:'CO₂',        v:`${recommended.total_co2_t.toFixed(1)} t` },
                  { l:'Reliability', v:`${recommended.schedule_reliability_pct.toFixed(1)}%` },
                ].map(item => (
                  <div key={item.l} className="flex justify-between text-sm">
                    <span style={{ color:'var(--text-muted)' }}>{item.l}</span>
                    <span className="text-numeric">{item.v}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => selectParetoSolution(recommended.id)} className="btn btn-secondary btn-sm w-full mt-3">
                Select This Solution
              </button>
            </div>
          )}

          {/* Selected */}
          {selectedParetoSolution && (
            <div className="panel p-4" style={{ borderLeft:'3px solid var(--accent-primary)' }}>
              <div className="text-label mb-2">Selected Solution #{selectedParetoSolution.id}</div>
              <div className="space-y-2 mt-1">
                {[
                  { l:'Cost',        v:`₹${selectedParetoSolution.total_cost_inr_lakh.toFixed(1)}L`, color:'var(--status-warning)' },
                  { l:'Fuel',        v:`${selectedParetoSolution.total_fuel_mt.toFixed(1)} MT`,       color:'var(--accent-primary)' },
                  { l:'CO₂',        v:`${selectedParetoSolution.total_co2_t.toFixed(1)} t`,          color:'var(--status-success)' },
                  { l:'Reliability', v:`${selectedParetoSolution.schedule_reliability_pct.toFixed(1)}%`, color:'var(--text-primary)' },
                ].map(item => (
                  <div key={item.l} className="flex justify-between items-center">
                    <span className="text-xs" style={{ color:'var(--text-muted)' }}>{item.l}</span>
                    <span className="text-numeric text-sm font-semibold" style={{ color:item.color }}>{item.v}</span>
                  </div>
                ))}
              </div>

              <hr className="divider my-3" />

              {/* Trade-off explanation */}
              <p className="text-xs" style={{ color:'var(--text-muted)' }}>
                This solution balances cost reduction with sustainability goals.
                Moving left on the Pareto front reduces costs but increases emissions;
                moving right reduces emissions at higher fuel/infrastructure cost.
              </p>

              <button onClick={handleAdopt} className="btn btn-navy w-full mt-3">
                Adopt This Plan
              </button>
            </div>
          )}

          {!selectedParetoSolution && (
            <div className="panel p-4 text-center">
              <div className="text-3xl mb-2 opacity-30">⊙</div>
              <div className="text-xs" style={{ color:'var(--text-muted)' }}>
                Click a solution on the chart to inspect
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
