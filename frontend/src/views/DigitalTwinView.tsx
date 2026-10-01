// Digital Twin Simulation — moving vessels on India map
import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import IndiaMap from '../components/map/IndiaMap';

const FUEL_COLORS: Record<string, string> = {
  HFO:'#ef4444', LNG:'#3b82f6', Methanol:'#8b5cf6', Hydrogen:'#10b981', MGO:'#f97316', Ammonia:'#f59e0b',
};

export default function DigitalTwinView() {
  const {
    simulationActive, simulationSpeed, simulationTick,
    setSimulationActive, setSimulationSpeed, tickSimulation,
    optimizationResult, focusedVessel, focusVessel, setStep
  } = useAppStore();
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (simulationActive) {
      tickRef.current = setInterval(() => tickSimulation(), 200 / simulationSpeed);
    } else {
      if (tickRef.current) clearInterval(tickRef.current);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [simulationActive, simulationSpeed]);

  const fleet = optimizationResult?.fleet_plan || [];
  const progress = (idx: number) => ((simulationTick * 0.003 + idx * 0.2) % 1);

  return (
    <div className="h-full flex flex-col" style={{ minHeight:'calc(100vh - 120px)' }}>
      {/* Control bar */}
      <div className="flex items-center gap-4 px-4 py-2.5 flex-shrink-0"
           style={{ background:'var(--bg-surface)', borderBottom:'1px solid var(--border-default)' }}>
        <h2 className="font-semibold text-sm">Digital Twin Fleet Simulation</h2>
        <div className="flex items-center gap-2 ml-auto">
          {/* Speed selector */}
          <div className="text-label">Speed:</div>
          {[1, 10, 60].map(s => (
            <button
              key={s}
              onClick={() => setSimulationSpeed(s)}
              className={`btn btn-sm ${simulationSpeed === s ? 'btn-primary' : 'btn-secondary'}`}
            >
              {s}×
            </button>
          ))}
          {/* Play/pause */}
          <button
            className={`btn ${simulationActive ? 'btn-secondary' : 'btn-navy'}`}
            onClick={() => setSimulationActive(!simulationActive)}
          >
            {simulationActive ? '⏸ Pause' : '▶ Resume'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setStep('explainability')}>
            Why? →
          </button>
        </div>
      </div>

      {/* Main layout: map + vessel list */}
      <div className="flex-1" style={{ display:'grid', gridTemplateColumns:'1fr 320px', minHeight:0 }}>
        {/* Map */}
        <div style={{ minHeight:400 }}>
          <IndiaMap interactive={true} showVessels={true} showRoutes={true} height="100%" />
        </div>

        {/* Vessel telemetry list */}
        <div className="overflow-y-auto" style={{ background:'var(--bg-surface)', borderLeft:'1px solid var(--border-default)' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor:'var(--border-default)' }}>
            <div className="text-label">Live Vessel Telemetry</div>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`status-dot ${simulationActive ? 'status-dot-success' : 'status-dot-warning'} ${simulationActive ? 'animate-pulse' : ''}`}></div>
              <span className="text-xs" style={{ color:'var(--text-muted)' }}>
                {simulationActive ? 'Simulation running' : 'Paused'}
                {simulationActive && ` · Tick ${simulationTick}`}
              </span>
            </div>
          </div>
          <div className="p-2 space-y-2">
            {fleet.map((vessel, idx) => {
              const prog = progress(idx);
              const isFocused = vessel.vessel_id === focusedVessel;
              const fuelColor = FUEL_COLORS[vessel.fuel_type] || '#888';
              const liveEta = vessel.eta_hours * (1 - prog);
              const liveFuel = vessel.fuel_mt * prog;
              const liveEmission = vessel.co2_t * prog;

              return (
                <button
                  key={vessel.vessel_id}
                  onClick={() => focusVessel(isFocused ? null : vessel.vessel_id)}
                  className="w-full text-left rounded p-3 border transition-all"
                  style={{
                    background: isFocused ? 'rgba(26,166,159,0.08)' : 'var(--bg-canvas)',
                    borderColor: isFocused ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm" style={{ color:'var(--text-primary)' }}>
                        {vessel.vessel_name}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>
                        {vessel.origin_port} → {vessel.destination_port}
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-xs font-semibold text-white flex-shrink-0"
                          style={{ background: fuelColor }}>
                      {vessel.fuel_type}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 w-full h-1 rounded-full" style={{ background:'var(--border-default)' }}>
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${prog * 100}%`,
                      background: 'var(--accent-primary)',
                    }} />
                  </div>

                  {/* Live metrics */}
                  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5">
                    {[
                      { l:'Speed',   v:`${vessel.assigned_speed_knots} kn` },
                      { l:'Load',    v:`${vessel.cargo_load_pct}%` },
                      { l:'ETA',     v:`${liveEta.toFixed(1)} h` },
                      { l:'Fuel',    v:`${liveFuel.toFixed(2)} MT` },
                      { l:'CO₂',    v:`${liveEmission.toFixed(2)} t` },
                      { l:'Route',   v:`${Math.round(prog * 100)}%` },
                    ].map(item => (
                      <div key={item.l} className="flex items-center justify-between">
                        <span className="text-label">{item.l}</span>
                        <span className="text-xs text-numeric" style={{ color:'var(--text-primary)' }}>{item.v}</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {fleet.length === 0 && (
            <div className="p-4 text-center text-sm" style={{ color:'var(--text-muted)' }}>
              Run optimization to populate fleet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
