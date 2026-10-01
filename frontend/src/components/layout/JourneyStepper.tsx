// Journey stepper — runs across the top of the main content area
import React from 'react';
import { useAppStore } from '../../store/appStore';
import type { AppStep } from '../../types';

const STEPS: { id: AppStep; short: string; label: string }[] = [
  { id: 'mission',       short: '1', label: 'Mission' },
  { id: 'prediction',    short: '2', label: 'Predict' },
  { id: 'optimization',  short: '3', label: 'Optimize' },
  { id: 'digital_twin',  short: '4', label: 'Twin' },
  { id: 'explainability',short: '5', label: 'Why?' },
  { id: 'risk',          short: '6', label: 'Risk' },
  { id: 'whatif',        short: '7', label: 'What-If' },
  { id: 'pareto',        short: '8', label: 'Pareto' },
  { id: 'copilot',       short: '9', label: 'Copilot' },
  { id: 'report',        short: '10', label: 'Report' },
];

export default function JourneyStepper() {
  const { currentStep, completedSteps, setStep } = useAppStore();

  return (
    <div
      className="flex items-center px-4 py-2 overflow-x-auto"
      style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}
      role="navigation"
      aria-label="Journey steps"
    >
      {STEPS.map((step, i) => {
        const isActive = currentStep === step.id;
        const isDone = completedSteps.includes(step.id) && !isActive;
        const isClickable = isDone || isActive;

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => isClickable && setStep(step.id)}
              disabled={!isClickable}
              className="stepper-item flex-shrink-0 group"
              aria-current={isActive ? 'step' : undefined}
              title={step.label}
            >
              <div className={`stepper-circle ${isActive ? 'active' : isDone ? 'completed' : ''}`}>
                {isDone ? '✓' : step.short}
              </div>
              <span
                className="text-xs hidden md:block whitespace-nowrap"
                style={{ color: isActive ? 'var(--accent-primary)' : isDone ? 'var(--status-success)' : 'var(--text-muted)' }}
              >
                {step.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`stepper-line ${isDone ? 'completed' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
