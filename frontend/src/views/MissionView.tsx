// Mission Setup — interactive India port selection, cargo/deadline inputs
import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { PORTS, VESSELS, FUELS } from '../data/offlineData';
import IndiaMap from '../components/map/IndiaMap';
import type { FuelType, WeatherScenario } from '../types';

const WEATHER_OPTIONS: { value: WeatherScenario; label: string; wave: string }[] = [
  { value:'calm',     label:'Calm',     wave:'0.3–0.8m' },
  { value:'moderate', label:'Moderate', wave:'0.8–2.0m' },
  { value:'rough',    label:'Rough',    wave:'2.0–3.5m' },
  { value:'monsoon',  label:'Monsoon',  wave:'3.0–5.0m' },
];

const FUEL_OPTIONS: FuelType[] = ['HFO','MGO','LNG','Methanol','Hydrogen','Ammonia'];

export default function MissionView() {
  const { mission, setMission, setStep, runPrediction, runOptimization } = useAppStore();
  const [managerMode, setManagerMode] = useState(false);
  const [managerInput, setManagerInput] = useState('Cargo = 5000 tons, Destination = Chennai, Deadline = 5 days');

  const handleManagerParse = () => {
    const cargoMatch = managerInput.match(/cargo\s*=\s*(\d+)/i);
    const destMatch  = managerInput.match(/destination\s*=\s*([A-Za-z\s]+?)(?:\s*,|$)/i);
    const daysMatch  = managerInput.match(/deadline\s*=\s*(\d+)\s*days?/i);
    const hoursMatch = managerInput.match(/deadline\s*=\s*(\d+)\s*h/i);

    if (cargoMatch) setMission({ cargo_tonnes: parseInt(cargoMatch[1]) });
    if (destMatch) {
      const portId = PORTS.find(p => p.name.toLowerCase().includes(destMatch[1].toLowerCase()))?.id;
      if (portId) setMission({ destination_port: portId });
    }
    if (daysMatch) setMission({ deadline_hours: parseInt(daysMatch[1]) * 24 });
    else if (hoursMatch) setMission({ deadline_hours: parseInt(hoursMatch[1]) });
  };

  const handleStart = async () => {
    await runPrediction();
    setStep('prediction');
  };

  const toggleFuel = (f: FuelType) => {
    const current = mission.fuel_options;
    const next = current.includes(f) ? current.filter(x => x !== f) : [...current, f];
    if (next.length > 0) setMission({ fuel_options: next });
  };

  const toggleVessel = (id: string) => {
    const current = mission.selected_vessels;
    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    if (next.length > 0) setMission({ selected_vessels: next });
  };

  const originPort = PORTS.find(p => p.id === mission.origin_port);
  const destPort   = PORTS.find(p => p.id === mission.destination_port);

  return (
    <div className="h-full" style={{ display:'grid', gridTemplateColumns:'1fr 360px' }}>
      {/* Map side */}
      <div className="relative" style={{ minHeight:'500px' }}>
        <IndiaMap
          interactive={true}
          showVessels={false}
          showRoutes={true}
          height="100%"
          onPortClick={(id) => {
            if (!mission.origin_port || mission.origin_port === id) {
              setMission({ origin_port: id });
            } else {
              setMission({ destination_port: id });
            }
          }}
        />
        {/* Selection overlay */}
        <div className="absolute top-3 left-3 right-3"
             style={{ pointerEvents:'none' }}>
          <div className="flex gap-2">
            <div className="px-3 py-1.5 rounded text-sm"
                 style={{ background:'rgba(10,22,40,0.85)', color:'white', border:'1px solid rgba(26,166,159,0.4)' }}>
              <span className="text-label" style={{ color:'rgba(255,255,255,0.5)' }}>FROM </span>
              <span className="font-semibold">{originPort?.name || 'Click a port'}</span>
            </div>
            <div className="text-white opacity-50 self-center">→</div>
            <div className="px-3 py-1.5 rounded text-sm"
                 style={{ background:'rgba(10,22,40,0.85)', color:'white', border:'1px solid rgba(52,100,168,0.4)' }}>
              <span className="text-label" style={{ color:'rgba(255,255,255,0.5)' }}>TO </span>
              <span className="font-semibold">{destPort?.name || 'Click a port'}</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 text-xs px-2 py-1 rounded"
             style={{ background:'rgba(10,22,40,0.7)', color:'rgba(255,255,255,0.5)' }}>
          Click ports to select route
        </div>
      </div>

      {/* Config panel */}
      <div className="overflow-y-auto p-4 space-y-4" style={{ background:'var(--bg-surface)', borderLeft:'1px solid var(--border-default)' }}>
        {/* Manager mode toggle */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg" style={{ color:'var(--text-primary)' }}>Mission Setup</h2>
          <button
            className={`btn btn-sm ${managerMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setManagerMode(!managerMode)}
          >
            {managerMode ? 'Form Mode' : 'Manager Mode'}
          </button>
        </div>

        {managerMode ? (
          <div>
            <label className="text-label block mb-1">Natural Language Input</label>
            <textarea
              className="input"
              rows={3}
              value={managerInput}
              onChange={e => setManagerInput(e.target.value)}
              placeholder="Cargo = 5000 tons, Destination = Chennai, Deadline = 5 days"
            />
            <button className="btn btn-secondary btn-sm mt-2" onClick={handleManagerParse}>
              Parse Input
            </button>
          </div>
        ) : null}

        <hr className="divider" />

        {/* Route */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-label block mb-1">Origin Port</label>
            <select
              className="input select"
              value={mission.origin_port}
              onChange={e => setMission({ origin_port: e.target.value })}
            >
              {PORTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-label block mb-1">Destination Port</label>
            <select
              className="input select"
              value={mission.destination_port}
              onChange={e => setMission({ destination_port: e.target.value })}
            >
              {PORTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        {/* Cargo & deadline */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-label block mb-1">Cargo (tonnes)</label>
            <input
              type="number"
              className="input"
              value={mission.cargo_tonnes}
              min={100}
              max={200000}
              onChange={e => setMission({ cargo_tonnes: parseInt(e.target.value) || 8000 })}
            />
          </div>
          <div>
            <label className="text-label block mb-1">Deadline (hours)</label>
            <input
              type="number"
              className="input"
              value={mission.deadline_hours}
              min={12}
              max={240}
              onChange={e => setMission({ deadline_hours: parseInt(e.target.value) || 72 })}
            />
          </div>
        </div>

        {/* Weather */}
        <div>
          <label className="text-label block mb-1">Weather Scenario</label>
          <div className="grid grid-cols-2 gap-1.5">
            {WEATHER_OPTIONS.map(w => (
              <button
                key={w.value}
                onClick={() => setMission({ weather_scenario: w.value })}
                className={`px-3 py-2 rounded border text-left text-sm transition-colors ${
                  mission.weather_scenario === w.value
                    ? 'border-teal-500' : ''
                }`}
                style={{
                  background: mission.weather_scenario === w.value ? 'rgba(26,166,159,0.1)' : 'var(--bg-canvas)',
                  borderColor: mission.weather_scenario === w.value ? 'var(--accent-primary)' : 'var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              >
                <div className="font-medium">{w.label}</div>
                <div className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>Wave: {w.wave}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Fuel options */}
        <div>
          <label className="text-label block mb-1">Available Fuels</label>
          <div className="flex flex-wrap gap-1.5">
            {FUEL_OPTIONS.map(f => {
              const fdata = FUELS.find(fd => fd.fuel_type === f);
              const selected = mission.fuel_options.includes(f);
              return (
                <button
                  key={f}
                  onClick={() => toggleFuel(f)}
                  className="px-2.5 py-1 rounded text-xs font-medium border transition-all"
                  style={{
                    background: selected ? 'rgba(26,166,159,0.15)' : 'var(--bg-canvas)',
                    borderColor: selected ? 'var(--accent-primary)' : 'var(--border-default)',
                    color: selected ? 'var(--text-accent)' : 'var(--text-muted)',
                  }}
                >
                  {f}
                  {fdata?.india_price_is_projected && ' *'}
                </button>
              );
            })}
          </div>
          <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>* IEA 2030 projected price</p>
        </div>

        {/* Vessel selection */}
        <div>
          <label className="text-label block mb-2">Fleet Available</label>
          <div className="space-y-1.5">
            {VESSELS.map(v => {
              const selected = mission.selected_vessels.includes(v.vessel_id);
              return (
                <button
                  key={v.vessel_id}
                  onClick={() => toggleVessel(v.vessel_id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded border text-left text-sm transition-all"
                  style={{
                    background: selected ? 'rgba(26,166,159,0.08)' : 'var(--bg-canvas)',
                    borderColor: selected ? 'var(--accent-primary)' : 'var(--border-default)',
                  }}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 text-xs`}
                       style={{
                         background: selected ? 'var(--accent-primary)' : 'transparent',
                         borderColor: selected ? 'var(--accent-primary)' : 'var(--border-default)',
                         color: 'white',
                       }}>
                    {selected && '✓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" style={{ color:'var(--text-primary)' }}>{v.vessel_name}</div>
                    <div className="text-xs" style={{ color:'var(--text-muted)' }}>
                      {v.vessel_type.replace('_', ' ')} · {v.deadweight_tonnage.toLocaleString()} DWT · {v.design_speed_knots} kn
                    </div>
                  </div>
                  <div className="text-xs" style={{ color:'var(--text-muted)' }}>{v.fuel_compatibility.join(', ')}</div>
                </button>
              );
            })}
          </div>
        </div>

        <hr className="divider" />

        {/* Start */}
        <button
          className="btn btn-primary w-full btn-lg"
          onClick={handleStart}
        >
          Run Prediction & Optimize →
        </button>
        <p className="text-xs text-center" style={{ color:'var(--text-muted)' }}>
          Default demo: Mumbai → Kochi · 8,000 t · 72h
        </p>
      </div>
    </div>
  );
}
