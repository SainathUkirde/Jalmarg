// Main app shell — layout orchestration
import React, { lazy, Suspense } from 'react';
import { useAppStore } from '../../store/appStore';
import Sidebar from './Sidebar';
import JourneyStepper from './JourneyStepper';
import TopBar from './TopBar';

// Lazy views
const DashboardView  = lazy(() => import('../../views/DashboardView'));
const MissionView    = lazy(() => import('../../views/MissionView'));
const PredictionView = lazy(() => import('../../views/PredictionView'));
const OptimizationView = lazy(() => import('../../views/OptimizationView'));
const DigitalTwinView  = lazy(() => import('../../views/DigitalTwinView'));
const ExplainView      = lazy(() => import('../../views/ExplainView'));
const RiskView         = lazy(() => import('../../views/RiskView'));
const WhatIfView       = lazy(() => import('../../views/WhatIfView'));
const ParetoView       = lazy(() => import('../../views/ParetoView'));
const CopilotView      = lazy(() => import('../../views/CopilotView'));
const ReportView       = lazy(() => import('../../views/ReportView'));
const FleetView        = lazy(() => import('../../views/FleetView'));
const AnalyticsView    = lazy(() => import('../../views/AnalyticsView'));
const BenchmarkView    = lazy(() => import('../../views/BenchmarkView'));
const ConstraintView   = lazy(() => import('../../views/ConstraintView'));
const DataSourcesView  = lazy(() => import('../../views/DataSourcesView'));

function ViewSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="skeleton h-8 w-64 rounded" />
      <div className="skeleton h-4 w-96 rounded" />
      <div className="skeleton h-48 w-full rounded" />
      <div className="grid grid-cols-3 gap-4">
        <div className="skeleton h-32 rounded" />
        <div className="skeleton h-32 rounded" />
        <div className="skeleton h-32 rounded" />
      </div>
    </div>
  );
}

export default function AppShell() {
  const { currentNav, currentStep, presentationMode, setPresentationMode } = useAppStore();

  // Determine which view to show based on nav section
  const mainView = () => {
    if (currentNav === 'fleet')        return <FleetView />;
    if (currentNav === 'analytics')    return <AnalyticsView />;
    if (currentNav === 'benchmarking') return <BenchmarkView />;
    if (currentNav === 'constraints')  return <ConstraintView />;
    if (currentNav === 'datasources')  return <DataSourcesView />;
    if (currentNav === 'report')       return <ReportView />;
    if (currentNav === 'optimization') return <OptimizationView />;

    // Main journey (dashboard nav)
    switch (currentStep) {
      case 'mission':        return <MissionView />;
      case 'prediction':     return <PredictionView />;
      case 'optimization':   return <OptimizationView />;
      case 'digital_twin':   return <DigitalTwinView />;
      case 'explainability': return <ExplainView />;
      case 'risk':           return <RiskView />;
      case 'whatif':         return <WhatIfView />;
      case 'pareto':         return <ParetoView />;
      case 'copilot':        return <CopilotView />;
      case 'report':         return <ReportView />;
      default:               return <DashboardView />;
    }
  };

  if (presentationMode) {
    return (
      <div className="h-screen w-screen overflow-hidden" style={{ background: 'var(--bg-canvas)' }}>
        {/* Floating back button */}
        <button
          onClick={() => setPresentationMode(false)}
          style={{
            position: 'fixed',
            bottom: '14px',
            left: '14px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-default)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
          title="Exit presentation mode"
        >
          ← Back
        </button>
        <Suspense fallback={<ViewSkeleton />}>
          {mainView()}
        </Suspense>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-canvas)' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <JourneyStepper />
        <main className="flex-1 overflow-y-auto" role="main">
          <Suspense fallback={<ViewSkeleton />}>
            {mainView()}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
