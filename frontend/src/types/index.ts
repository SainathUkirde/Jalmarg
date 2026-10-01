// ═══════════════════════════════════════════════
// Shared application types
// ═══════════════════════════════════════════════

export type VesselType =
  | 'bulk_carrier' | 'container_ship' | 'tanker'
  | 'general_cargo' | 'ro_ro' | 'passenger' | 'ferry';

export type FuelType =
  | 'HFO' | 'MGO' | 'LNG' | 'Methanol' | 'Hydrogen' | 'Ammonia' | 'Shore_Power';

export type WeatherScenario = 'calm' | 'moderate' | 'rough' | 'monsoon';

export type RiskSeverity = 'info' | 'warning' | 'critical';

export type DataStatus = 'real' | 'derived' | 'synthetic';

export interface Port {
  id: string;
  name: string;
  lat: number;
  lon: number;
  state: string;
  coast: 'west' | 'east' | 'island';
  traffic_mt_2022_23: number;
}

export interface Vessel {
  vessel_id: string;
  vessel_name: string;
  vessel_type: VesselType;
  flag_state: string;
  year_built: number;
  gross_tonnage: number;
  deadweight_tonnage: number;
  length_overall_m: number;
  engine_power_kw: number;
  design_speed_knots: number;
  fuel_compatibility: FuelType[];
  imo_number: string;
  capacity_teu: number;
  operator: string;
  home_port: string;
  shore_power_compatible: boolean;
}

export interface Route {
  route_id: string;
  origin_port: string;
  destination_port: string;
  distance_nm: number;
  typical_transit_hours: number;
  sea_lane: string;
  origin_lat: number;
  origin_lon: number;
  dest_lat: number;
  dest_lon: number;
  avg_wave_height_m: number;
  avg_wind_speed_knots: number;
  monsoon_factor: number;
}

export interface FuelEmission {
  fuel_type: FuelType;
  energy_density_mj_kg: number;
  tank_to_wake_co2_g_per_mj: number;
  well_to_wake_co2_g_per_mj: number;
  india_price_inr_per_mt: number;
  india_price_is_projected: boolean;
  imo_cii_pathway: string;
  india_availability: string;
  relative_cost_index: number;
}

// ─── Mission / Setup ────────────────────────────
export interface MissionConfig {
  origin_port: string;
  destination_port: string;
  cargo_tonnes: number;
  deadline_hours: number;
  fuel_options: FuelType[];
  weather_scenario: WeatherScenario;
  selected_vessels: string[];
}

// ─── Prediction ─────────────────────────────────
export interface PredictionInput {
  vessel_id: string;
  vessel_type: VesselType;
  capacity_dwt: number;
  speed_knots: number;
  cargo_load_pct: number;
  distance_nm: number;
  fuel_type: FuelType;
  wave_height_m: number;
}

export interface PredictionResult {
  vessel_id: string;
  vessel_name: string;
  fuel_type: FuelType;
  speed_knots: number;
  predicted_fuel_mt: number;
  predicted_fuel_cost_inr_lakh: number;
  predicted_co2_t: number;
  predicted_travel_hours: number;
  vessel_utilization_pct: number;
}

export interface PredictionResponse {
  baseline: PredictionResult[];
  model_metrics: { model: string; mae: number; rmse: number; mape: number; r2: number }[];
  speed_fuel_curve: { speed: number; fuel_mt: number }[];
}

// ─── Optimization ───────────────────────────────
export interface OptimizationResult {
  run_id: string;
  fleet_plan: FleetDeployment[];
  total_fuel_mt: number;
  total_cost_inr_lakh: number;
  total_co2_t: number;
  total_travel_hours: number;
  fuel_saving_pct: number;
  cost_saving_pct: number;
  emission_saving_pct: number;
  convergence_curve: { iteration: number; best_fitness: number }[];
  pareto_solutions: ParetoSolution[];
  constraint_report: ConstraintReport;
}

export interface FleetDeployment {
  vessel_id: string;
  vessel_name: string;
  vessel_type: VesselType;
  origin_port: string;
  destination_port: string;
  route_id: string;
  assigned_speed_knots: number;
  fuel_type: FuelType;
  cargo_load_pct: number;
  fuel_mt: number;
  cost_inr_lakh: number;
  co2_t: number;
  travel_hours: number;
  eta_hours: number;
  lat?: number;
  lon?: number;
  progress_pct?: number;
}

export interface ParetoSolution {
  id: number;
  total_cost_inr_lakh: number;
  total_fuel_mt: number;
  total_co2_t: number;
  schedule_reliability_pct: number;
  fleet_plan?: FleetDeployment[];
  selected?: boolean;
}

export interface ConstraintReport {
  cargo_demand_met_pct: number;
  schedule_compliance_pct: number;
  emission_compliance: boolean;
  capacity_utilization_pct: number;
  constraints: ConstraintItem[];
}

export interface ConstraintItem {
  name: string;
  type: 'hard' | 'soft';
  status: 'pass' | 'fail' | 'warn';
  actual: string;
  limit: string;
  margin: string;
}

// ─── Risk ────────────────────────────────────────
export interface RiskAlert {
  id: string;
  type: 'weather' | 'schedule' | 'fuel' | 'capacity' | 'emission';
  severity: RiskSeverity;
  title: string;
  message: string;
  vessel_id?: string;
  fuel_impact_pct?: number;
  eta_impact_h?: number;
  suggested_actions: string[];
  acknowledged: boolean;
  timestamp: number;
}

// ─── What-If ────────────────────────────────────
export interface WhatIfScenario {
  id: string;
  name: string;
  fuel_type: FuelType;
  speed_delta_knots: number;
  cargo_delta_pct: number;
  weather_scenario: WeatherScenario;
  shore_power: boolean;
  fleet_size_delta: number;
  result?: WhatIfResult;
}

export interface WhatIfResult {
  fuel_mt: number;
  fuel_mt_delta_pct: number;
  cost_inr_lakh: number;
  cost_delta_pct: number;
  co2_t: number;
  co2_delta_pct: number;
  travel_hours: number;
  travel_hours_delta_pct: number;
  reliability_pct: number;
}

// ─── Benchmark ──────────────────────────────────
export interface BenchmarkResult {
  model: string;
  category: 'prediction' | 'optimization';
  mae?: number;
  rmse?: number;
  mape?: number;
  r2?: number;
  convergence_speed?: number;
  solution_quality?: number;
  runtime_s?: number;
  scalability_score?: number;
}

// ─── Copilot ────────────────────────────────────
export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  actions?: CopilotAction[];
  data_sources?: string[];
  mini_chart?: { type: string; data: unknown };
}

export interface CopilotAction {
  id: string;
  label: string;
  action: 'runWhatIf' | 'runOptimization' | 'explainDecision' | 'compareFleet' | 'openPareto' | 'focusVessel';
  payload?: Record<string, unknown>;
}

// ─── App-wide step navigation ───────────────────
export type AppStep =
  | 'mission' | 'prediction' | 'optimization' | 'digital_twin'
  | 'explainability' | 'risk' | 'whatif' | 'pareto'
  | 'copilot' | 'report';

export type NavSection =
  | 'dashboard' | 'fleet' | 'analytics' | 'optimization'
  | 'benchmarking' | 'constraints' | 'datasources' | 'report';
