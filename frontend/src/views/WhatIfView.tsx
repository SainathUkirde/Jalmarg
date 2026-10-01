// What-If Green Switch Simulator
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../store/appStore';
import { FUELS } from '../data/offlineData';
import type { FuelType, WeatherScenario, WhatIfScenario } from '../types';

const FUEL_TYPES: FuelType[] = ['HFO','MGO','LNG','Methanol','Hydrogen','Ammonia'];

const DELTA_COLOR = (v: number) => v < 0 ? 'var(--status-success)' : v > 0 ? 'var(--status-error)' : 'var(--text-muted)';
const DELTA_PREFIX = (v: number) => v > 0 ? '+' : '';

export default function WhatIfView() {
  const { activeWhatIf, whatIfScenarios, runWhatIf, optimizationResult, setStep } = useAppStore();
  const baseline = optimizationResult;
  const [fuel, setFuel] = useState<FuelType>('Methanol');
  const [speedDelta, setSpeedDelta] = useState(0);
  const [cargoDelta, setCargoDelta] = useState(0);
  const [weather, setWeather] = useState<WeatherScenario>('moderate');
  const [shorePower, setShorePower] = useState(false);
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    const scenario: WhatIfScenario = {
      id: `wi-${Date.now()}`,
      name: `${fuel} · ${speedDelta > 0 ? '+' : ''}${speedDelta}kn · ${cargoDelta > 0 ? '+' : ''}${cargoDelta}% cargo`,
      fuel_type: fuel,
      speed_delta_knots: speedDelta,
      cargo_delta_pct: cargoDelta,
      weather_scenario: weather,
      shore_power: shorePower,
      fleet_size_delta: 0,
    };
    await runWhatIf(scenario);
    setRunning(false);
  };

  const result = activeWhatIf?.result;
  const compareData = result && baseline ? [
    {
      metric: 'Fuel (MT)',
      Current: parseFloat(baseline.total_fuel_mt.toFixed(1)),
      WhatIf:  parseFloat((baseline.total_fuel_mt * (1 + result.fuel_mt_delta_pct/100)).toFixed(1)),
    },
    {
      metric: 'Cost (₹L)',
      Current: parseFloat(baseline.total_cost_inr_lakh.toFixed(1)),
      WhatIf:  parseFloat((baseline.total_cost_inr_lakh * (1 + result.cost_delta_pct/100)).toFixed(1)),
    },
    {
      metric: 'CO₂ (t)',
      Current: parseFloat(baseline.total_co2_t.toFixed(1)),
      WhatIf:  parseFloat((baseline.total_co2_t * (1 + result.co2_delta_pct/100)).toFixed(1)),
    },
  ] : [];

  const fuelData = FUELS.find(f => f.fuel_type === fuel);

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl">What-If Green Switch Simulator</h2>
          <p className="text-sm mt-1" style={{ color:'var(--text-muted)' }}>
            Instantly recalculate any fleet variable and compare outcomes
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setStep('pareto')}>Pareto →</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:'20px', alignItems:'start' }}>
        {/* Controls */}
        <div className="space-y-4">
          <div className="panel p-4 space-y-4">
            <h3 className="text-sm font-semibold">Configure Scenario</h3>

            {/* Fuel selector */}
            <div>
              <label className="text-label block mb-2">Fuel Type</label>
              <div className="grid grid-cols-2 gap-1.5">
                {FUEL_TYPES.map(f => {
                  const fd = FUELS.find(fd => fd.fuel_type === f);
                  return (
                    <button
                      key={f}
                      onClick={() => setFuel(f)}
                      className="px-2 py-2 rounded border text-left text-xs transition-all"
                      style={{
                        background: fuel === f ? 'rgba(26,166,159,0.1)' : 'var(--bg-canvas)',
                        borderColor: fuel === f ? 'var(--accent-primary)' : 'var(--border-default)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <div className="font-semibold">{f}</div>
                      {fd && <div style={{ color:'var(--text-muted)' }}>₹{(fd.india_price_inr_per_mt/1000).toFixed(0)}k/MT</div>}
                    </button>
                  );
                })}
              </div>
              {fuelData?.india_price_is_projected && (
                <p className="text-xs mt-1" style={{ color:'var(--status-warning)' }}>
                  * IEA 2030 projected price — not current market
                </p>
              )}
            </div>

            {/* Speed delta */}
            <div>
              <label className="text-label block mb-1">Speed Adjustment: {speedDelta > 0 ? '+' : ''}{speedDelta} kn</label>
              <input
                type="range" min={-5} max={5} step={0.5}
                value={speedDelta}
                onChange={e => setSpeedDelta(parseFloat(e.target.value))}
                className="w-full"
                style={{ accentColor:'var(--accent-primary)' }}
              />
              <div className="flex justify-between text-xs" style={{ color:'var(--text-muted)' }}>
                <span>−5 kn (slow)</span><span>0</span><span>+5 kn (fast)</span>
              </div>
            </div>

            {/* Cargo delta */}
            <div>
              <label className="text-label block mb-1">Cargo Demand: {cargoDelta > 0 ? '+' : ''}{cargoDelta}%</label>
              <input
                type="range" min={-30} max={30} step={5}
                value={cargoDelta}
                onChange={e => setCargoDelta(parseInt(e.target.value))}
                className="w-full"
                style={{ accentColor:'var(--accent-primary)' }}
              />
              <div className="flex justify-between text-xs" style={{ color:'var(--text-muted)' }}>
                <span>−30%</span><span>0</span><span>+30%</span>
              </div>
            </div>

            {/* Weather */}
            <div>
              <label className="text-label block mb-1">Weather</label>
              <select
                className="input select"
                value={weather}
                onChange={e => setWeather(e.target.value as WeatherScenario)}
              >
                <option value="calm">Calm (0.3–0.8m waves)</option>
                <option value="moderate">Moderate (0.8–2.0m)</option>
                <option value="rough">Rough (2.0–3.5m)</option>
                <option value="monsoon">Monsoon (3.0–5.0m)</option>
              </select>
            </div>

            {/* Shore power */}
            <div className="flex items-center justify-between">
              <label className="text-label">Shore Power at Berth</label>
              <button
                onClick={() => setShorePower(!shorePower)}
                className={`btn btn-sm ${shorePower ? 'btn-primary' : 'btn-secondary'}`}
              >
                {shorePower ? 'ON' : 'OFF'}
              </button>
            </div>

            <button
              onClick={handleRun}
              disabled={running}
              className="btn btn-navy w-full"
            >
              {running ? '⏳ Running…' : '▶ Run What-If Simulation'}
            </button>
          </div>

          {/* Saved scenarios */}
          {whatIfScenarios.length > 0 && (
            <div className="panel p-3">
              <div className="text-label mb-2">Saved Scenarios ({whatIfScenarios.length})</div>
              <div className="space-y-1">
                {whatIfScenarios.slice(0,5).map(s => (
                  <div key={s.id} className="flex items-center gap-2 text-xs py-1"
                       style={{ borderBottom:'1px solid var(--border-subtle)' }}>
                    <span className="truncate flex-1">{s.name}</span>
                    {s.result && (
                      <span style={{ color: s.result.co2_delta_pct < 0 ? 'var(--status-success)' : 'var(--status-error)' }}>
                        {DELTA_PREFIX(s.result.co2_delta_pct)}{s.result.co2_delta_pct.toFixed(1)}% CO₂
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* Comparison table */}
              <div className="panel">
                <div className="px-4 py-3 border-b flex items-center justify-between"
                     style={{ borderColor:'var(--border-default)' }}>
                  <h3 className="text-sm font-semibold">Current vs What-If: {activeWhatIf?.name}</h3>
                  <span className="badge badge-derived">Scenario Result</span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background:'var(--bg-raised)' }}>
                      {['Metric','Current','What-If','Delta','Assessment'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-label">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { metric:'Fuel Consumption', cur:`${baseline?.total_fuel_mt.toFixed(1)} MT`, wi:`${((baseline?.total_fuel_mt ?? 0)*(1+result.fuel_mt_delta_pct/100)).toFixed(1)} MT`, delta:result.fuel_mt_delta_pct, note: result.fuel_mt_delta_pct < -10 ? 'Significant reduction' : 'Marginal' },
                      { metric:'Operating Cost',   cur:`₹${baseline?.total_cost_inr_lakh.toFixed(1)}L`, wi:`₹${((baseline?.total_cost_inr_lakh ?? 0)*(1+result.cost_delta_pct/100)).toFixed(1)}L`, delta:result.cost_delta_pct, note: result.cost_delta_pct < -20 ? 'Major saving' : 'Minor' },
                      { metric:'GHG Emissions',    cur:`${baseline?.total_co2_t.toFixed(1)} t`, wi:`${((baseline?.total_co2_t ?? 0)*(1+result.co2_delta_pct/100)).toFixed(1)} t`, delta:result.co2_delta_pct, note: result.co2_delta_pct < -15 ? 'Green improvement' : '' },
                      { metric:'Travel Time',      cur:`${baseline?.total_travel_hours.toFixed(1)} h`, wi:`${((baseline?.total_travel_hours ?? 0)*(1+result.travel_hours_delta_pct/100)).toFixed(1)} h`, delta:result.travel_hours_delta_pct, note: result.travel_hours_delta_pct > 5 ? 'Check deadline' : 'OK' },
                      { metric:'Reliability',      cur:'—', wi:`${result.reliability_pct.toFixed(1)}%`, delta:0, note: result.reliability_pct > 95 ? 'High' : 'Moderate' },
                    ].map(row => (
                      <tr key={row.metric} style={{ borderTop:'1px solid var(--border-subtle)' }}>
                        <td className="px-4 py-2.5 font-medium">{row.metric}</td>
                        <td className="px-4 py-2.5 text-numeric">{row.cur}</td>
                        <td className="px-4 py-2.5 text-numeric font-semibold">{row.wi}</td>
                        <td className="px-4 py-2.5">
                          <span className="text-numeric font-semibold" style={{ color:DELTA_COLOR(row.delta) }}>
                            {row.delta === 0 ? '—' : `${DELTA_PREFIX(row.delta)}${row.delta.toFixed(1)}%`}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs" style={{ color:'var(--text-muted)' }}>{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bar comparison chart */}
              <div className="panel p-4">
                <h3 className="text-sm font-semibold mb-3">Side-by-Side Comparison</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={compareData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="metric" tick={{ fontSize:11, fill:'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} />
                    <Tooltip
                      contentStyle={{ background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:4, fontSize:12 }}
                    />
                    <Legend wrapperStyle={{ fontSize:11 }} />
                    <Bar dataKey="Current" name="Current" fill="#f59e0b" radius={[2,2,0,0]} />
                    <Bar dataKey="WhatIf"  name={`What-If: ${fuel}`} fill="#1aa69f" radius={[2,2,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Plain language */}
              <div className="panel p-4" style={{ borderLeft:'3px solid var(--accent-primary)' }}>
                <h3 className="text-sm font-semibold mb-1">Trade-Off Analysis</h3>
                <p className="text-sm" style={{ color:'var(--text-secondary)' }}>
                  Switching to <strong>{fuel}</strong> {result.cost_delta_pct < 0 ? `reduces cost by ${Math.abs(result.cost_delta_pct).toFixed(1)}%` : `increases cost by ${result.cost_delta_pct.toFixed(1)}%`}
                  {' '}and {result.co2_delta_pct < 0 ? `cuts CO₂ emissions by ${Math.abs(result.co2_delta_pct).toFixed(1)}%` : `increases emissions by ${result.co2_delta_pct.toFixed(1)}%`}.
                  {result.reliability_pct < 95 ? ' ⚠ Reliability drops below 95% — check deadline constraints.' : ' Schedule reliability remains within operational bounds.'}
                  {fuel === 'Hydrogen' || fuel === 'Ammonia' ? ' Note: India infrastructure is at pilot/research stage only.' : ''}
                </p>
              </div>
            </>
          ) : (
            <div className="panel p-8 text-center">
              <div className="text-4xl mb-3" style={{ opacity:0.3 }}>⟁</div>
              <div className="text-sm font-medium" style={{ color:'var(--text-muted)' }}>
                Configure a scenario and run the simulation
              </div>
              <div className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>
                Results update instantly based on the physics model
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
