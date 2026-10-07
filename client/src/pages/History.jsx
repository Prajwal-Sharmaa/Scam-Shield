import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { History, Search, Trash2, Eye, Download, Filter, X, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getScans, deleteScan, deleteAllScans, getExportCsvUrl } from '../services/api';
import { getRiskColor, CATEGORY_LABELS, SOURCE_LABELS, formatDate, truncate } from '../utils/constants';
import ScanResult from '../components/ScanResult';

const RISK_LEVELS = ['Safe', 'Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highest', label: 'Highest risk' },
  { value: 'lowest', label: 'Lowest risk' },
];

export default function HistoryPage() {
  const [scans, setScans] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedScan, setSelectedScan] = useState(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [error, setError] = useState('');

  const loadScans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getScans({ page, limit: 15, search, riskLevel, sortBy });
      setScans(res.scans || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch {
      setError('Failed to load history.');
    }
    setLoading(false);
  }, [page, search, riskLevel, sortBy]);

  useEffect(() => { loadScans(); }, [loadScans]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, riskLevel, sortBy]);

  async function handleDelete(id) {
    try {
      await deleteScan(id);
      setScans(prev => prev.filter(s => s.id !== id));
      setTotal(t => t - 1);
      if (selectedScan?.id === id) setSelectedScan(null);
    } catch {
      setError('Failed to delete scan.');
    }
  }

  async function handleDeleteAll() {
    try {
      await deleteAllScans();
      setScans([]);
      setTotal(0);
      setShowDeleteAll(false);
      setSelectedScan(null);
    } catch {
      setError('Failed to delete all scans.');
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="text-teal-400" size={24} /> Scan History
          </h1>
          <p className="text-slate-400 text-sm mt-1">All saved scans from local demo storage. {total} total.</p>
        </div>
        <div className="flex gap-2">
          <a
            href={getExportCsvUrl()}
            download
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-colors"
          >
            <Download size={14} /> Export CSV
          </a>
          {scans.length > 0 && (
            <button
              onClick={() => setShowDeleteAll(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-700/20 hover:bg-red-700/30 text-red-400 rounded-xl text-sm border border-red-700/30 transition-colors"
            >
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search messages, URLs, categories…"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={riskLevel}
          onChange={e => setRiskLevel(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">All Risk Levels</option>
          {RISK_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {(search || riskLevel) && (
          <button
            onClick={() => { setSearch(''); setRiskLevel(''); }}
            className="flex items-center gap-1 text-slate-400 hover:text-white text-sm px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl transition-colors"
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {error && <div className="bg-red-900/20 border border-red-700/30 text-red-400 rounded-xl p-3 text-sm">{error}</div>}

      {/* Scan detail modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center p-4 pt-16 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-700">
              <h2 className="text-white font-semibold">Scan Details #{selectedScan.id}</h2>
              <button onClick={() => setSelectedScan(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <ScanResult
                result={{
                  ...selectedScan,
                  scanType: selectedScan.scan_type,
                  sourceType: selectedScan.source_type,
                  originalContent: selectedScan.original_content,
                  riskScore: selectedScan.risk_score,
                  riskLevel: selectedScan.risk_level,
                  highlightedContent: selectedScan.highlighted_content,
                  redFlags: selectedScan.redFlags || [],
                  recommendations: selectedScan.recommendations || [],
                }}
                savedId={selectedScan.id}
                onReset={() => {
                  setSelectedScan(null);
                  loadScans();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete all confirm */}
      {showDeleteAll && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={22} className="text-red-400" />
              <h2 className="text-white font-semibold">Clear All History?</h2>
            </div>
            <p className="text-slate-400 text-sm mb-5">This will permanently delete all {total} saved scans. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteAll(false)} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-colors">Cancel</button>
              <button onClick={handleDeleteAll} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm transition-colors">Delete All</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading scans…</p>
        </div>
      ) : scans.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-700/50">
          <History size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No scans found. {search || riskLevel ? 'Try different filters.' : 'Scan a message or URL to get started.'}</p>
          <Link to="/scan-message" className="mt-4 inline-block text-blue-400 text-sm hover:text-blue-300">Start scanning →</Link>
        </div>
      ) : (
        <>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800 text-slate-400 text-left">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Content</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Risk</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {scans.map(scan => {
                    const rc = getRiskColor(scan.risk_level);
                    return (
                      <tr key={scan.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 text-slate-500">#{scan.id}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                            {SOURCE_LABELS[scan.source_type] || scan.scan_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300 max-w-xs">
                          {truncate(scan.original_content, 55)}
                          {scan.is_false_positive ? <span className="ml-1 text-xs text-amber-400">[FP]</span> : null}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">{CATEGORY_LABELS[scan.category] || scan.category}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rc.bg} ${rc.text}`}>
                            {scan.risk_level}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{scan.risk_score}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(scan.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedScan(scan)}
                              className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(scan.id)}
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-slate-400 text-sm">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
