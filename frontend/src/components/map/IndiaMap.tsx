// IndiaMap — Leaflet-based map with Indian ports, shipping lanes, vessels
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { PORTS, ROUTES } from '../../data/offlineData';
import { useAppStore } from '../../store/appStore';

interface IndiaMapProps {
  interactive?: boolean;
  showVessels?: boolean;
  showRoutes?: boolean;
  selectedRoute?: string;
  onPortClick?: (portId: string) => void;
  height?: string;
}

function interpolatePosition(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
  progress: number
): [number, number] {
  return [
    lat1 + (lat2 - lat1) * progress,
    lon1 + (lon2 - lon1) * progress,
  ];
}

export default function IndiaMap({
  interactive = true,
  showVessels = true,
  showRoutes = true,
  selectedRoute,
  onPortClick,
  height = '100%',
}: IndiaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const { simulationTick, optimizationResult, focusedVessel } = useAppStore();
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;
    let mounted = true;

    import('leaflet').then((leafletModule) => {
      if (!mounted || !mapRef.current) return;
      const L: any = leafletModule.default || leafletModule;

      if (mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: [20, 80],
        zoom: 5,
        zoomControl: interactive,
        scrollWheelZoom: interactive,
        dragging: interactive,
        attributionControl: false,
      });

      // Free OSM-based dark tile — no API key required
      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          opacity: 0.5,
          attribution: '© OpenStreetMap contributors',
        }
      ).addTo(map);

      PORTS.forEach(port => {
        const isWest = port.coast === 'west';
        const color = isWest ? '#1aa69f' : '#3b82f6';
        const html = `<div style="width:13px;height:13px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 0 8px ${color};cursor:pointer;"></div>`;
        const icon = L.divIcon({ html, className: '', iconSize: [13, 13], iconAnchor: [6, 6] });
        const marker = L.marker([port.lat, port.lon], { icon })
          .addTo(map)
          .bindTooltip(`<b>${port.name}</b><br/>${port.state}<br/>${port.traffic_mt_2022_23} MT (2022-23)`, {
            permanent: false, direction: 'top', offset: [0, -8],
          });
        if (onPortClick) {
          marker.on('click', () => onPortClick(port.id));
        }
      });

      if (showRoutes) {
        ROUTES.forEach(route => {
          const isSelected = route.route_id === selectedRoute;
          const points: [number, number][] = [
            [route.origin_lat, route.origin_lon],
            [route.dest_lat, route.dest_lon],
          ];
          L.polyline(points, {
            color: isSelected ? '#1aa69f' : '#60a5fa',
            weight: isSelected ? 3 : 2,
            opacity: isSelected ? 1.0 : 0.6,
            dashArray: '8 5',
          }).addTo(map);
        });
      }

      mapInstanceRef.current = map;
      setMapReady(true);
    });

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapReady || !showVessels || !mapInstanceRef.current) return;

    import('leaflet').then((leafletModule) => {
      const L: any = leafletModule.default || leafletModule;
      markersRef.current.forEach((m: any) => m.remove());
      markersRef.current = [];

      const plan = optimizationResult?.fleet_plan || [];
      plan.forEach((vessel, idx) => {
        const route = ROUTES.find(r => r.route_id === vessel.route_id);
        if (!route) return;

        const progress = (simulationTick * 0.003 + idx * 0.2) % 1;
        const [lat, lon] = interpolatePosition(
          route.origin_lat, route.origin_lon,
          route.dest_lat, route.dest_lon,
          progress
        );

        const isFocused = vessel.vessel_id === focusedVessel;
        const color = vessel.fuel_type === 'Hydrogen' ? '#10b981'
                    : vessel.fuel_type === 'Methanol' ? '#3cb99f'
                    : vessel.fuel_type === 'LNG' ? '#1aa69f'
                    : '#f59e0b';

        const size = isFocused ? 14 : 11;
        const html = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${isFocused ? 3 : 2}px solid white;box-shadow:0 0 ${isFocused ? 12 : 6}px ${color}88;transition:all 0.3s;"></div>`;
        const icon = L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });

        const marker = L.marker([lat, lon], { icon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="font-size:13px;min-width:180px">
              <b>${vessel.vessel_name}</b>
              <hr style="margin:4px 0;border-color:#e5e7eb"/>
              <div><b>Route:</b> ${vessel.origin_port} → ${vessel.destination_port}</div>
              <div><b>Fuel:</b> ${vessel.fuel_type}</div>
              <div><b>Speed:</b> ${vessel.assigned_speed_knots} kn</div>
              <div><b>Load:</b> ${vessel.cargo_load_pct}%</div>
              <div><b>Fuel:</b> ${vessel.fuel_mt.toFixed(1)} MT</div>
              <div><b>CO₂:</b> ${vessel.co2_t.toFixed(1)} t</div>
              <div><b>ETA:</b> ${vessel.eta_hours.toFixed(1)} h</div>
            </div>
          `);
        markersRef.current.push(marker);
      });
    });
  }, [simulationTick, mapReady, showVessels, focusedVessel, optimizationResult]);

  return (
    <div ref={mapRef} style={{ width: '100%', height, background: '#0d2040' }}>
      {!mapReady && (
        <div className="flex items-center justify-center h-full"
             style={{ background: '#0d2040', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
          Loading map…
        </div>
      )}
    </div>
  );
}
