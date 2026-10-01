// ═══════════════════════════════════════════════
// Zustand global application state store
// ═══════════════════════════════════════════════

import { create } from 'zustand';
import type {
  AppStep, NavSection, MissionConfig, PredictionResponse, OptimizationResult,
  RiskAlert, WhatIfScenario, ParetoSolution, CopilotMessage, BenchmarkResult,
  FleetDeployment, WhatIfResult
} from '../types';
import {
  OFFLINE_PREDICTION, OFFLINE_OPTIMIZATION, OFFLINE_RISKS,
  OFFLINE_BENCHMARKS, OFFLINE_WHATIF_METHANOL, OFFLINE_WHATIF_HYDROGEN
} from '../data/offlineData';

// ─── API service ─────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
let isBackendLive = false;

async function checkBackend(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    isBackendLive = res.ok;
    return res.ok;
  } catch {
    isBackendLive = false;
    return false;
  }
}

async function apiCall<T>(path: string, body?: object): Promise<T> {
  if (!isBackendLive) throw new Error('offline');
  const res = await fetch(`${API_BASE}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ─── Store shape ──────────────────────────────────
interface AppState {
  // Connection
  backendLive: boolean;
  lastBackendCheck: number;
  checkConnection: () => Promise<void>;

  // Navigation
  currentStep: AppStep;
  currentNav: NavSection;
  completedSteps: AppStep[];
  presentationMode: boolean;
  setStep: (s: AppStep) => void;
  setNav: (n: NavSection) => void;
  setPresentationMode: (v: boolean) => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Mission
  mission: MissionConfig;
  setMission: (m: Partial<MissionConfig>) => void;

  // Prediction
  predictionResult: PredictionResponse | null;
  predictionLoading: boolean;
  runPrediction: () => Promise<void>;

  // Optimization
  optimizationResult: OptimizationResult | null;
  optimizationLoading: boolean;
  optimizationStage: number;
  runOptimization: () => Promise<void>;

  // Adopted plan (from Pareto)
  adoptedPlan: FleetDeployment[] | null;
  adoptPlan: (plan: FleetDeployment[]) => void;

  // Digital Twin simulation
  simulationActive: boolean;
  simulationSpeed: number;
  simulationTick: number;
  focusedVessel: string | null;
  setSimulationActive: (v: boolean) => void;
  setSimulationSpeed: (v: number) => void;
  tickSimulation: () => void;
  focusVessel: (id: string | null) => void;

  // Risk
  risks: RiskAlert[];
  acknowledgeRisk: (id: string) => void;
  dismissRisk: (id: string) => void;
  addRisk: (r: RiskAlert) => void;

  // What-If
  whatIfScenarios: WhatIfScenario[];
  activeWhatIf: WhatIfScenario | null;
  runWhatIf: (scenario: WhatIfScenario) => Promise<void>;
  addWhatIfScenario: (s: WhatIfScenario) => void;

  // Pareto
  selectedParetoSolution: ParetoSolution | null;
  selectParetoSolution: (id: number) => void;
  preferenceWeight: number; // 0=cost, 1=emissions
  setPreferenceWeight: (v: number) => void;

  // Copilot
  copilotMessages: CopilotMessage[];
  copilotLoading: boolean;
  sendCopilotMessage: (msg: string) => Promise<void>;
  clearCopilot: () => void;

  // Benchmarks
  benchmarks: BenchmarkResult[];
  benchmarkLoading: boolean;
  runBenchmarks: () => Promise<void>;

  // Report
  reportGenerating: boolean;
  generateReport: () => Promise<void>;
}

// ─── Default mission (demo) ───────────────────────
const DEFAULT_MISSION: MissionConfig = {
  origin_port: 'Mumbai',
  destination_port: 'Kochi',
  cargo_tonnes: 8000,
  deadline_hours: 72,
  fuel_options: ['LNG', 'Methanol', 'HFO', 'Hydrogen'],
  weather_scenario: 'moderate',
  selected_vessels: ['V001', 'V002', 'V004', 'V005'],
};

// ─── Copilot deterministic fallback ──────────────
function buildCopilotAnswer(msg: string, state: AppState): { content: string; actions: { id: string; label: string; action: 'runWhatIf' | 'runOptimization' | 'explainDecision' | 'compareFleet' | 'openPareto' | 'focusVessel'; payload?: Record<string, unknown> }[] } {
  const m = msg.toLowerCase();
  const opt = state.optimizationResult;
  const pred = state.predictionResult;

  if (m.includes('vessel') && (m.includes('assign') || m.includes('recommend'))) {
    const best = opt?.fleet_plan[0];
    return {
      content: best
        ? `Based on Optimization Run ${opt?.run_id}, I recommend **${best.vessel_name}** (${best.vessel_type}) for the ${best.origin_port}→${best.destination_port} route. It uses **${best.fuel_type}** at ${best.assigned_speed_knots} kn, consuming ${best.fuel_mt.toFixed(1)} MT fuel with ${best.co2_t.toFixed(1)} t CO₂.`
        : 'Run optimization first to get vessel recommendations.',
      actions: opt ? [{ id:'a1', label:'View Fleet Plan', action:'compareFleet' }] : [{ id:'a1', label:'Run Optimization', action:'runOptimization' }],
    };
  }
  if (m.includes('methanol')) {
    return {
      content: `Methanol offers **57% lower fuel cost** vs HFO (₹35,000/MT vs ₹52,000/MT) and **21.6% lower Well-to-Wake CO₂** (2.9 vs 3.7 gCO₂eq/MJ). Infrastructure is very limited in India currently. The What-If simulator shows fuel cost drops to ₹27.3 lakh vs current ₹47.6 lakh.`,
      actions: [{ id:'a1', label:'Run Methanol What-If', action:'runWhatIf', payload:{ fuel_type:'Methanol' } }],
    };
  }
  if (m.includes('ammonia') || m.includes('hydrogen')) {
    const fuel = m.includes('ammonia') ? 'Ammonia' : 'Hydrogen';
    return {
      content: `${fuel} is a **zero tank-to-wake emission** fuel. Well-to-Wake CO₂: ${fuel === 'Hydrogen' ? '0.6' : '1.2'} gCO₂eq/MJ. India price is **projected at 2030 levels** (IEA) — not current market. Availability: pilot/research stage only. Emissions reduction: ~${fuel === 'Hydrogen' ? '98%' : '76%'} vs HFO.`,
      actions: [{ id:'a1', label:`${fuel} Scenario`, action:'runWhatIf', payload:{ fuel_type:fuel } }],
    };
  }
  if (m.includes('cargo') && m.includes('20%')) {
    return {
      content: `A 20% cargo demand increase (to ${Math.round((state.mission.cargo_tonnes || 8000) * 1.2).toLocaleString()} t) would require deploying an additional vessel or increasing utilization above 90%. Projected fuel increase: +18–22%, cost increase: +17–20%. Schedule reliability may drop to ~89%.`,
      actions: [{ id:'a1', label:'Simulate +20% Cargo', action:'runWhatIf', payload:{ cargo_delta_pct:20 } }],
    };
  }
  if (m.includes('risk') && m.includes('vessel 04')) {
    const risk = state.risks.find(r => r.vessel_id === 'V004');
    return {
      content: risk
        ? `Vessel V004 (IN-BULK-004) has a **${risk.severity.toUpperCase()} risk**: ${risk.title}. ${risk.message} Suggested: ${risk.suggested_actions[0]}.`
        : 'No active risk alerts for Vessel 04.',
      actions: [{ id:'a1', label:'Focus Vessel 04', action:'focusVessel', payload:{ vessel_id:'V004' } }],
    };
  }
  if (m.includes('compare') || m.includes('optimized fleet')) {
    const savings = opt;
    return {
      content: savings
        ? `**Optimized vs Baseline:**\n- Fuel: ${savings.fuel_saving_pct.toFixed(1)}% reduction (${(savings.total_fuel_mt).toFixed(1)} MT vs ~${(savings.total_fuel_mt / (1 - savings.fuel_saving_pct/100)).toFixed(1)} MT)\n- Cost: ₹${savings.total_cost_inr_lakh.toFixed(1)} lakh (saved ₹${(savings.total_cost_inr_lakh * savings.cost_saving_pct / (100 - savings.cost_saving_pct)).toFixed(1)} lakh)\n- Emissions: ${savings.emission_saving_pct.toFixed(1)}% lower\n\nBased on: Optimization Run ${savings.run_id}.`
        : 'Run optimization to compare fleets.',
      actions: [{ id:'a1', label:'View Pareto', action:'openPareto' }],
    };
  }
  if (m.includes('pareto') || m.includes('explain')) {
    return {
      content: `The Pareto front shows **25 feasible solutions** trading off cost, fuel, and emissions. The selected solution (Solution #13) balances cost reduction (₹47.6L) with emission reduction (89.5 t CO₂). Moving toward lower cost increases emissions; moving toward zero emissions raises cost by ~70%. The preference slider helps you navigate this trade-off.`,
      actions: [{ id:'a1', label:'Open Pareto Explorer', action:'openPareto' }],
    };
  }
  if (m.includes('speed') && (m.includes('13') || m.includes('reduce'))) {
    return {
      content: `Reducing speed on V004 from ${pred?.baseline.find(b=>b.vessel_id==='V004')?.speed_knots || 14} kn to 13 kn: Fuel consumption reduces ~18% (cubic speed law). Travel time increases by ~3.1 hours. At 13 kn, ETA: ~67.9h vs 72h deadline — still within schedule. [Run Simulation] to verify.`,
      actions: [{ id:'a1', label:'Run Simulation', action:'runWhatIf', payload:{ vessel_id:'V004', speed_delta_knots:-1 } }],
    };
  }

  // Fallback
  return {
    content: `I'm your Jalmarg Copilot. I can answer questions about vessel assignments, fuel choices, optimization results, risk alerts, emissions, and scenarios. Try: "Why did the optimizer select LNG?" or "What if we switch to Methanol?"`,
    actions: [
      { id:'a1', label:'Run Optimization', action:'runOptimization' },
      { id:'a2', label:'Explain Decisions', action:'explainDecision' },
    ],
  };
}

// ─── Store implementation ─────────────────────────
export const useAppStore = create<AppState>((set, get) => ({
  // Connection
  backendLive: false,
  lastBackendCheck: 0,
  checkConnection: async () => {
    const live = await checkBackend();
    set({ backendLive: live, lastBackendCheck: Date.now() });
  },

  // Navigation
  currentStep: 'mission',
  currentNav: 'dashboard',
  completedSteps: [],
  presentationMode: false,
  setStep: (s) => {
    set(state => ({
      currentStep: s,
      completedSteps: state.completedSteps.includes(s)
        ? state.completedSteps
        : [...state.completedSteps, state.currentStep],
    }));
  },
  setNav: (n) => set({ currentNav: n }),
  setPresentationMode: (v) => set({ presentationMode: v }),

  // Theme
  theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  toggleTheme: () => set(state => {
    const next = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('theme', next);
    return { theme: next };
  }),

  // Mission
  mission: DEFAULT_MISSION,
  setMission: (m) => set(state => ({ mission: { ...state.mission, ...m } })),

  // Prediction
  predictionResult: OFFLINE_PREDICTION,
  predictionLoading: false,
  runPrediction: async () => {
    set({ predictionLoading: true });
    await new Promise(r => setTimeout(r, 800));
    try {
      const result = await apiCall<PredictionResponse>('/predict', get().mission);
      set({ predictionResult: result, predictionLoading: false });
    } catch {
      set({ predictionResult: OFFLINE_PREDICTION, predictionLoading: false });
    }
    set(s => ({ completedSteps: [...new Set([...s.completedSteps, 'prediction' as AppStep])] }));
  },

  // Optimization
  optimizationResult: OFFLINE_OPTIMIZATION,
  optimizationLoading: false,
  optimizationStage: 0,
  runOptimization: async () => {
    set({ optimizationLoading: true, optimizationStage: 0 });
    // Animate stages
    for (let stage = 0; stage <= 5; stage++) {
      await new Promise(r => setTimeout(r, 500 + Math.random() * 400));
      set({ optimizationStage: stage });
    }
    try {
      const result = await apiCall<OptimizationResult>('/optimize', get().mission);
      set({ optimizationResult: result, optimizationLoading: false });
    } catch {
      set({ optimizationResult: OFFLINE_OPTIMIZATION, optimizationLoading: false });
    }
    set(s => ({
      completedSteps: [...new Set([...s.completedSteps, 'optimization' as AppStep])],
      risks: OFFLINE_RISKS,
    }));
  },

  // Adopted plan
  adoptedPlan: null,
  adoptPlan: (plan) => set({ adoptedPlan: plan }),

  // Simulation
  simulationActive: false,
  simulationSpeed: 1,
  simulationTick: 0,
  focusedVessel: null,
  setSimulationActive: (v) => set({ simulationActive: v }),
  setSimulationSpeed: (v) => set({ simulationSpeed: v }),
  tickSimulation: () => set(s => ({ simulationTick: s.simulationTick + 1 })),
  focusVessel: (id) => set({ focusedVessel: id }),

  // Risk
  risks: OFFLINE_RISKS,
  acknowledgeRisk: (id) => set(s => ({
    risks: s.risks.map(r => r.id === id ? { ...r, acknowledged: true } : r),
  })),
  dismissRisk: (id) => set(s => ({ risks: s.risks.filter(r => r.id !== id) })),
  addRisk: (r) => set(s => ({ risks: [r, ...s.risks] })),

  // What-If
  whatIfScenarios: [],
  activeWhatIf: null,
  runWhatIf: async (scenario) => {
    set({ activeWhatIf: { ...scenario, result: undefined } });
    await new Promise(r => setTimeout(r, 600));
    let result: WhatIfResult;
    try {
      result = await apiCall<WhatIfResult>('/whatif', { ...get().mission, ...scenario });
    } catch {
      // Choose offline result based on fuel type
      result = scenario.fuel_type === 'Hydrogen' ? OFFLINE_WHATIF_HYDROGEN : OFFLINE_WHATIF_METHANOL;
    }
    const updated = { ...scenario, result };
    set(s => ({
      activeWhatIf: updated,
      whatIfScenarios: [updated, ...s.whatIfScenarios.filter(sc => sc.id !== scenario.id)],
    }));
  },
  addWhatIfScenario: (s) => set(st => ({ whatIfScenarios: [...st.whatIfScenarios, s] })),

  // Pareto
  selectedParetoSolution: OFFLINE_OPTIMIZATION.pareto_solutions.find(p => p.selected) || null,
  selectParetoSolution: (id) => {
    const sol = get().optimizationResult?.pareto_solutions.find(p => p.id === id);
    if (sol) set({ selectedParetoSolution: sol });
  },
  preferenceWeight: 0.5,
  setPreferenceWeight: (v) => set({ preferenceWeight: v }),

  // Copilot
  copilotMessages: [],
  copilotLoading: false,
  sendCopilotMessage: async (msg) => {
    const userMsg: CopilotMessage = {
      id: `m-${Date.now()}`,
      role: 'user',
      content: msg,
      timestamp: Date.now(),
    };
    set(s => ({ copilotMessages: [...s.copilotMessages, userMsg], copilotLoading: true }));
    await new Promise(r => setTimeout(r, 800 + Math.random() * 400));

    const state = get();
    let responseContent: string;
    let actions: CopilotMessage['actions'] = [];

    try {
      const result = await apiCall<{ content: string; actions: CopilotMessage['actions'] }>('/copilot', { message: msg, state: { mission: state.mission } });
      responseContent = result.content;
      actions = result.actions;
    } catch {
      const fallback = buildCopilotAnswer(msg, state);
      responseContent = fallback.content;
      actions = fallback.actions;
    }

    const assistantMsg: CopilotMessage = {
      id: `m-${Date.now()}-r`,
      role: 'assistant',
      content: responseContent,
      timestamp: Date.now(),
      actions,
      data_sources: ['Optimization Run', 'Prediction Model', 'Fleet Data', 'Fuel Emission DB'],
    };
    set(s => ({ copilotMessages: [...s.copilotMessages, assistantMsg], copilotLoading: false }));

    // Execute actions that mutate state
    for (const action of (actions || [])) {
      if (action.action === 'focusVessel' && action.payload?.vessel_id) {
        state.focusVessel(action.payload.vessel_id as string);
      }
    }
  },
  clearCopilot: () => set({ copilotMessages: [] }),

  // Benchmarks
  benchmarks: OFFLINE_BENCHMARKS,
  benchmarkLoading: false,
  runBenchmarks: async () => {
    set({ benchmarkLoading: true });
    await new Promise(r => setTimeout(r, 2000));
    try {
      const result = await apiCall<BenchmarkResult[]>('/benchmark');
      set({ benchmarks: result, benchmarkLoading: false });
    } catch {
      set({ benchmarks: OFFLINE_BENCHMARKS, benchmarkLoading: false });
    }
  },

  // Report
  reportGenerating: false,
  generateReport: async () => {
    set({ reportGenerating: true });
    await new Promise(r => setTimeout(r, 2500));
    try {
      await apiCall('/report/generate', { state: { mission: get().mission } });
    } catch {
      // Client-side PDF generation handled in ReportView component
    }
    set({ reportGenerating: false });
  },
}));

// ─── Initialize ───────────────────────────────────
// Apply saved theme
const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
if (savedTheme) {
  document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  useAppStore.setState({ theme: savedTheme });
} else {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', prefersDark);
  useAppStore.setState({ theme: prefersDark ? 'dark' : 'light' });
}

// Check backend on load
useAppStore.getState().checkConnection();
// Recheck every 30s
setInterval(() => useAppStore.getState().checkConnection(), 30000);
