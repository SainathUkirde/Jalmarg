# Data Quality Report

## fuel_consumption
- Records: 5000
- Columns: ['vessel_id', 'vessel_type', 'capacity_dwt', 'speed_knots', 'cargo_load_pct', 'distance_nm', 'fuel_type', 'wave_height_m', 'route_id', 'origin_port', 'destination_port', 'fuel_consumption_mt', 'travel_hours', 'fuel_cost_inr_lakh', 'co2_emissions_t', 'operational_mode', 'data_source']
- Null percentages: {'vessel_id': 0.0, 'vessel_type': 0.0, 'capacity_dwt': 0.0, 'speed_knots': 0.0, 'cargo_load_pct': 0.0, 'distance_nm': 0.0, 'fuel_type': 0.0, 'wave_height_m': 0.0, 'route_id': 0.0, 'origin_port': 0.0, 'destination_port': 0.0, 'fuel_consumption_mt': 0.0, 'travel_hours': 0.0, 'fuel_cost_inr_lakh': 0.0, 'co2_emissions_t': 0.0, 'operational_mode': 0.0, 'data_source': 0.0}

## fleet_specs
- Records: 150
- Columns: ['vessel_id', 'vessel_name', 'vessel_type', 'flag_state', 'year_built', 'gross_tonnage', 'deadweight_tonnage', 'length_overall_m', 'engine_power_kw', 'design_speed_knots', 'fuel_compatibility', 'imo_number', 'capacity_teu', 'operator', 'home_port', 'shore_power_compatible', 'data_source']
- Null percentages: {'vessel_id': 0.0, 'vessel_name': 0.0, 'vessel_type': 0.0, 'flag_state': 0.0, 'year_built': 0.0, 'gross_tonnage': 0.0, 'deadweight_tonnage': 0.0, 'length_overall_m': 0.0, 'engine_power_kw': 0.0, 'design_speed_knots': 0.0, 'fuel_compatibility': 0.0, 'imo_number': 0.0, 'capacity_teu': 0.0, 'operator': 0.0, 'home_port': 0.0, 'shore_power_compatible': 0.0, 'data_source': 0.0}

## routes
- Records: 60
- Columns: ['route_id', 'origin_port', 'destination_port', 'distance_nm', 'typical_transit_hours', 'sea_lane', 'origin_lat', 'origin_lon', 'dest_lat', 'dest_lon', 'avg_wave_height_m', 'avg_wind_speed_knots', 'monsoon_factor', 'data_source']
- Null percentages: {'route_id': 0.0, 'origin_port': 0.0, 'destination_port': 0.0, 'distance_nm': 0.0, 'typical_transit_hours': 0.0, 'sea_lane': 0.0, 'origin_lat': 0.0, 'origin_lon': 0.0, 'dest_lat': 0.0, 'dest_lon': 0.0, 'avg_wave_height_m': 0.0, 'avg_wind_speed_knots': 0.0, 'monsoon_factor': 0.0, 'data_source': 0.0}

## weather
- Records: 1080
- Columns: ['zone_id', 'year', 'month', 'season', 'wave_height_m', 'wind_speed_knots', 'wind_direction_deg', 'sea_surface_temp_c', 'visibility_km', 'data_source']
- Null percentages: {'zone_id': 0.0, 'year': 0.0, 'month': 0.0, 'season': 0.0, 'wave_height_m': 0.0, 'wind_speed_knots': 0.0, 'wind_direction_deg': 0.0, 'sea_surface_temp_c': 0.0, 'visibility_km': 0.0, 'data_source': 0.0}

## fuel_emissions
- Records: 7
- Columns: ['fuel_type', 'energy_density_mj_kg', 'tank_to_wake_co2_g_per_mj', 'well_to_wake_co2_g_per_mj', 'india_price_inr_per_mt', 'india_price_is_projected', 'imo_cii_pathway', 'india_availability', 'ch4_gwp100_factor', 'n2o_gwp100_factor', 'relative_cost_index', 'notes', 'data_source']
- Null percentages: {'fuel_type': 0.0, 'energy_density_mj_kg': 0.0, 'tank_to_wake_co2_g_per_mj': 0.0, 'well_to_wake_co2_g_per_mj': 0.0, 'india_price_inr_per_mt': 0.0, 'india_price_is_projected': 0.0, 'imo_cii_pathway': 0.0, 'india_availability': 0.0, 'ch4_gwp100_factor': 0.0, 'n2o_gwp100_factor': 0.0, 'relative_cost_index': 0.0, 'notes': 0.0, 'data_source': 0.0}

## cargo_demand
- Records: 468
- Columns: ['port_name', 'year', 'commodity_type', 'volume_mt', 'growth_rate_pct', 'market_share_pct', 'data_source']
- Null percentages: {'port_name': 0.0, 'year': 0.0, 'commodity_type': 0.0, 'volume_mt': 0.0, 'growth_rate_pct': 0.0, 'market_share_pct': 0.0, 'data_source': 0.0}

