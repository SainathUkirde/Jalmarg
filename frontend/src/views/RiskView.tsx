// Risk & Early-Warning Engine view
import React from 'react';
import { useAppStore } from '../store/appStore';
import type { RiskAlert } from '../types';

const SEVERITY_ICONS: Record<string, string> = { info:'ℹ', warning:'⚠', critical:'⛔' };
const SEVERITY_CLASSES: Record<string, string> = {
  info:'risk-alert-info', warning:'risk-alert-warning', critical:'risk-alert-critical'
};

function RiskCard({ alert, onAcknowledge, onDismiss }: {
  alert: RiskAlert;
  onAcknowledge: () => void;
  onDismiss: () => void;
}) {
  const { runWhatIf, mission } = useAppStore();

  const handleAction = (action: string) => {
    if (action.includes('speed') || action.includes('Optimize')) {
      runWhatIf({
        id: `wi-${Date.now()}`,
        name: 'Speed Reduction (Risk Response)',
        fuel_type: 'LNG',
        speed_delta_knots: -2,
        cargo_delta_pct: 0,
        weather_scenario: 'moderate',
        shore_power: false,
        fleet_size_delta: 0,
      });
    }
  };

  return (
    <div className={`risk-alert ${SEVERITY_CLASSES[alert.severity]} ${alert.acknowledged ? 'opacity-50' : ''}`}>
      <div className="flex-shrink-0 text-lg mt-0.5">{SEVERITY_ICONS[alert.severity]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-semibold" style={{ color:'var(--text-primary)' }}>{alert.title}</div>
            {alert.vessel_id && (
              <div className="text-xs mt-0.5 font-mono" style={{ color:'var(--text-muted)' }}>
                Vessel: {alert.vessel_id}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="badge" style={{
              background: alert.severity === 'critical' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
              color: alert.severity === 'critical' ? 'var(--status-error)' : 'var(--status-warning)',
              border: `1px solid ${alert.severity === 'critical' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
            }}>
              {alert.severity.toUpperCase()}
            </span>
          </div>
        </div>
        <p className="text-sm mt-1" style={{ color:'var(--text-secondary)' }}>{alert.message}</p>

        {/* Impact metrics */}
        {(alert.fuel_impact_pct !== undefined || alert.eta_impact_h !== undefined) && (
          <div className="flex gap-3 mt-2">
            {alert.fuel_impact_pct !== 0 && alert.fuel_impact_pct !== undefined && (
              <div className="text-xs px-2 py-0.5 rounded" style={{ background:'rgba(245,158,11,0.1)', color:'var(--status-warning)' }}>
                Fuel impact: +{alert.fuel_impact_pct}%
              </div>
            )}
            {alert.eta_impact_h !== 0 && alert.eta_impact_h !== undefined && (
              <div className="text-xs px-2 py-0.5 rounded" style={{ background:'rgba(245,158,11,0.1)', color:'var(--status-warning)' }}>
                ETA impact: +{alert.eta_impact_h.toFixed(1)}h
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {alert.suggested_actions.slice(0,3).map((action, i) => (
            <button
              key={i}
              onClick={() => handleAction(action)}
              className="btn btn-sm btn-secondary"
            >
              {action}
            </button>
          ))}
          {!alert.acknowledged && (
            <button onClick={onAcknowledge} className="btn btn-sm btn-ghost">
              Acknowledge
            </button>
          )}
          <button onClick={onDismiss} className="btn btn-sm btn-ghost" style={{ color:'var(--text-muted)' }}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RiskView() {
  const { risks, acknowledgeRisk, dismissRisk, setStep } = useAppStore();
  const activeRisks = risks.filter(r => !r.acknowledged);
  const acknowledgedRisks = risks.filter(r => r.acknowledged);

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl">Risk & Early-Warning Engine</h2>
          <p className="text-sm mt-1" style={{ color:'var(--text-muted)' }}>
            Real-time monitoring during fleet simulation
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setStep('whatif')}>What-If →</button>
      </div>

      {/* Risk summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Active Risks',      value: activeRisks.length,                         color:'var(--status-error)'   },
          { label:'Acknowledged',      value: acknowledgedRisks.length,                   color:'var(--status-warning)' },
          { label:'Simulation Status', value: activeRisks.length === 0 ? 'OK' : 'Watch', color: activeRisks.length === 0 ? 'var(--status-success)' : 'var(--status-warning)' },
        ].map(m => (
          <div key={m.label} className="panel p-4">
            <div className="text-label">{m.label}</div>
            <div className="metric-large mt-1" style={{ color:m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Risk categories */}
      <div className="grid grid-cols-5 gap-2">
        {['weather','schedule','fuel','capacity','emission'].map(type => {
          const count = risks.filter(r => r.type === type && !r.acknowledged).length;
          return (
            <div key={type} className="panel p-3 text-center">
              <div className="text-label capitalize">{type}</div>
              <div className="metric-medium mt-1" style={{ color: count > 0 ? 'var(--status-warning)' : 'var(--status-success)' }}>
                {count}
              </div>
              <div className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>alerts</div>
            </div>
          );
        })}
      </div>

      {/* Active alerts */}
      <div>
        <h3 className="text-sm font-semibold mb-3">
          Active Alerts <span className="text-numeric ml-1" style={{ color:'var(--status-error)' }}>({activeRisks.length})</span>
        </h3>
        {activeRisks.length === 0 ? (
          <div className="panel p-6 text-center">
            <div className="text-2xl mb-2">✓</div>
            <div className="text-sm font-medium" style={{ color:'var(--status-success)' }}>No active risk alerts</div>
            <div className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>Fleet is operating within safe parameters</div>
          </div>
        ) : (
          <div className="space-y-2">
            {activeRisks.map(r => (
              <RiskCard
                key={r.id}
                alert={r}
                onAcknowledge={() => acknowledgeRisk(r.id)}
                onDismiss={() => dismissRisk(r.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Acknowledged */}
      {acknowledgedRisks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2" style={{ color:'var(--text-muted)' }}>
            Acknowledged ({acknowledgedRisks.length})
          </h3>
          <div className="space-y-1.5">
            {acknowledgedRisks.map(r => (
              <div key={r.id} className="flex items-center gap-3 py-2 px-3 rounded opacity-50"
                   style={{ borderBottom:'1px solid var(--border-subtle)' }}>
                <span className="text-sm">{SEVERITY_ICONS[r.severity]}</span>
                <span className="text-sm">{r.title}</span>
                <span className="text-xs ml-auto" style={{ color:'var(--text-muted)' }}>Acknowledged</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk methodology */}
      <div className="panel p-4" style={{ background:'var(--bg-sunken)' }}>
        <h3 className="text-sm font-semibold mb-2">Risk Detection Methodology</h3>
        <div className="grid grid-cols-2 gap-3 text-xs" style={{ color:'var(--text-muted)' }}>
          <div><b style={{ color:'var(--text-primary)' }}>Weather Risk:</b> Wave height &gt; 2.5m triggers +X% fuel penalty (ITTC 78 approximation based on INCOIS climatology)</div>
          <div><b style={{ color:'var(--text-primary)' }}>Schedule Risk:</b> Projected ETA vs deadline with wave/speed uncertainty margin</div>
          <div><b style={{ color:'var(--text-primary)' }}>Fuel Risk:</b> Alternative fuel bunkering availability from port databases (DG Shipping)</div>
          <div><b style={{ color:'var(--text-primary)' }}>Emission Risk:</b> CII rating threshold monitoring (IMO 2023 regulation)</div>
        </div>
      </div>
    </div>
  );
}
