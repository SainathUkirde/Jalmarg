// Fleet View
import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { VESSELS } from '../data/offlineData';

const FUEL_COLORS: Record<string, string> = {
  HFO:'#ef4444', MGO:'#f97316', LNG:'#3b82f6', Methanol:'#8b5cf6', Hydrogen:'#10b981', Ammonia:'#f59e0b', Shore_Power:'#14b8a6',
};

export default function FleetView() {
  const { optimizationResult, focusVessel, focusedVessel, setNav } = useAppStore();
  const [filter, setFilter] = useState('all');
  const fleet = optimizationResult?.fleet_plan || [];

  const types = [...new Set(VESSELS.map(v => v.vessel_type))];

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl">Fleet View</h2>
          <p className="text-sm mt-1" style={{ color:'var(--text-muted)' }}>
            {VESSELS.length} vessels in registry · {fleet.length} deployed
            <span className="badge badge-derived ml-2">DERIVED — DG Shipping 2022-23</span>
          </p>
        </div>
        <div className="flex gap-2">
          {['all', ...types].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="btn btn-sm"
              style={{
                background: filter === t ? 'var(--accent-primary)' : 'var(--bg-canvas)',
                color: filter === t ? 'white' : 'var(--text-muted)',
                borderColor: filter === t ? 'var(--accent-primary)' : 'var(--border-default)',
              }}
            >
              {t === 'all' ? 'All' : t.replace('_',' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Deployed vessels highlighted */}
      {fleet.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Currently Deployed ({fleet.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {fleet.map(v => (
              <button
                key={v.vessel_id}
                onClick={() => focusVessel(focusedVessel === v.vessel_id ? null : v.vessel_id)}
                className="panel p-4 text-left transition-all"
                style={{
                  borderColor: focusedVessel === v.vessel_id ? 'var(--accent-primary)' : 'var(--border-default)',
                  background: focusedVessel === v.vessel_id ? 'rgba(26,166,159,0.06)' : 'var(--bg-surface)',
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-semibold text-sm">{v.vessel_name}</div>
                  <span className="px-1.5 py-0.5 rounded text-xs font-bold text-white flex-shrink-0"
                        style={{ background: FUEL_COLORS[v.fuel_type] || '#888' }}>
                    {v.fuel_type}
                  </span>
                </div>
                <div className="text-xs space-y-0.5" style={{ color:'var(--text-muted)' }}>
                  <div>{v.origin_port} → {v.destination_port}</div>
                  <div>{v.assigned_speed_knots} kn · {v.cargo_load_pct}% load</div>
                  <div className="text-numeric" style={{ color:'var(--text-primary)' }}>
                    {v.fuel_mt.toFixed(1)} MT · ₹{v.cost_inr_lakh.toFixed(1)}L
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full registry */}
      <div className="panel overflow-x-auto">
        <div className="px-4 py-3 border-b" style={{ borderColor:'var(--border-default)' }}>
          <h3 className="text-sm font-semibold">Vessel Registry</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background:'var(--bg-raised)' }}>
              {['ID','Name','Type','DWT','Speed (kn)','Year','Operator','Fuel Compatibility','Home Port'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-label">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VESSELS.filter(v => filter === 'all' || v.vessel_type === filter).map((v, i) => (
              <tr key={v.vessel_id}
                  style={{ borderTop:'1px solid var(--border-subtle)', background: i%2===0 ? 'var(--bg-surface)' : 'var(--bg-canvas)' }}>
                <td className="px-3 py-2 text-numeric text-xs" style={{ color:'var(--text-muted)' }}>{v.vessel_id}</td>
                <td className="px-3 py-2 font-medium">{v.vessel_name}</td>
                <td className="px-3 py-2 text-xs capitalize">{v.vessel_type.replace('_',' ')}</td>
                <td className="px-3 py-2 text-numeric">{v.deadweight_tonnage.toLocaleString()}</td>
                <td className="px-3 py-2 text-numeric">{v.design_speed_knots}</td>
                <td className="px-3 py-2 text-numeric">{v.year_built}</td>
                <td className="px-3 py-2 text-xs">{v.operator}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {v.fuel_compatibility.map(f => (
                      <span key={f} className="px-1 py-0.5 rounded text-xs"
                            style={{ background:`${FUEL_COLORS[f]}22`, color:FUEL_COLORS[f], border:`1px solid ${FUEL_COLORS[f]}44` }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2 text-xs">{v.home_port}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
