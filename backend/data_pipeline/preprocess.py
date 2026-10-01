"""
Data preprocessing pipeline: clean, feature-engineer, and export processed datasets.
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path

SEED = 42
RAW_DIR = Path(__file__).parent.parent.parent / "data" / "raw"
PROCESSED_DIR = Path(__file__).parent.parent.parent / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def preprocess_fuel_consumption():
    df = pd.read_csv(RAW_DIR / "fuel_consumption.csv")
    # Encode vessel_type
    type_map = {t: i for i, t in enumerate(sorted(df["vessel_type"].unique()))}
    df["vessel_type_enc"] = df["vessel_type"].map(type_map)
    fuel_map = {f: i for i, f in enumerate(sorted(df["fuel_type"].unique()))}
    df["fuel_type_enc"] = df["fuel_type"].map(fuel_map)
    mode_map = {m: i for i, m in enumerate(sorted(df["operational_mode"].unique()))}
    df["operational_mode_enc"] = df["operational_mode"].map(mode_map)
    # Derived features
    df["speed_cubed"] = df["speed_knots"] ** 3
    df["load_ratio"] = df["cargo_load_pct"] / 100.0
    df["speed_load_interaction"] = df["speed_knots"] * df["load_ratio"]
    df["log_distance"] = np.log1p(df["distance_nm"])
    df["log_capacity"] = np.log1p(df["capacity_dwt"])
    # Drop raw string cols for ML features
    ml_features = ["vessel_type_enc", "fuel_type_enc", "operational_mode_enc",
                   "capacity_dwt", "speed_knots", "cargo_load_pct", "distance_nm",
                   "wave_height_m", "speed_cubed", "load_ratio", "speed_load_interaction",
                   "log_distance", "log_capacity"]
    ml_target = "fuel_consumption_mt"
    df_ml = df[ml_features + [ml_target, "fuel_cost_inr_lakh", "co2_emissions_t",
                               "vessel_type", "fuel_type", "origin_port", "destination_port"]].copy()
    df_ml.to_csv(PROCESSED_DIR / "fuel_consumption_processed.csv", index=False)
    # Save encoding maps
    with open(PROCESSED_DIR / "encoding_maps.json", "w") as f:
        json.dump({"vessel_type": type_map, "fuel_type": fuel_map, "operational_mode": mode_map}, f, indent=2)
    return df_ml, ml_features, ml_target


def preprocess_fleet_specs():
    df = pd.read_csv(RAW_DIR / "fleet_vessel_specs.csv")
    df["fuel_compat_list"] = df["fuel_compatibility"].apply(json.loads)
    df.to_csv(PROCESSED_DIR / "fleet_specs_processed.csv", index=False)
    return df


def preprocess_routes():
    df = pd.read_csv(RAW_DIR / "routes_distances.csv")
    df.to_csv(PROCESSED_DIR / "routes_processed.csv", index=False)
    return df


def preprocess_weather():
    df = pd.read_csv(RAW_DIR / "weather_sea_conditions.csv")
    # Monthly climatological means by zone
    clim = df.groupby(["zone_id", "month"])[["wave_height_m", "wind_speed_knots", "sea_surface_temp_c"]].mean().reset_index()
    clim.to_csv(PROCESSED_DIR / "weather_climatology.csv", index=False)
    df.to_csv(PROCESSED_DIR / "weather_processed.csv", index=False)
    return df, clim


def preprocess_fuels():
    df = pd.read_csv(RAW_DIR / "alternative_fuels_emissions.csv")
    df.to_csv(PROCESSED_DIR / "fuels_processed.csv", index=False)
    return df


def preprocess_cargo():
    df = pd.read_csv(RAW_DIR / "cargo_demand.csv")
    # Aggregate to port-year level
    agg = df.groupby(["port_name", "year"])["volume_mt"].sum().reset_index()
    agg.columns = ["port_name", "year", "total_volume_mt"]
    agg.to_csv(PROCESSED_DIR / "cargo_demand_agg.csv", index=False)
    df.to_csv(PROCESSED_DIR / "cargo_demand_processed.csv", index=False)
    return df, agg


if __name__ == "__main__":
    print("Preprocessing all datasets...")
    preprocess_fuel_consumption()
    preprocess_fleet_specs()
    preprocess_routes()
    preprocess_weather()
    preprocess_fuels()
    preprocess_cargo()
    print("[OK] Preprocessing complete.")
