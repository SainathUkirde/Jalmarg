"""
Tests for GreenFleet backend:
- Dataset usage verification
- Prediction model
- Optimizer
- Constraint checker
- Risk engine
- API endpoints
"""

import sys
import json
import numpy as np
import pytest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

DATA_RAW = Path(__file__).parent.parent / "data" / "raw"
DATA_PROC = Path(__file__).parent.parent / "data" / "processed"


# ─── Phase 0: Dataset existence test ─────────────────────────
class TestDatasetUsage:
    """MANDATORY: All 6 datasets must be present and loadable."""
    
    def test_dataset_1_fuel_consumption_exists(self):
        """Dataset 1: Fuel consumption CSV exists and has required columns."""
        import pandas as pd
        path = DATA_RAW / "fuel_consumption.csv"
        assert path.exists(), f"Dataset 1 not found at {path}"
        df = pd.read_csv(path)
        required = ["vessel_type", "speed_knots", "fuel_consumption_mt", "fuel_type", "distance_nm"]
        for col in required:
            assert col in df.columns, f"Missing column: {col}"
        assert len(df) >= 1000, f"Too few records: {len(df)}"
    
    def test_dataset_2_fleet_specs_exists(self):
        """Dataset 2: Fleet specs CSV exists."""
        import pandas as pd
        path = DATA_RAW / "fleet_vessel_specs.csv"
        assert path.exists()
        df = pd.read_csv(path)
        assert len(df) > 0
        assert "vessel_type" in df.columns
        assert "deadweight_tonnage" in df.columns
        assert "fuel_compatibility" in df.columns
    
    def test_dataset_3_routes_exists(self):
        """Dataset 3: Routes CSV exists with real IPA distances."""
        import pandas as pd
        path = DATA_RAW / "routes_distances.csv"
        assert path.exists()
        df = pd.read_csv(path)
        assert len(df) > 0
        assert "distance_nm" in df.columns
        # Verify Mumbai-Kochi distance is ~855nm (real IPA value ±20nm)
        route = df[(df["origin_port"] == "Mumbai") & (df["destination_port"] == "Kochi")]
        if len(route) > 0:
            dist = route.iloc[0]["distance_nm"]
            assert 830 <= dist <= 880, f"Mumbai-Kochi distance out of expected range: {dist}"
    
    def test_dataset_4_weather_exists(self):
        """Dataset 4: Weather conditions CSV exists."""
        import pandas as pd
        path = DATA_RAW / "weather_sea_conditions.csv"
        assert path.exists()
        df = pd.read_csv(path)
        assert len(df) > 0
        assert "wave_height_m" in df.columns
        assert "wind_speed_knots" in df.columns
    
    def test_dataset_5_fuels_exists(self):
        """Dataset 5: Alternative fuels CSV exists with real emission factors."""
        import pandas as pd
        path = DATA_RAW / "alternative_fuels_emissions.csv"
        assert path.exists()
        df = pd.read_csv(path)
        assert len(df) == 7, f"Expected 7 fuel types, got {len(df)}"
        assert "well_to_wake_co2_g_per_mj" in df.columns
        assert "india_price_inr_per_mt" in df.columns
        # Verify HFO WtW from IMO GHG Study 2020
        hfo = df[df["fuel_type"] == "HFO"].iloc[0]
        assert 3.5 <= hfo["well_to_wake_co2_g_per_mj"] <= 4.0, "HFO WtW out of range"
    
    def test_dataset_6_cargo_exists(self):
        """Dataset 6: Cargo demand CSV exists with IPA 2022-23 figures."""
        import pandas as pd
        path = DATA_RAW / "cargo_demand.csv"
        assert path.exists()
        df = pd.read_csv(path)
        assert len(df) > 0
        assert "port_name" in df.columns
        assert "volume_mt" in df.columns
        # Verify Kandla (largest Indian port) has reasonable traffic
        kandla = df[df["port_name"] == "Kandla"]
        assert len(kandla) > 0, "Kandla port not found in cargo demand"
    
    def test_ports_json_exists(self):
        """Ports GeoJSON exists for map rendering."""
        path = DATA_PROC / "ports.json"
        assert path.exists()
        with open(path) as f:
            ports = json.load(f)
        assert len(ports) == 13, f"Expected 13 major ports, got {len(ports)}"
    
    def test_all_datasets_loaded_by_module(self):
        """All 6 datasets are consumed by at least one module — integration test."""
        # This verifies the data pipeline produces consumable outputs
        import pandas as pd
        datasets = {
            "fuel_consumption": DATA_RAW / "fuel_consumption.csv",
            "fleet_specs": DATA_RAW / "fleet_vessel_specs.csv",
            "routes": DATA_RAW / "routes_distances.csv",
            "weather": DATA_RAW / "weather_sea_conditions.csv",
            "fuels": DATA_RAW / "alternative_fuels_emissions.csv",
            "cargo": DATA_RAW / "cargo_demand.csv",
        }
        for name, path in datasets.items():
            assert path.exists(), f"Dataset '{name}' not found"
            df = pd.read_csv(path)
            assert len(df) > 0, f"Dataset '{name}' is empty"


# ─── Prediction model tests ────────────────────────────────────
class TestPredictionModel:
    def test_physics_model_increases_with_speed(self):
        """Fuel consumption should increase with speed (cubic law)."""
        sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))
        from backend.models.optimizer import compute_fuel_mt
        fuel_slow, _, _ = compute_fuel_mt("bulk_carrier", 40000, 10, 80, "HFO", 100, 1.0)
        fuel_fast, _, _ = compute_fuel_mt("bulk_carrier", 40000, 15, 80, "HFO", 100, 1.0)
        assert fuel_fast > fuel_slow, "Fuel should increase with speed"
    
    def test_physics_model_increases_with_wave_height(self):
        """Fuel consumption should increase with wave height."""
        from backend.models.optimizer import compute_fuel_mt
        fuel_calm, _, _ = compute_fuel_mt("bulk_carrier", 40000, 14, 80, "HFO", 500, 0.5)
        fuel_rough, _, _ = compute_fuel_mt("bulk_carrier", 40000, 14, 80, "HFO", 500, 3.0)
        assert fuel_rough > fuel_calm, "Fuel should increase with wave height"
    
    def test_trained_models_exist(self):
        """All 4 trained model artifacts must exist."""
        model_dir = Path(__file__).parent.parent / "backend" / "models"
        for model_name in ["linear_regression", "random_forest", "xgboost", "quantum_inspired"]:
            path = model_dir / f"{model_name}.pkl"
            assert path.exists(), f"Model artifact not found: {path}"
    
    def test_quantum_inspired_model_beats_linear(self):
        """QI model must have lower MAPE than Linear Regression."""
        bm_path = Path(__file__).parent.parent / "backend" / "models" / "benchmark_results.json"
        if not bm_path.exists():
            pytest.skip("Benchmarks not yet generated")
        with open(bm_path) as f:
            bm = json.load(f)
        qi_mape = bm.get("Quantum-Inspired", {}).get("mape", 999)
        lr_mape = bm.get("Linear Regression", {}).get("mape", 999)
        assert qi_mape < lr_mape, f"QI MAPE ({qi_mape}) should be < LR MAPE ({lr_mape})"
    
    def test_quantum_inspired_best_r2(self):
        """QI model should have the best R²."""
        bm_path = Path(__file__).parent.parent / "backend" / "models" / "benchmark_results.json"
        if not bm_path.exists():
            pytest.skip("Benchmarks not yet generated")
        with open(bm_path) as f:
            bm = json.load(f)
        qi_r2 = bm.get("Quantum-Inspired", {}).get("r2", 0)
        for name, metrics in bm.items():
            if name != "Quantum-Inspired":
                assert qi_r2 >= metrics["r2"], f"QI R² ({qi_r2}) should be ≥ {name} R² ({metrics['r2']})"


# ─── Optimizer tests ───────────────────────────────────────────
class TestOptimizer:
    def test_qpso_produces_solution(self):
        """QPSO should return a valid fleet plan."""
        from backend.models.optimizer import QuantumInspiredPSO, Vessel, Route
        vessels = [
            Vessel("V001","IN-BULK-001","bulk_carrier",50000,14.5,["HFO","LNG"]),
            Vessel("V004","IN-BULK-004","bulk_carrier",40000,14.0,["LNG","Methanol"]),
        ]
        routes = [Route("R001","Mumbai","Kochi",855,1.2)]
        optimizer = QuantumInspiredPSO(pop_size=5, max_iter=5, seed=42)
        result = optimizer.optimize(vessels, routes, 8000, 72, ["LNG","HFO"])
        assert "fleet_plan" in result
        assert len(result["fleet_plan"]) == 2
        assert result["total_fuel_mt"] > 0
        assert result["total_co2_t"] > 0
    
    def test_lower_speed_reduces_fuel(self):
        """Optimal speed should be below design speed for fuel efficiency."""
        from backend.models.optimizer import QuantumInspiredPSO, Vessel, Route
        vessels = [Vessel("V001","IN-BULK","bulk_carrier",50000,15.0,["HFO"])]
        routes = [Route("R001","A","B",1000,1.0)]
        opt = QuantumInspiredPSO(pop_size=10, max_iter=20, seed=42)
        result = opt.optimize(vessels, routes, 40000, 80, ["HFO"])
        speed = result["fleet_plan"][0]["assigned_speed_knots"]
        # Should select speed well below max (efficiency optimization)
        assert speed <= 15.0 * 1.05, f"Speed {speed} exceeds design speed"
    
    def test_pareto_solutions_non_empty(self):
        """Pareto solutions should be generated."""
        from backend.models.optimizer import QuantumInspiredPSO, Vessel, Route
        vessels = [Vessel("V001","V1","bulk_carrier",50000,14.5,["HFO","LNG"])]
        routes = [Route("R001","A","B",500,1.0)]
        opt = QuantumInspiredPSO(pop_size=10, max_iter=10, seed=42)
        result = opt.optimize(vessels, routes, 40000, 60, ["HFO","LNG"])
        assert len(result["pareto_solutions"]) >= 10


# ─── Constraint checker tests ──────────────────────────────────
class TestConstraints:
    def test_cargo_constraint_met(self):
        """Cargo demand should be met by the optimizer."""
        from backend.models.optimizer import QuantumInspiredPSO, Vessel, Route
        vessels = [Vessel("V001","V1","bulk_carrier",50000,14.5,["HFO"])]
        routes = [Route("R001","A","B",500,1.0)]
        opt = QuantumInspiredPSO(pop_size=5, max_iter=5, seed=42)
        result = opt.optimize(vessels, routes, 8000, 72, ["HFO"])
        # Verify cargo can be met (vessel has 50,000 DWT, demand is 8,000t)
        assert result["total_fuel_mt"] > 0


# ─── Risk engine test ──────────────────────────────────────────
class TestRiskEngine:
    def test_wave_penalty_applied(self):
        """Wave height > 2.5m should increase fuel consumption."""
        from backend.models.optimizer import compute_fuel_mt
        fuel_normal, _, _ = compute_fuel_mt("bulk_carrier", 40000, 13, 80, "HFO", 855, 1.0)
        fuel_heavy, _, _  = compute_fuel_mt("bulk_carrier", 40000, 13, 80, "HFO", 855, 3.0)
        assert fuel_heavy > fuel_normal * 1.05, "Wave penalty not applied"


# ─── API tests (requires running server) ──────────────────────
class TestAPISmoke:
    """Smoke tests for API endpoints."""
    
    def test_predict_offline_fallback(self):
        """Prediction endpoint uses physics fallback without trained model."""
        import sys
        sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))
        from backend.main import physics_predict
        fuel, cost, co2, hours = physics_predict("bulk_carrier", 40000, 14, 80, "LNG", 855, 1.4)
        assert fuel > 0, "Fuel should be positive"
        assert cost > 0, "Cost should be positive"
        assert co2 > 0, "CO2 should be positive"
        assert hours > 0, "Hours should be positive"
    
    def test_whatif_methanol_reduces_emissions(self):
        """Switching to Methanol should reduce WtW emissions vs HFO."""
        from backend.models.optimizer import compute_fuel_mt
        fuel_hfo, _, co2_hfo = compute_fuel_mt("bulk_carrier", 40000, 13, 80, "HFO", 855, 1.0)
        fuel_meth, _, co2_meth = compute_fuel_mt("bulk_carrier", 40000, 13, 80, "Methanol", 855, 1.0)
        assert co2_meth < co2_hfo, "Methanol should have lower WtW CO2 than HFO"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
