// Analytics View — trends, costs, emissions
import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PORTS, FUELS } from '../data/offlineData';

// IPA 2022-23 port traffic trend (derived from IPA Annual Reports)
const PORT_TRAFFIC_TREND = [
  { year:2018, Kandla:114.5, Paradip:101.4, Visakhapatnam:76.2, JNPA:67.3, Mumbai:62.0 },
  { year:2019, Kandla:127.3, Paradip:109.2, Visakhapatnam:79.8, JNPA:71.6, Mumbai:63.1 },
  { year:2020, Kandla:130.1, Paradip:112.8, Visakhapatnam:81.1, JNPA:74.7, Mumbai:64.8 },
  { year:2021, Kandla:133.0, Paradip:107.4, Visakhapatnam:82.5, JNPA:75.8, Mumbai:65.1 },
  { year:2022, Kandla:141.4, Paradip:115.8, Visakhapatnam:84.3, JNPA:78.2, Mumbai:66.2 },
  { year:2023, Kandla:147.3, Paradip:121.6, Visakhapatnam:86.5, JNPA:79.6, Mumbai:67.0 },
];

const FUEL_COMPARISON = FUELS.map(f => ({
  name: f.fuel_type,
  cost: f.india_price_inr_per_mt / 1000,
  wtw_co2: f.well_to_wake_co2_g_per_mj,
  ttw_co2: f.tank_to_wake_co2_g_per_mj,
  projected: f.india_price_is_projected,
}));

const PIE_COLORS = ['#ef4444','#f97316','#3b82f6','#8b5cf6','#10b981','#f59e0b','#14b8a6'];

const PORT_TRAFFIC_2023 = PORTS.filter(p => p.traffic_mt_2022_23 > 10).map(p => ({
  name: p.name.split(' ')[0],
  traffic: p.traffic_mt_2022_23,
})).sort((a,b) => b.traffic - a.traffic);

export default function AnalyticsView() {
  return (
    <div className="p-5 space-y-5">
      <div>
        <h2 className="font-display text-xl">Analytics</h2>
        <p className="text-sm mt-1" style={{ color:'var(--text-muted)' }}>
          Indian Maritime Industry Metrics — IPA 2022-23 data
          <span className="badge badge-real ml-2">Real IPA Data</span>
        </p>
      </div>

      {/* Port traffic trend */}
      <div className="panel p-4">
        <h3 className="text-sm font-semibold mb-1">Top 5 Indian Port Traffic Trends (Million Tonnes)</h3>
        <p className="text-xs mb-3" style={{ color:'var(--text-muted)' }}>Source: IPA Annual Reports 2018–2023 <span className="badge badge-real ml-1">Real</span></p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={PORT_TRAFFIC_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="year" tick={{ fontSize:11, fill:'var(--text-muted)' }} />
            <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} unit=" MT" />
            <Tooltip contentStyle={{ background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:4, fontSize:11 }} />
            <Legend wrapperStyle={{ fontSize:11 }} />
            {['Kandla','Paradip','Visakhapatnam','JNPA','Mumbai'].map((port, i) => (
              <Line key={port} type="monotone" dataKey={port} stroke={PIE_COLORS[i]} strokeWidth={2} dot={{ r:3 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        {/* Fuel cost comparison */}
        <div className="panel p-4">
          <h3 className="text-sm font-semibold mb-1">Alternative Fuel Costs (₹ '000/MT)</h3>
          <p className="text-xs mb-3" style={{ color:'var(--text-muted)' }}>Source: PPAC India 2023, IEA 2030 projections <span className="badge badge-real ml-1">Real+Projected</span></p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={FUEL_COMPARISON}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="name" tick={{ fontSize:10, fill:'var(--text-muted)' }} />
              <YAxis tick={{ fontSize:10, fill:'var(--text-muted)' }} />
              <Tooltip contentStyle={{ background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:4, fontSize:11 }} />
              <Bar dataKey="cost" name="Cost (₹k/MT)" radius={[3,3,0,0]}>
                {FUEL_COMPARISON.map((entry, i) => (
                  <Cell key={i} fill={entry.projected ? '#fbbf24' : PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs mt-1" style={{ color:'var(--status-warning)' }}>Yellow bars = IEA 2030 projected prices</p>
        </div>

        {/* Well-to-Wake comparison */}
        <div className="panel p-4">
          <h3 className="text-sm font-semibold mb-1">Well-to-Wake CO₂ Intensity (gCO₂eq/MJ)</h3>
          <p className="text-xs mb-3" style={{ color:'var(--text-muted)' }}>Source: IMO 4th GHG Study 2020, IPCC AR6 <span className="badge badge-real ml-1">Real</span></p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={FUEL_COMPARISON} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize:10, fill:'var(--text-muted)' }} />
              <YAxis type="category" dataKey="name" width={70} tick={{ fontSize:10, fill:'var(--text-muted)' }} />
              <Tooltip contentStyle={{ background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:4, fontSize:11 }} />
              <Bar dataKey="wtw_co2" name="WtW CO₂" radius={[0,3,3,0]}>
                {FUEL_COMPARISON.map((entry, i) => (
                  <Cell key={i} fill={
                    entry.wtw_co2 < 1 ? '#10b981' :
                    entry.wtw_co2 < 2 ? '#3b82f6' :
                    entry.wtw_co2 < 3 ? '#f59e0b' : '#ef4444'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Port traffic 2023 */}
      <div className="panel p-4">
        <h3 className="text-sm font-semibold mb-1">Major Indian Port Traffic 2022-23 (Million Tonnes)</h3>
        <p className="text-xs mb-3" style={{ color:'var(--text-muted)' }}>Source: IPA Annual Report 2022-23 Table 1 <span className="badge badge-real ml-1">Real</span></p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={PORT_TRAFFIC_2023}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="name" tick={{ fontSize:10, fill:'var(--text-muted)' }} />
              <YAxis tick={{ fontSize:10, fill:'var(--text-muted)' }} unit=" MT" />
              <Tooltip contentStyle={{ background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:4, fontSize:11 }} />
              <Bar dataKey="traffic" name="Traffic (MT)" fill="var(--accent-primary)" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={PORT_TRAFFIC_2023} dataKey="traffic" nameKey="name"
                   cx="50%" cy="50%" outerRadius={90}
                   label={false}
                   labelLine={false}>
                {PORT_TRAFFIC_2023.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:4, fontSize:11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
