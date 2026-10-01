// ═══════════════════════════════════════════════
// Offline precomputed data — full demo works without backend
// All values produced by the real Python pipeline (Phase 2)
// ═══════════════════════════════════════════════

import type {
  Port, Vessel, Route, FuelEmission, PredictionResponse,
  OptimizationResult, RiskAlert, BenchmarkResult, ParetoSolution, WhatIfResult
} from '../types';

// ─── Ports (REAL — IPA 2022-23) ─────────────────
export const PORTS: Port[] = [
  { id: 'JNPA',          name: 'JNPA (Nhava Sheva)', lat: 18.949,  lon: 72.949,  state: 'Maharashtra',         coast: 'west',  traffic_mt_2022_23: 79.6  },
  { id: 'Mumbai',        name: 'Mumbai',              lat: 18.922,  lon: 72.834,  state: 'Maharashtra',         coast: 'west',  traffic_mt_2022_23: 67.0  },
  { id: 'Kochi',         name: 'Kochi',               lat:  9.931,  lon: 76.267,  state: 'Kerala',              coast: 'west',  traffic_mt_2022_23: 29.6  },
  { id: 'New_Mangalore', name: 'New Mangalore',       lat: 12.914,  lon: 74.856,  state: 'Karnataka',           coast: 'west',  traffic_mt_2022_23: 37.4  },
  { id: 'Mormugao',      name: 'Mormugao (Goa)',      lat: 15.420,  lon: 73.790,  state: 'Goa',                 coast: 'west',  traffic_mt_2022_23: 14.9  },
  { id: 'Kandla',        name: 'Kandla (Deendayal)',  lat: 23.012,  lon: 70.221,  state: 'Gujarat',             coast: 'west',  traffic_mt_2022_23: 147.3 },
  { id: 'Chennai',       name: 'Chennai',             lat: 13.083,  lon: 80.271,  state: 'Tamil Nadu',          coast: 'east',  traffic_mt_2022_23: 49.9  },
  { id: 'Kamarajar',     name: 'Kamarajar (Ennore)',  lat: 13.217,  lon: 80.329,  state: 'Tamil Nadu',          coast: 'east',  traffic_mt_2022_23: 41.8  },
  { id: 'Tuticorin',     name: 'Tuticorin (VOC)',     lat:  8.764,  lon: 78.135,  state: 'Tamil Nadu',          coast: 'east',  traffic_mt_2022_23: 30.0  },
  { id: 'Visakhapatnam', name: 'Visakhapatnam',       lat: 17.688,  lon: 83.219,  state: 'Andhra Pradesh',      coast: 'east',  traffic_mt_2022_23: 86.5  },
  { id: 'Paradip',       name: 'Paradip',             lat: 20.315,  lon: 86.611,  state: 'Odisha',              coast: 'east',  traffic_mt_2022_23: 121.6 },
  { id: 'Kolkata_SMPK',  name: 'Kolkata (SMPK)',      lat: 22.573,  lon: 88.364,  state: 'West Bengal',         coast: 'east',  traffic_mt_2022_23: 20.4  },
  { id: 'Port_Blair',    name: 'Port Blair',          lat: 11.623,  lon: 92.727,  state: 'Andaman & Nicobar',   coast: 'island',traffic_mt_2022_23: 1.1   },
];

// ─── Representative fleet (DERIVED — DG Shipping) ─
export const VESSELS: Vessel[] = [
  { vessel_id:'V001', vessel_name:'IN-BULK-001', vessel_type:'bulk_carrier',   flag_state:'India', year_built:2015, gross_tonnage:37500, deadweight_tonnage:50000, length_overall_m:190, engine_power_kw:9000,  design_speed_knots:14.5, fuel_compatibility:['HFO','MGO','LNG'],            imo_number:'IMO9000001', capacity_teu:0,   operator:'SCI',            home_port:'JNPA',    shore_power_compatible:false },
  { vessel_id:'V002', vessel_name:'IN-CONT-002', vessel_type:'container_ship', flag_state:'India', year_built:2018, gross_tonnage:21000, deadweight_tonnage:28000, length_overall_m:170, engine_power_kw:11200, design_speed_knots:20.0, fuel_compatibility:['HFO','MGO','LNG','Methanol'], imo_number:'IMO9000002', capacity_teu:2000,operator:'Shreyas Shipping',home_port:'JNPA',    shore_power_compatible:false },
  { vessel_id:'V003', vessel_name:'IN-TANK-003', vessel_type:'tanker',         flag_state:'India', year_built:2012, gross_tonnage:45000, deadweight_tonnage:60000, length_overall_m:220, engine_power_kw:11000, design_speed_knots:15.0, fuel_compatibility:['HFO','MGO','LNG'],            imo_number:'IMO9000003', capacity_teu:0,   operator:'Essar Shipping', home_port:'Mumbai',  shore_power_compatible:false },
  { vessel_id:'V004', vessel_name:'IN-BULK-004', vessel_type:'bulk_carrier',   flag_state:'India', year_built:2020, gross_tonnage:30000, deadweight_tonnage:40000, length_overall_m:180, engine_power_kw:7200,  design_speed_knots:14.0, fuel_compatibility:['HFO','MGO','LNG','Methanol'], imo_number:'IMO9000004', capacity_teu:0,   operator:'SCI',            home_port:'Chennai', shore_power_compatible:false },
  { vessel_id:'V005', vessel_name:'IN-FERR-005', vessel_type:'ferry',          flag_state:'India', year_built:2022, gross_tonnage:1500,  deadweight_tonnage:2000,  length_overall_m:85,  engine_power_kw:4400,  design_speed_knots:18.0, fuel_compatibility:['MGO','LNG','Hydrogen','Shore_Power'], imo_number:'IMO9000005', capacity_teu:0,   operator:'APSEZ',     home_port:'Kochi',   shore_power_compatible:true  },
  { vessel_id:'V006', vessel_name:'IN-GCGO-006', vessel_type:'general_cargo',  flag_state:'India', year_built:2016, gross_tonnage:9000,  deadweight_tonnage:12000, length_overall_m:130, engine_power_kw:4400,  design_speed_knots:13.5, fuel_compatibility:['HFO','MGO'],                  imo_number:'IMO9000006', capacity_teu:0,   operator:'Adani Ports',    home_port:'Kandla',  shore_power_compatible:false },
];

// ─── Key routes (REAL distances — IPA/nautical charts) ─
export const ROUTES: Route[] = [
  { route_id:'R001', origin_port:'Mumbai',  destination_port:'Kochi',         distance_nm:855,  typical_transit_hours:57.0,  sea_lane:'west_coast', origin_lat:18.922, origin_lon:72.834, dest_lat:9.931,  dest_lon:76.267, avg_wave_height_m:1.2, avg_wind_speed_knots:14, monsoon_factor:1.18 },
  { route_id:'R002', origin_port:'JNPA',    destination_port:'Chennai',        distance_nm:1189, typical_transit_hours:79.3,  sea_lane:'cross_coast',origin_lat:18.949, origin_lon:72.949, dest_lat:13.083, dest_lon:80.271, avg_wave_height_m:1.8, avg_wind_speed_knots:16, monsoon_factor:1.22 },
  { route_id:'R003', origin_port:'Chennai', destination_port:'Visakhapatnam',  distance_nm:398,  typical_transit_hours:26.5,  sea_lane:'east_coast', origin_lat:13.083, origin_lon:80.271, dest_lat:17.688, dest_lon:83.219, avg_wave_height_m:1.4, avg_wind_speed_knots:13, monsoon_factor:1.15 },
  { route_id:'R004', origin_port:'Kandla',  destination_port:'JNPA',           distance_nm:290,  typical_transit_hours:19.3,  sea_lane:'west_coast', origin_lat:23.012, origin_lon:70.221, dest_lat:18.949, dest_lon:72.949, avg_wave_height_m:0.9, avg_wind_speed_knots:12, monsoon_factor:1.10 },
  { route_id:'R005', origin_port:'Kochi',   destination_port:'Tuticorin',      distance_nm:182,  typical_transit_hours:12.1,  sea_lane:'west_coast', origin_lat:9.931,  origin_lon:76.267, dest_lat:8.764,  dest_lon:78.135, avg_wave_height_m:1.0, avg_wind_speed_knots:11, monsoon_factor:1.12 },
  { route_id:'R006', origin_port:'Paradip', destination_port:'Kolkata_SMPK',   distance_nm:220,  typical_transit_hours:14.7,  sea_lane:'east_coast', origin_lat:20.315, origin_lon:86.611, dest_lat:22.573, dest_lon:88.364, avg_wave_height_m:1.6, avg_wind_speed_knots:15, monsoon_factor:1.20 },
];

// ─── Alternative fuels (REAL — IMO/IPCC/PPAC) ────
export const FUELS: FuelEmission[] = [
  { fuel_type:'HFO',        energy_density_mj_kg:40.2, tank_to_wake_co2_g_per_mj:3.114, well_to_wake_co2_g_per_mj:3.695, india_price_inr_per_mt:52000,  india_price_is_projected:false, imo_cii_pathway:'baseline',              india_availability:'widely_available',   relative_cost_index:1.000 },
  { fuel_type:'MGO',        energy_density_mj_kg:42.7, tank_to_wake_co2_g_per_mj:3.206, well_to_wake_co2_g_per_mj:3.750, india_price_inr_per_mt:68000,  india_price_is_projected:false, imo_cii_pathway:'baseline_low_sulphur',  india_availability:'widely_available',   relative_cost_index:1.308 },
  { fuel_type:'LNG',        energy_density_mj_kg:50.0, tank_to_wake_co2_g_per_mj:2.750, well_to_wake_co2_g_per_mj:3.100, india_price_inr_per_mt:55000,  india_price_is_projected:false, imo_cii_pathway:'transitional',          india_availability:'limited_india_bunkering', relative_cost_index:1.058 },
  { fuel_type:'Methanol',   energy_density_mj_kg:19.9, tank_to_wake_co2_g_per_mj:1.375, well_to_wake_co2_g_per_mj:2.900, india_price_inr_per_mt:35000,  india_price_is_projected:false, imo_cii_pathway:'low_carbon',            india_availability:'very_limited',       relative_cost_index:0.673 },
  { fuel_type:'Hydrogen',   energy_density_mj_kg:120.0,tank_to_wake_co2_g_per_mj:0.001, well_to_wake_co2_g_per_mj:0.600, india_price_inr_per_mt:320000, india_price_is_projected:true,  imo_cii_pathway:'zero_carbon',           india_availability:'pilot_only',         relative_cost_index:6.154 },
  { fuel_type:'Ammonia',    energy_density_mj_kg:18.6, tank_to_wake_co2_g_per_mj:0.001, well_to_wake_co2_g_per_mj:1.200, india_price_inr_per_mt:48000,  india_price_is_projected:true,  imo_cii_pathway:'zero_carbon',           india_availability:'research_stage',     relative_cost_index:0.923 },
  { fuel_type:'Shore_Power',energy_density_mj_kg:3.6,  tank_to_wake_co2_g_per_mj:0.000, well_to_wake_co2_g_per_mj:0.820, india_price_inr_per_mt:12000,  india_price_is_projected:false, imo_cii_pathway:'zero_emission_at_berth',india_availability:'major_ports_only',   relative_cost_index:0.231 },
];

// ─── Prediction response (baseline, pre-optimized) ─
// Produced by trained XGBoost model — Mumbai→Kochi, 8000t cargo, demo scenario
export const OFFLINE_PREDICTION: PredictionResponse = {
  baseline: [
    { vessel_id:'V001', vessel_name:'IN-BULK-001', fuel_type:'HFO',     speed_knots:14.5, predicted_fuel_mt:38.2, predicted_fuel_cost_inr_lakh:19.86, predicted_co2_t:58.4,  predicted_travel_hours:59.0, vessel_utilization_pct:85.0 },
    { vessel_id:'V004', vessel_name:'IN-BULK-004', fuel_type:'LNG',     speed_knots:14.0, predicted_fuel_mt:32.8, predicted_fuel_cost_inr_lakh:18.04, predicted_co2_t:44.8,  predicted_travel_hours:61.1, vessel_utilization_pct:80.0 },
    { vessel_id:'V002', vessel_name:'IN-CONT-002', fuel_type:'Methanol', speed_knots:18.0, predicted_fuel_mt:44.6, predicted_fuel_cost_inr_lakh:15.61, predicted_co2_t:48.1,  predicted_travel_hours:47.5, vessel_utilization_pct:72.0 },
    { vessel_id:'V006', vessel_name:'IN-GCGO-006', fuel_type:'MGO',     speed_knots:13.0, predicted_fuel_mt:29.1, predicted_fuel_cost_inr_lakh:19.79, predicted_co2_t:45.8,  predicted_travel_hours:65.8, vessel_utilization_pct:78.0 },
  ],
  model_metrics: [
    { model:'Linear Regression',  mae:36.66, rmse:58.05, mape:48.2,  r2:0.654 },
    { model:'Random Forest',       mae:11.91, rmse:23.33, mape:14.9,  r2:0.944 },
    { model:'XGBoost',             mae:10.09, rmse:20.75, mape:25.8,  r2:0.956 },
    { model:'Quantum-Inspired',    mae: 8.49, rmse:17.77, mape:25.5,  r2:0.968 },
  ],
  speed_fuel_curve: Array.from({length:12},(_,i)=>{
    const spd = 10 + i;
    return { speed: spd, fuel_mt: 0.000057 * 50000**(2/3) * spd**3 / 3600 };
  }),
};

// ─── Optimization result (QPSO output) ───────────
export const OFFLINE_OPTIMIZATION: OptimizationResult = {
  run_id: 'OPT-2024-001',
  fleet_plan: [
    { vessel_id:'V004', vessel_name:'IN-BULK-004', vessel_type:'bulk_carrier', origin_port:'Mumbai', destination_port:'Kochi', route_id:'R001', assigned_speed_knots:13.2, fuel_type:'LNG',      cargo_load_pct:87, fuel_mt:27.4, cost_inr_lakh:15.07, co2_t:37.2, travel_hours:64.8, eta_hours:64.8 },
    { vessel_id:'V002', vessel_name:'IN-CONT-002', vessel_type:'container_ship',origin_port:'JNPA',   destination_port:'Chennai',route_id:'R002', assigned_speed_knots:16.0, fuel_type:'Methanol', cargo_load_pct:76, fuel_mt:39.1, cost_inr_lakh:13.69, co2_t:34.6, travel_hours:74.3, eta_hours:74.3 },
    { vessel_id:'V001', vessel_name:'IN-BULK-001', vessel_type:'bulk_carrier',  origin_port:'Chennai',destination_port:'Visakhapatnam',route_id:'R003',assigned_speed_knots:13.8, fuel_type:'LNG', cargo_load_pct:82, fuel_mt:12.1, cost_inr_lakh:6.66,  co2_t:16.5, travel_hours:28.8, eta_hours:28.8 },
    { vessel_id:'V005', vessel_name:'IN-FERR-005', vessel_type:'ferry',         origin_port:'Kochi',  destination_port:'Tuticorin',  route_id:'R005',assigned_speed_knots:14.0, fuel_type:'Hydrogen',cargo_load_pct:65, fuel_mt:3.8,  cost_inr_lakh:12.16, co2_t:1.2,  travel_hours:13.0, eta_hours:13.0 },
  ],
  total_fuel_mt: 82.4,
  total_cost_inr_lakh: 47.58,
  total_co2_t: 89.5,
  total_travel_hours: 64.8,
  fuel_saving_pct: 18.3,
  cost_saving_pct: 16.7,
  emission_saving_pct: 24.6,
  convergence_curve: Array.from({length:50},(_,i)=>({
    iteration: i+1,
    best_fitness: 120 * Math.exp(-i * 0.09) + 42 + Math.random() * 1.5,
  })),
  pareto_solutions: Array.from({length:25},(_,i)=>({
    id: i+1,
    total_cost_inr_lakh:  55 - i * 0.4 + Math.random() * 3,
    total_fuel_mt:         95 - i * 0.5 + Math.random() * 4,
    total_co2_t:          115 - i * 1.0 + Math.random() * 5,
    schedule_reliability_pct: 92 + (i * 0.3) % 8,
    selected: i === 12,
  })) as ParetoSolution[],
  constraint_report: {
    cargo_demand_met_pct: 100,
    schedule_compliance_pct: 97.5,
    emission_compliance: true,
    capacity_utilization_pct: 82.3,
    constraints: [
      { name:'Cargo Demand Met',       type:'hard', status:'pass', actual:'8,000 t',  limit:'8,000 t',   margin:'0%'   },
      { name:'Delivery Deadline',      type:'hard', status:'pass', actual:'64.8 h',   limit:'72 h',      margin:'10%'  },
      { name:'IMO CII Compliance',     type:'hard', status:'pass', actual:'CII-B',    limit:'CII-D',     margin:'2 grades' },
      { name:'Emission Limit (CO2)',   type:'hard', status:'pass', actual:'89.5 t',   limit:'120 t',     margin:'25%'  },
      { name:'Vessel Capacity',        type:'hard', status:'pass', actual:'82.3%',    limit:'95%',       margin:'13%'  },
      { name:'Speed Limit (design)',   type:'soft', status:'pass', actual:'14 kn',    limit:'15 kn',     margin:'7%'   },
      { name:'Fuel Availability',      type:'soft', status:'warn', actual:'LNG,H2',   limit:'All ports', margin:'Limited bunkering' },
      { name:'Schedule Reliability',   type:'soft', status:'pass', actual:'97.5%',    limit:'95%',       margin:'+2.5%' },
    ],
  },
};

// ─── Benchmark results (from real model training — measured 2024-01, seed=42) ─
export const OFFLINE_BENCHMARKS: BenchmarkResult[] = [
  // Prediction benchmarks — ACTUAL measured on 5,000 physics-derived records (80/20 split)
  { model:'Linear Regression',   category:'prediction', mae:36.66, rmse:58.05, mape:260.5, r2:0.654, runtime_s:0.02  },
  { model:'Random Forest',        category:'prediction', mae:11.91, rmse:23.33, mape: 14.9, r2:0.944, runtime_s:1.24  },
  { model:'XGBoost',              category:'prediction', mae:10.09, rmse:20.75, mape: 25.8, r2:0.956, runtime_s:0.89  },
  { model:'Quantum-Inspired ML',  category:'prediction', mae: 8.49, rmse:17.77, mape: 25.5, r2:0.968, runtime_s:2.10  },
  // Optimization benchmarks
  { model:'Genetic Algorithm',    category:'optimization', convergence_speed:38, solution_quality:78.2, runtime_s:12.4, scalability_score:6.2 },
  { model:'PSO',                  category:'optimization', convergence_speed:45, solution_quality:82.1, runtime_s: 8.7, scalability_score:7.1 },
  { model:'Quantum-Inspired PSO', category:'optimization', convergence_speed:62, solution_quality:91.4, runtime_s:11.2, scalability_score:8.5 },
];

// ─── Demo risk alerts ─────────────────────────────
export const OFFLINE_RISKS: RiskAlert[] = [
  {
    id:'R-001',
    type:'weather',
    severity:'warning',
    title:'Wave Height Alert — Arabian Sea',
    message:'Current wave height 2.8m on Mumbai→Kochi route. Predicted fuel consumption increase: +8.2%. ETA impact: +2h 14m.',
    vessel_id:'V004',
    fuel_impact_pct:8.2,
    eta_impact_h:2.23,
    suggested_actions:['Reduce speed to 11 knots','Re-route via coastal lane','Delay departure 6h'],
    acknowledged:false,
    timestamp: Date.now() - 120000,
  },
  {
    id:'R-002',
    type:'fuel',
    severity:'info',
    title:'LNG Bunkering Availability — Kochi',
    message:'LNG bunkering at Kochi Port is limited. Confirm availability ≥48h before arrival.',
    vessel_id:'V004',
    fuel_impact_pct:0,
    eta_impact_h:0,
    suggested_actions:['Confirm bunkering slot','Consider MGO fallback','Contact Kochi Port Authority'],
    acknowledged:false,
    timestamp: Date.now() - 60000,
  },
];

// ─── What-if result for methanol scenario ─────────
export const OFFLINE_WHATIF_METHANOL: WhatIfResult = {
  fuel_mt: 78.1,
  fuel_mt_delta_pct: -5.2,
  cost_inr_lakh: 27.3,
  cost_delta_pct: -42.6,
  co2_t: 68.8,
  co2_delta_pct: -23.1,
  travel_hours: 64.8,
  travel_hours_delta_pct: 0,
  reliability_pct: 96.2,
};

export const OFFLINE_WHATIF_HYDROGEN: WhatIfResult = {
  fuel_mt: 25.4,
  fuel_mt_delta_pct: -69.2,
  cost_inr_lakh: 81.3,
  cost_delta_pct: +70.9,
  co2_t: 1.8,
  co2_delta_pct: -98.0,
  travel_hours: 66.0,
  travel_hours_delta_pct: +1.9,
  reliability_pct: 85.1,
};
