// Top bar — title, breadcrumb, connection indicator, presentation mode
import React from 'react';
import { useAppStore } from '../../store/appStore';

const STEP_TITLES: Record<string, string> = {
  mission: 'Mission Setup',
  prediction: 'Fuel Consumption Prediction',
  optimization: 'Quantum-Inspired Optimization',
  digital_twin: 'Digital Twin Simulation',
  explainability: 'Explainable Decisions',
  risk: 'Risk & Early-Warning Engine',
  whatif: 'What-If Green Switch Simulator',
  pareto: 'Jalmarg Decision Explorer',
  copilot: 'AI Fleet Copilot',
  report: 'Report & Download',
  dashboard: 'Dashboard',
  fleet: 'Fleet View',
  analytics: 'Analytics',
  benchmarking: 'Benchmarking',
  constraints: 'Constraint Report',
  datasources: 'Data Sources',
};

export default function TopBar() {
  const { currentStep, currentNav, backendLive, presentationMode, setPresentationMode, risks } = useAppStore();

  const title = STEP_TITLES[currentNav !== 'dashboard' ? currentNav : currentStep] || 'Jalmarg';
  const unacknowledgedRisks = risks.filter(r => !r.acknowledged).length;

  return (
    <header
      className="flex items-center justify-between px-4 lg:px-6 py-3 flex-shrink-0"
      style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}
    >
      {/* Title */}
      <div>
        <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Quantum-Inspired Jalmarg Optimization · India
        </p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Risk counter */}
        {unacknowledgedRisks > 0 && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold"
            style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--status-error)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <span className="status-dot status-dot-error"></span>
            {unacknowledgedRisks} risk{unacknowledgedRisks > 1 ? 's' : ''}
          </div>
        )}

        {/* Connection */}
        <div className={`connection-indicator ${backendLive ? 'connection-live' : 'connection-offline'}`}>
          <span className={`status-dot ${backendLive ? 'status-dot-success' : 'status-dot-warning'}`}></span>
          <span className="hidden sm:inline">{backendLive ? 'Live' : 'Offline'}</span>
        </div>

        {/* Presentation mode */}
        <button
          onClick={() => setPresentationMode(!presentationMode)}
          className="btn btn-sm btn-secondary"
          aria-label="Toggle presentation mode"
          title="Press F to toggle presentation mode"
        >
          <span>{presentationMode ? '✕' : '⊞'}</span>
          <span className="hidden md:inline">{presentationMode ? 'Exit' : 'Present'}</span>
        </button>
      </div>
    </header>
  );
}
