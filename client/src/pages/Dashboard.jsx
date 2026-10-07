import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle, MessageSquare, Link2, TrendingUp, Zap, ArrowRight, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getAnalytics, getDemoData, analyzeMessage } from '../services/api';
import { getRiskColor, CATEGORY_LABELS, SOURCE_LABELS, formatDate, truncate } from '../utils/constants';
import { getScans } from '../services/api';

const RISK_PALETTE = {
  Safe: '#10b981', 'Low Risk': '#3b82f6', 'Medium Risk': '#f59e0b',
  'High Risk': '#f97316', 'Critical Risk': '#ef4444'
};

function StatCard({ icon: Icon, label, value, color = 'text-white', sub }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-sm">{label}</span>
        <Icon size={18} className={color} />
      </div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-slate-500 text-xs mt-1">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [demos, setDemos] = useState([]);
  const [quickText, setQuickText] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [analyticsRes, scansRes, demosRes] = await Promise.all([
          getAnalytics(),
          getScans({ limit: 6, sortBy: 'newest' }),
          getDemoData()
        ]);
        setAnalytics(analyticsRes.analytics);
        setRecentScans(scansRes.scans || []);
        setDemos(demosRes.examples || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleQuickScan(e) {
    e.preventDefault();
    if (!quickText.trim()) return;
    setAnalyzing(true);
    try {
      const res = await analyzeMessage(quickText, 'other', '');
      navigate('/scan-message', { state: { result: res.result, prefilled: quickText } });
    } catch {
      navigate('/scan-message', { state: { prefilled: quickText } });
    }
    setAnalyzing(false);
  }

  function handleDemoClick(demo) {
    if (demo.type === 'url') {
      navigate('/scan-url', { state: { prefilled: demo.text } });
    } else {
      navigate('/scan-message', { state: { prefilled: demo.text, sourceType: demo.sourceType } });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const a = analytics || {};
  const riskPieData = (a.riskDistribution || []).map(r => ({
    name: r.risk_level, value: r.count, fill: RISK_PALETTE[r.risk_level] || '#64748b'
  }));
  const catBarData = (a.categoryDistribution || []).slice(0, 7).map(c => ({
    name: CATEGORY_LABELS[c.category] || c.category, count: c.count
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="text-blue-400" size={26} /> ScamShield AI
          </h1>
          <p className="text-slate-400 mt-1">Analyze suspicious messages before they harm you.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/scan-message" className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
            <MessageSquare size={15} /> Scan Message
          </Link>
          <Link to="/scan-url" className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors">
            <Link2 size={15} /> Scan URL
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Shield} label="Total Scans" value={a.totalScans || 0} color="text-blue-400" />
        <StatCard icon={AlertTriangle} label="High-Risk Threats" value={a.highRisk || 0} color="text-red-400" sub="High + Critical" />
        <StatCard icon={CheckCircle} label="Safe Scans" value={a.safeScans || 0} color="text-emerald-400" />
        <StatCard icon={TrendingUp} label="Top Scam Type" value={(CATEGORY_LABELS[a.topCategory] || a.topCategory || '–').split(' ')[0]} color="text-amber-400" sub={CATEGORY_LABELS[a.topCategory] || ''} />
      </div>

      {/* Quick Scan */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-3 flex items-center gap-2"><Zap size={17} className="text-amber-400" /> Quick Scan</h2>
        <form onSubmit={handleQuickScan} className="flex gap-3">
          <input
            type="text"
            value={quickText}
            onChange={e => setQuickText(e.target.value)}
            placeholder="Paste a suspicious message here…"
            className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={analyzing || !quickText.trim()}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
          >
            {analyzing ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spin" /> : <ArrowRight size={15} />}
            Analyze
          </button>
        </form>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Risk Distribution</h2>
          {riskPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={riskPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {riskPieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No scan data yet</div>}
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Scams by Category</h2>
          {catBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catBarData} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No scan data yet</div>}
        </div>
      </div>

      {/* Recent Scans */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2"><Clock size={16} className="text-slate-400" /> Recent Scans</h2>
          <Link to="/history" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">View all <ArrowRight size={13} /></Link>
        </div>
        {recentScans.length === 0 ? (
          <div className="text-slate-500 text-sm text-center py-8">No scans yet. Try scanning a message!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-left border-b border-slate-700">
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Content</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4">Risk</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentScans.map(scan => {
                  const rc = getRiskColor(scan.risk_level);
                  return (
                    <tr key={scan.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 pr-4">
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                          {SOURCE_LABELS[scan.source_type] || scan.scan_type}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-300 max-w-xs">{truncate(scan.original_content, 60)}</td>
                      <td className="py-3 pr-4 text-slate-400 text-xs">{CATEGORY_LABELS[scan.category] || scan.category}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rc.bg} ${rc.text}`}>
                          {scan.risk_level}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(scan.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Demo Examples */}
      {demos.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-2">🧪 Try Demo Examples</h2>
          <p className="text-slate-400 text-sm mb-4">Click a sample to analyze it instantly.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {demos.map(demo => (
              <button
                key={demo.id}
                onClick={() => handleDemoClick(demo)}
                className="text-left bg-slate-900 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 rounded-xl p-4 transition-all group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${demo.type === 'url' ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'}`}>
                    {demo.type === 'url' ? 'URL' : SOURCE_LABELS[demo.sourceType] || 'Message'}
                  </span>
                </div>
                <div className="text-sm text-white font-medium mb-1">{demo.label}</div>
                <div className="text-xs text-slate-500 line-clamp-2">{truncate(demo.text, 80)}</div>
                <div className="text-xs text-blue-400 mt-2 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Analyze <ArrowRight size={11} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
