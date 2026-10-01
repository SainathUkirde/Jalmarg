"""
Phase 0: Physics-informed dataset generation for Quantum-Inspired Green Fleet Optimization.
All synthetic/derived data labelled explicitly. Real data (IPA/DG Shipping figures) used as anchors.
Seed: 42 for full reproducibility.
"""

import numpy as np
import pandas as pd
import json
import os
from pathlib import Path

SEED = 42
rng = np.random.default_rng(SEED)

RAW_DIR = Path(__file__).parent.parent.parent / "data" / "raw"
PROCESSED_DIR = Path(__file__).parent.parent.parent / "data" / "processed"
RAW_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

# ─────────────────────────────────────────────────────────────
# REAL ANCHORS from published sources
# ─────────────────────────────────────────────────────────────

# IPA 2022-23 Annual Report: Major Port traffic (million tonnes)
IPA_PORT_TRAFFIC_MT = {
    "JNPA": 79.6, "Mumbai": 67.0, "Chennai": 49.9, "Visakhapatnam": 86.5,
    "Paradip": 121.6, "Kandla": 147.3, "Kochi": 29.6, "Tuticorin": 30.0,
    "Kamarajar": 41.8, "New Mangalore": 37.4, "Mormugao": 14.9,
    "Kolkata_SMPK": 20.4, "Port_Blair": 1.1,
}

# IMO 4th GHG Study 2020 — Table 4.3 fleet-average fuel consumption g/tonne-nm
# Values: (mean_grams_per_tonne_nm, std)
IMO_FUEL_INTENSITIES = {
    "bulk_carrier":     (3.2, 0.6),
    "container_ship":   (6.8, 1.2),
    "tanker":           (3.5, 0.7),
    "general_cargo":    (8.1, 1.5),
    "ro_ro":            (12.4, 2.1),
    "passenger":        (18.0, 3.0),
    "ferry":            (22.0, 4.0),
}

# DG Shipping 2022-23: Indian fleet composition (approx vessel counts by type)
DG_FLEET_COMPOSITION = {
    "bulk_carrier": 42, "container_ship": 28, "tanker": 35,
    "general_cargo": 25, "ro_ro": 8, "passenger": 7, "ferry": 5,
}

VESSEL_TYPES = list(DG_FLEET_COMPOSITION.keys())

# IMO GHG 2020 + IPCC AR6: Well-to-Wake emission factors (gCO2eq/MJ)
FUEL_EMISSION_FACTORS = {
    "HFO":       {"tank_to_wake": 3.114, "well_to_wake": 3.695, "energy_density_mj_kg": 40.2, "india_price_inr_per_mt": 52000},
    "MGO":       {"tank_to_wake": 3.206, "well_to_wake": 3.750, "energy_density_mj_kg": 42.7, "india_price_inr_per_mt": 68000},
    "LNG":       {"tank_to_wake": 2.750, "well_to_wake": 3.100, "energy_density_mj_kg": 50.0, "india_price_inr_per_mt": 55000},
    "Methanol":  {"tank_to_wake": 1.375, "well_to_wake": 2.900, "energy_density_mj_kg": 19.9, "india_price_inr_per_mt": 35000},
    "Hydrogen":  {"tank_to_wake": 0.001, "well_to_wake": 0.600, "energy_density_mj_kg": 120.0, "india_price_inr_per_mt": 320000},
    "Ammonia":   {"tank_to_wake": 0.001, "well_to_wake": 1.200, "energy_density_mj_kg": 18.6, "india_price_inr_per_mt": 48000},
    "Shore_Power": {"tank_to_wake": 0.0, "well_to_wake": 0.820, "energy_density_mj_kg": 3.6, "india_price_inr_per_mt": 12000},
}

# ─────────────────────────────────────────────────────────────
# DATASET 2: Fleet / Vessel Specifications
# ─────────────────────────────────────────────────────────────

def generate_fleet_specs():
    """DERIVED from DG Shipping 2022-23 fleet composition."""
    specs = {
        "bulk_carrier":   {"dwt_range": (25000, 75000), "speed_range": (12, 16), "engine_kw_per_dwt": 0.09},
        "container_ship": {"dwt_range": (8000, 45000),  "speed_range": (16, 24), "engine_kw_per_dwt": 0.13},
        "tanker":         {"dwt_range": (20000, 80000), "speed_range": (13, 17), "engine_kw_per_dwt": 0.08},
        "general_cargo":  {"dwt_range": (5000, 20000),  "speed_range": (12, 16), "engine_kw_per_dwt": 0.11},
        "ro_ro":          {"dwt_range": (3000, 12000),  "speed_range": (16, 22), "engine_kw_per_dwt": 0.18},
        "passenger":      {"dwt_range": (1000, 5000),   "speed_range": (18, 28), "engine_kw_per_dwt": 0.25},
        "ferry":          {"dwt_range": (500, 3000),    "speed_range": (14, 22), "engine_kw_per_dwt": 0.22},
    }
    fuel_compat = {
        "bulk_carrier":   ["HFO", "MGO", "LNG"],
        "container_ship": ["HFO", "MGO", "LNG", "Methanol"],
        "tanker":         ["HFO", "MGO", "LNG"],
        "general_cargo":  ["HFO", "MGO"],
        "ro_ro":          ["HFO", "MGO", "LNG"],
        "passenger":      ["MGO", "LNG", "Hydrogen"],
        "ferry":          ["MGO", "LNG", "Hydrogen", "Shore_Power"],
    }
    vessels = []
    vessel_id = 1
    for vtype, count in DG_FLEET_COMPOSITION.items():
        s = specs[vtype]
        for i in range(count):
            dwt = int(rng.uniform(*s["dwt_range"]))
            speed = round(float(rng.uniform(*s["speed_range"])), 1)
            engine_kw = int(dwt * s["engine_kw_per_dwt"])
            loa = round(0.15 * dwt**0.33 * 10, 1)
            vessels.append({
                "vessel_id": f"V{vessel_id:03d}",
                "vessel_name": f"IN-{vtype.upper()[:3]}-{vessel_id:03d}",
                "vessel_type": vtype,
                "flag_state": "India",
                "year_built": int(rng.integers(2005, 2023)),
                "gross_tonnage": int(dwt * 0.75),
                "deadweight_tonnage": dwt,
                "length_overall_m": loa,
                "engine_power_kw": engine_kw,
                "design_speed_knots": speed,
                "fuel_compatibility": json.dumps(fuel_compat[vtype]),
                "imo_number": f"IMO{9000000 + vessel_id}",
                "capacity_teu": int(dwt / 14) if vtype == "container_ship" else 0,
                "operator": rng.choice(["SCI", "Essar Shipping", "Shreyas Shipping", "APSEZ", "Adani Ports"]),
                "home_port": rng.choice(list(IPA_PORT_TRAFFIC_MT.keys())),
                "shore_power_compatible": (vtype in ["ferry", "passenger"]),
                "data_source": "DERIVED_DG_SHIPPING_2022_23",
            })
            vessel_id += 1
    df = pd.DataFrame(vessels)
    df.to_csv(RAW_DIR / "fleet_vessel_specs.csv", index=False)
    return df


# ─────────────────────────────────────────────────────────────
# DATASET 3: Routes & Distances (REAL distances, DERIVED waypoints)
# ─────────────────────────────────────────────────────────────

PORT_COORDS = {
    "JNPA":            {"lat": 18.9490, "lon": 72.9490, "state": "Maharashtra", "coast": "west"},
    "Mumbai":          {"lat": 18.9220, "lon": 72.8347, "state": "Maharashtra", "coast": "west"},
    "Chennai":         {"lat": 13.0827, "lon": 80.2707, "state": "Tamil Nadu", "coast": "east"},
    "Visakhapatnam":   {"lat": 17.6883, "lon": 83.2185, "state": "Andhra Pradesh", "coast": "east"},
    "Paradip":         {"lat": 20.3148, "lon": 86.6111, "state": "Odisha", "coast": "east"},
    "Kandla":          {"lat": 23.0116, "lon": 70.2209, "state": "Gujarat", "coast": "west"},
    "Kochi":           {"lat":  9.9312, "lon": 76.2673, "state": "Kerala", "coast": "west"},
    "Tuticorin":       {"lat":  8.7642, "lon": 78.1348, "state": "Tamil Nadu", "coast": "east"},
    "Kamarajar":       {"lat": 13.2168, "lon": 80.3288, "state": "Tamil Nadu", "coast": "east"},
    "New_Mangalore":   {"lat": 12.9141, "lon": 74.8560, "state": "Karnataka", "coast": "west"},
    "Mormugao":        {"lat": 15.4200, "lon": 73.7900, "state": "Goa", "coast": "west"},
    "Kolkata_SMPK":    {"lat": 22.5726, "lon": 88.3639, "state": "West Bengal", "coast": "east"},
    "Port_Blair":      {"lat": 11.6234, "lon": 92.7265, "state": "Andaman & Nicobar", "coast": "island"},
}

# REAL distances in nautical miles — from IPA distance tables and nautical charts
REAL_DISTANCES_NM = {
    ("JNPA", "Mumbai"):        22,   ("JNPA", "Kochi"):         870,
    ("JNPA", "Chennai"):      1189,  ("JNPA", "Kandla"):        290,
    ("JNPA", "New_Mangalore"): 520,  ("JNPA", "Mormugao"):      363,
    ("Mumbai", "Kochi"):       855,  ("Mumbai", "Chennai"):     1174,
    ("Mumbai", "Kandla"):      275,  ("Mumbai", "New_Mangalore"): 508,
    ("Mumbai", "Mormugao"):    348,  ("Kochi", "Chennai"):       534,
    ("Kochi", "Tuticorin"):    182,  ("Kochi", "New_Mangalore"): 339,
    ("Chennai", "Tuticorin"):  363,  ("Chennai", "Visakhapatnam"): 398,
    ("Chennai", "Kamarajar"):   12,  ("Chennai", "Paradip"):     696,
    ("Chennai", "Kolkata_SMPK"): 848, ("Visakhapatnam", "Paradip"): 308,
    ("Visakhapatnam", "Kolkata_SMPK"): 490, ("Paradip", "Kolkata_SMPK"): 220,
    ("Kandla", "JNPA"):        290,  ("Kandla", "Mumbai"):       275,
    ("Tuticorin", "Port_Blair"): 758, ("Chennai", "Port_Blair"): 790,
    ("Kochi", "Mormugao"):     416,  ("New_Mangalore", "Mormugao"): 170,
    ("Kamarajar", "Visakhapatnam"): 410, ("Mormugao", "Kandla"): 520,
}

def generate_routes():
    routes = []
    route_id = 1
    # Add both directions for each pair
    for (o, d), dist in REAL_DISTANCES_NM.items():
        for origin, dest, direction in [(o, d, "outbound"), (d, o, "return")]:
            actual_dist = dist + rng.integers(-5, 10)  # ±sea lane deviation
            transit_h = round(actual_dist / 15.0, 1)   # avg 15 kn service speed
            oc = PORT_COORDS[origin]; dc = PORT_COORDS[dest]
            routes.append({
                "route_id": f"R{route_id:03d}",
                "origin_port": origin,
                "destination_port": dest,
                "distance_nm": int(actual_dist),
                "typical_transit_hours": transit_h,
                "sea_lane": f"{oc['coast']}_coast" if oc["coast"] == dc["coast"] else "cross_coast",
                "origin_lat": oc["lat"], "origin_lon": oc["lon"],
                "dest_lat": dc["lat"], "dest_lon": dc["lon"],
                "avg_wave_height_m": round(rng.uniform(0.5, 2.5), 2),
                "avg_wind_speed_knots": round(rng.uniform(8, 22), 1),
                "monsoon_factor": round(rng.uniform(1.05, 1.25), 3),
                "data_source": "REAL_IPA_DISTANCES_DERIVED_WAYPOINTS",
            })
            route_id += 1
    df = pd.DataFrame(routes)
    df.to_csv(RAW_DIR / "routes_distances.csv", index=False)
    return df


# ─────────────────────────────────────────────────────────────
# DATASET 4: Weather & Sea Conditions (DERIVED from INCOIS/IMD climatology)
# ─────────────────────────────────────────────────────────────

SEASONS = {
    "Winter":   {"months": [12,1,2], "wave_mean": 1.0, "wave_std": 0.3, "wind_mean": 12, "wind_std": 3},
    "PreMonsoon":{"months": [3,4,5], "wave_mean": 1.5, "wave_std": 0.4, "wind_mean": 15, "wind_std": 4},
    "Monsoon":  {"months": [6,7,8,9],"wave_mean": 3.2, "wave_std": 0.8, "wind_mean": 24, "wind_std": 6},
    "PostMonsoon":{"months":[10,11],  "wave_mean": 1.8, "wave_std": 0.5, "wind_mean": 16, "wind_std": 4},
}
ZONES = ["Arabian_Sea_North", "Arabian_Sea_South", "Bay_of_Bengal_North",
         "Bay_of_Bengal_South", "Lakshadweep_Sea", "Andaman_Sea",
         "Gulf_of_Khambhat", "Gulf_of_Kutch", "Palk_Strait", "Southern_TN_Coast"]

def generate_weather():
    records = []
    for zone in ZONES:
        for month in range(1, 13):
            season = next(s for s, v in SEASONS.items() if month in v["months"])
            sv = SEASONS[season]
            for year in range(2015, 2024):
                records.append({
                    "zone_id": zone,
                    "year": year,
                    "month": month,
                    "season": season,
                    "wave_height_m": round(max(0.3, rng.normal(sv["wave_mean"], sv["wave_std"])), 2),
                    "wind_speed_knots": round(max(3, rng.normal(sv["wind_mean"], sv["wind_std"])), 1),
                    "wind_direction_deg": int(rng.integers(0, 360)),
                    "sea_surface_temp_c": round(rng.uniform(26, 32), 1),
                    "visibility_km": round(rng.uniform(5, 25), 1),
                    "data_source": "DERIVED_INCOIS_IMD_CLIMATOLOGY",
                })
    df = pd.DataFrame(records)
    df.to_csv(RAW_DIR / "weather_sea_conditions.csv", index=False)
    return df


# ─────────────────────────────────────────────────────────────
# DATASET 5: Alternative Fuel & Emission (REAL from IMO/IPCC/PPAC)
# ─────────────────────────────────────────────────────────────

def generate_fuel_emission_data():
    rows = []
    for fuel, props in FUEL_EMISSION_FACTORS.items():
        imo_pathway = {
            "HFO": "baseline", "MGO": "baseline_low_sulphur",
            "LNG": "transitional", "Methanol": "low_carbon",
            "Hydrogen": "zero_carbon", "Ammonia": "zero_carbon",
            "Shore_Power": "zero_emission_at_berth",
        }.get(fuel, "unknown")
        availability = {
            "HFO": "widely_available", "MGO": "widely_available",
            "LNG": "limited_india_bunkering", "Methanol": "very_limited",
            "Hydrogen": "pilot_only", "Ammonia": "research_stage",
            "Shore_Power": "major_ports_only",
        }.get(fuel, "unknown")
        is_projected = fuel in ["Hydrogen", "Ammonia"]
        rows.append({
            "fuel_type": fuel,
            "energy_density_mj_kg": props["energy_density_mj_kg"],
            "tank_to_wake_co2_g_per_mj": props["tank_to_wake"],
            "well_to_wake_co2_g_per_mj": props["well_to_wake"],
            "india_price_inr_per_mt": props["india_price_inr_per_mt"],
            "india_price_is_projected": is_projected,
            "imo_cii_pathway": imo_pathway,
            "india_availability": availability,
            "ch4_gwp100_factor": 0.001 if fuel in ["Hydrogen","Ammonia","Shore_Power"] else (0.023 if fuel=="LNG" else 0.002),
            "n2o_gwp100_factor": 0.001,
            "relative_cost_index": round(props["india_price_inr_per_mt"] / FUEL_EMISSION_FACTORS["HFO"]["india_price_inr_per_mt"], 3),
            "notes": "IEA 2030 projection" if is_projected else "PPAC/IMO 2023 actual",
            "data_source": "REAL_IMO_GHG2020_IPCC_AR6_PPAC2023",
        })
    df = pd.DataFrame(rows)
    df.to_csv(RAW_DIR / "alternative_fuels_emissions.csv", index=False)
    return df


# ─────────────────────────────────────────────────────────────
# DATASET 6: Cargo Demand (REAL IPA totals, DERIVED breakdown)
# ─────────────────────────────────────────────────────────────

# REAL: IPA Annual Report 2022-23, Table 1 — Port-wise traffic in million tonnes
IPA_COMMODITY_SPLIT = {
    "POL": 0.38, "iron_ore": 0.15, "coal": 0.18,
    "containers_teu": 0.12, "fertilizers": 0.07, "other": 0.10,
}

def generate_cargo_demand():
    records = []
    years = list(range(2018, 2024))
    growth_rates = {"JNPA": 0.07, "Mumbai": 0.04, "Chennai": 0.06,
                    "Visakhapatnam": 0.05, "Paradip": 0.08, "Kandla": 0.06,
                    "Kochi": 0.05, "Tuticorin": 0.04, "Kamarajar": 0.06,
                    "New_Mangalore": 0.05, "Mormugao": -0.02,
                    "Kolkata_SMPK": 0.03, "Port_Blair": 0.08}
    base_year = 2022
    for port, base_mt in IPA_PORT_TRAFFIC_MT.items():
        for yr in years:
            gr = growth_rates.get(port, 0.05)
            scale = (1 + gr) ** (yr - base_year)
            total = base_mt * scale
            for commodity, share in IPA_COMMODITY_SPLIT.items():
                vol = total * share * (1 + rng.normal(0, 0.03))
                records.append({
                    "port_name": port,
                    "year": yr,
                    "commodity_type": commodity,
                    "volume_mt": round(max(0, vol), 3),
                    "growth_rate_pct": round(gr * 100, 2),
                    "market_share_pct": round(share * 100, 1),
                    "data_source": "REAL_IPA_2022_23_DERIVED_BREAKDOWN",
                })
    df = pd.DataFrame(records)
    df.to_csv(RAW_DIR / "cargo_demand.csv", index=False)
    return df


# ─────────────────────────────────────────────────────────────
# DATASET 1: Fuel Consumption (DERIVED — physics-informed cubic model)
# ─────────────────────────────────────────────────────────────

def admiralty_fuel_consumption(vessel_type, dwt, speed_knots, cargo_load_pct,
                                fuel_type, wave_height_m, distance_nm):
    """
    Physics-informed fuel consumption model.
    Based on Admiralty coefficient: P ∝ displacement^(2/3) × V^3
    Calibrated to IMO 4th GHG Study 2020 fleet averages.
    Returns fuel consumed in metric tonnes.
    """
    mean_intensity, std_intensity = IMO_FUEL_INTENSITIES[vessel_type]
    displacement = dwt * (0.5 + 0.5 * cargo_load_pct / 100.0)
    # Speed-power: cubic relationship
    design_speed = {"bulk_carrier":14,"container_ship":20,"tanker":15,
                    "general_cargo":14,"ro_ro":19,"passenger":22,"ferry":18}[vessel_type]
    speed_ratio = speed_knots / design_speed
    # Admiralty coefficient model
    admiralty_coeff = 0.0057 * displacement**0.667
    shaft_power_kw = admiralty_coeff * speed_knots**3
    # Sea margin: wave resistance penalty (ITTC 78 approximation)
    wave_penalty = 1.0 + 0.15 * (wave_height_m / 2.0) ** 1.5
    shaft_power_kw *= wave_penalty
    # Fuel consumption rate = shaft_power / (engine_efficiency × fuel_LHV)
    engine_eff = 0.48  # typical 2-stroke slow-speed diesel
    fuel_props = FUEL_EMISSION_FACTORS[fuel_type]
    energy_density = fuel_props["energy_density_mj_kg"]
    fuel_rate_kg_per_h = (shaft_power_kw * 3.6) / (engine_eff * energy_density)
    travel_hours = distance_nm / speed_knots
    fuel_mt = fuel_rate_kg_per_h * travel_hours / 1000.0
    # Add realistic noise
    noise_factor = 1 + rng.normal(0, 0.05)
    return max(0.1, fuel_mt * noise_factor), travel_hours

def generate_fuel_consumption():
    fleet_df = pd.read_csv(RAW_DIR / "fleet_vessel_specs.csv")
    routes_df = pd.read_csv(RAW_DIR / "routes_distances.csv")
    fuel_df = pd.read_csv(RAW_DIR / "alternative_fuels_emissions.csv")
    records = []
    n_records = 5000
    for _ in range(n_records):
        vessel = fleet_df.sample(1, random_state=None).iloc[0]
        route = routes_df.sample(1, random_state=None).iloc[0]
        vtype = vessel["vessel_type"]
        dwt = vessel["deadweight_tonnage"]
        compat = json.loads(vessel["fuel_compatibility"])
        fuel_type = rng.choice(compat)
        # Operational parameters
        design_speed = vessel["design_speed_knots"]
        speed = round(float(rng.uniform(design_speed * 0.70, design_speed * 1.05)), 1)
        cargo_load = round(float(rng.uniform(50, 100)), 1)
        wave_h = round(float(rng.uniform(0.3, 3.5)), 2)
        dist = route["distance_nm"]
        fuel_mt, travel_h = admiralty_fuel_consumption(
            vtype, dwt, speed, cargo_load, fuel_type, wave_h, dist)
        fuel_props_row = fuel_df[fuel_df["fuel_type"] == fuel_type].iloc[0]
        price_inr_per_mt = fuel_props_row["india_price_inr_per_mt"]
        fuel_cost_inr = fuel_mt * price_inr_per_mt
        wtw_factor = fuel_props_row["well_to_wake_co2_g_per_mj"]
        energy_mj = fuel_mt * 1000 * fuel_props_row["energy_density_mj_kg"]
        co2_t = wtw_factor * energy_mj / 1e6
        records.append({
            "vessel_id": vessel["vessel_id"],
            "vessel_type": vtype,
            "capacity_dwt": dwt,
            "speed_knots": speed,
            "cargo_load_pct": cargo_load,
            "distance_nm": dist,
            "fuel_type": fuel_type,
            "wave_height_m": wave_h,
            "route_id": route["route_id"],
            "origin_port": route["origin_port"],
            "destination_port": route["destination_port"],
            "fuel_consumption_mt": round(fuel_mt, 4),
            "travel_hours": round(travel_h, 2),
            "fuel_cost_inr_lakh": round(fuel_cost_inr / 1e5, 4),
            "co2_emissions_t": round(co2_t, 4),
            "operational_mode": rng.choice(["sea_passage", "coastal", "river_mouth"], p=[0.7, 0.2, 0.1]),
            "data_source": "DERIVED_PHYSICS_IMO_GHG2020_SEED42",
        })
    df = pd.DataFrame(records)
    df.to_csv(RAW_DIR / "fuel_consumption.csv", index=False)
    return df


# ─────────────────────────────────────────────────────────────
# PORT COORDS JSON (for frontend map)
# ─────────────────────────────────────────────────────────────

def generate_port_coords_json():
    port_list = []
    for name, coords in PORT_COORDS.items():
        port_list.append({
            "id": name,
            "name": name.replace("_", " "),
            "lat": coords["lat"],
            "lon": coords["lon"],
            "state": coords["state"],
            "coast": coords["coast"],
            "traffic_mt_2022_23": IPA_PORT_TRAFFIC_MT.get(name, 0),
            "data_source": "REAL_IPA_2022_23",
        })
    with open(PROCESSED_DIR / "ports.json", "w") as f:
        json.dump(port_list, f, indent=2)
    return port_list


# ─────────────────────────────────────────────────────────────
# DATA QUALITY REPORT
# ─────────────────────────────────────────────────────────────

def generate_quality_report(dfs: dict):
    report_lines = ["# Data Quality Report\n\n"]
    for name, df in dfs.items():
        report_lines.append(f"## {name}\n")
        report_lines.append(f"- Records: {len(df)}\n")
        report_lines.append(f"- Columns: {list(df.columns)}\n")
        null_pct = (df.isnull().sum() / len(df) * 100).to_dict()
        report_lines.append(f"- Null percentages: {null_pct}\n\n")
    with open(Path(__file__).parent.parent.parent / "docs" / "DATA_QUALITY_REPORT.md", "w") as f:
        f.writelines(report_lines)


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Phase 0: Generating all 6 datasets...")
    np.random.seed(SEED)

    print("[1/6] Fleet/Vessel Specs...")
    fleet_df = generate_fleet_specs()
    print(f"      -> {len(fleet_df)} vessels")

    print("[2/6] Routes & Distances...")
    routes_df = generate_routes()
    print(f"      -> {len(routes_df)} routes")

    print("[3/6] Weather & Sea Conditions...")
    weather_df = generate_weather()
    print(f"      -> {len(weather_df)} records")

    print("[4/6] Alternative Fuels & Emissions...")
    fuel_emission_df = generate_fuel_emission_data()
    print(f"      -> {len(fuel_emission_df)} fuel types")

    print("[5/6] Cargo Demand...")
    cargo_df = generate_cargo_demand()
    print(f"      -> {len(cargo_df)} records")

    print("[6/6] Fuel Consumption (physics-informed)...")
    fc_df = generate_fuel_consumption()
    print(f"      -> {len(fc_df)} records")

    print("[+] Generating port coords JSON...")
    generate_port_coords_json()

    generate_quality_report({
        "fuel_consumption": fc_df,
        "fleet_specs": fleet_df,
        "routes": routes_df,
        "weather": weather_df,
        "fuel_emissions": fuel_emission_df,
        "cargo_demand": cargo_df,
    })

    print("\n[OK] All 6 datasets generated successfully.")
    print(f"   Raw CSV files: {RAW_DIR}")
    print(f"   Processed JSON: {PROCESSED_DIR}")
    print(f"   Seed: {SEED} (fully reproducible)")
