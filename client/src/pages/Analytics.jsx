import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Lightbulb, Shield } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line, CartesianGrid
} from 'recharts';
import { getAnalytics } from '../services/api';
import { CATEGORY_LABELS, SOURCE_LABELS } from '../utils/constants';

const RISK_PALETTE = {
  Safe: '#10b981', 'Low Risk': '#3b82f6', 'Medium Risk': '#f59e0b',
  'High Risk': '#f97316', 'Critical Risk': '#ef4444'
};
const BAR_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#6366f1'];

const tooltipStyle = { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' };

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(res => setData(res.analytics))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-slate-400">
        Failed to load analytics. Is the server running?
      </div>
    );
  }

  const riskPie = (data.riskDistribution || []).map(r => ({
    name: r.risk_level, value: r.count, fill: RISK_PALETTE[r.risk_level] || '#64748b'
  }));

  const catBar = (data.categoryDistribution || []).slice(0, 8).map((c, i) => ({
    name: CATEGORY_LABELS[c.category] || c.category, count: c.count, fill: BAR_COLORS[i % BAR_COLORS.length]
  }));

  const sourceBar = (data.sourceDistribution || []).map((s, i) => ({
    name: SOURCE_LABELS[s.source_type] || s.source_type || 'Unknown',
    count: s.count, fill: BAR_COLORS[i % BAR_COLORS.length]
  }));

  const timeline = (data.scansOverTime || []).map(d => ({
    date: d.date?.slice(5), // MM-DD
    scans: d.count
  }));

  const topFlags = (data.topRedFlags || []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="text-purple-400" size={24} /> Analytics
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Insights from {data.totalScans} scans in local demo storage.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Scans', value: data.totalScans, color: 'text-blue-400' },
          { label: 'High-Risk Threats', value: data.highRisk, color: 'text-red-400' },
          { label: 'Safe Scans', value: data.safeScans, color: 'text-emerald-400' },
          { label: 'Top Category', value: (CATEGORY_LABELS[data.topCategory] || '–').split(' ')[0], color: 'text-amber-400' },
        ].map(c => (
          <div key={c.label} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <div className="text-slate-400 text-sm mb-2">{c.label}</div>
            <div className={`text-3xl font-bold ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Risk & Category charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Risk Level Distribution</h2>
          {riskPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={riskPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}
                  label={({ name, value }) => `${name.split(' ')[0]}: ${value}`} labelLine={true}>
                  {riskPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-56 flex items-center justify-center text-slate-500 text-sm">No data</div>}
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Scam Category Breakdown</h2>
          {catBar.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={catBar} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {catBar.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-56 flex items-center justify-center text-slate-500 text-sm">No data</div>}
        </div>
      </div>

      {/* Timeline & Source */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Scans Over Time (Last 14 Days)</h2>
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="scans" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No recent scan data</div>}
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Source Type Breakdown</h2>
          {sourceBar.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sourceBar} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {sourceBar.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No data</div>}
        </div>
      </div>

      {/* Top Red Flags */}
      {topFlags.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Most Common Red Flags</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topFlags} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={180} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Safety Insights */}
      {data.insights?.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Lightbulb size={17} className="text-amber-400" /> Safety Insights
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {data.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
                <Shield size={15} className="text-blue-400 mt-0.5 shrink-0" />
                <p className="text-slate-300 text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
