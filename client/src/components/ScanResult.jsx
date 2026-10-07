import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskGauge from './RiskGauge';
import RedFlagList from './RedFlagList';
import { getRiskColor, CATEGORY_LABELS, SOURCE_LABELS, formatDate, truncate } from '../utils/constants';
import { saveScan, deleteScan, markFalsePositive } from '../services/api';
import { Save, Copy, RotateCcw, Flag, Trash2, CheckCircle, Shield, ExternalLink } from 'lucide-react';

export default function ScanResult({ result, onReset, savedId: initialSavedId }) {
  const navigate = useNavigate();
  const [savedId, setSavedId] = useState(initialSavedId || null);
  const [copied, setCopied] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [markedFP, setMarkedFP] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const rc = getRiskColor(result.riskLevel);
  const category = CATEGORY_LABELS[result.category] || result.category || 'Unknown';

  async function handleSave() {
    if (savedId) return;
    setSaving(true);
    setError('');
    try {
      const res = await saveScan(result);
      setSavedId(res.id);
    } catch {
      setError('Failed to save. Is the server running?');
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!savedId) return;
    try {
      await deleteScan(savedId);
      setDeleted(true);
    } catch {
      setError('Failed to delete.');
    }
  }

  async function handleMarkFP() {
    if (!savedId || markedFP) return;
    try {
      await markFalsePositive(savedId);
      setMarkedFP(true);
    } catch {
      setError('Failed to mark false positive.');
    }
  }

  function handleCopy() {
    const text = [
      `ScamShield AI Scan Result`,
      `Risk Level: ${result.riskLevel} (${result.riskScore}/100)`,
      `Category: ${category}`,
      `Confidence: ${result.confidence}%`,
      `Explanation: ${result.explanation}`,
      `\nRed Flags (${result.redFlags?.length || 0}):`,
      ...(result.redFlags || []).map(f => `  • ${f.title} [${f.severity}]: ${f.explanation}`),
      `\nRecommendations:`,
      ...(result.recommendations || []).map(r => `  • ${r}`),
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (deleted) {
    return (
      <div className="text-center py-12 fade-in">
        <div className="text-slate-400 mb-4">Scan deleted.</div>
        <button onClick={onReset} className="btn-primary">Scan Another</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Risk Score Header */}
      <div className={`rounded-2xl border p-6 ${rc.bg} ${rc.border}`}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <RiskGauge score={result.riskScore} size={140} />
          <div className="flex-1 text-center md:text-left">
            <div className={`text-3xl font-bold mb-1 ${rc.text}`}>{result.riskLevel}</div>
            <div className="text-slate-400 text-sm mb-3">
              Category: <span className="text-white font-medium">{category}</span>
              {' '}· Confidence: <span className="text-white font-medium">{result.confidence}%</span>
              {result.sourceType && <span> · Source: <span className="text-white font-medium">{SOURCE_LABELS[result.sourceType] || result.sourceType}</span></span>}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{result.explanation}</p>
            {markedFP && (
              <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle size={12} /> Marked as false positive
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {!savedId ? (
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
            <Save size={15} />{saving ? 'Saving…' : 'Save Scan'}
          </button>
        ) : (
          <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 text-sm border border-emerald-600/30">
            <CheckCircle size={15} /> Saved (#{savedId})
          </span>
        )}
        <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm transition-colors">
          <Copy size={15} />{copied ? 'Copied!' : 'Copy Result'}
        </button>
        <button onClick={onReset} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm transition-colors">
          <RotateCcw size={15} /> Scan Another
        </button>
        {savedId && !markedFP && (
          <button onClick={handleMarkFP} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-700/20 hover:bg-amber-700/30 text-amber-400 text-sm border border-amber-700/30 transition-colors">
            <Flag size={15} /> False Positive
          </button>
        )}
        {savedId && (
          <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-700/20 hover:bg-red-700/30 text-red-400 text-sm border border-red-700/30 transition-colors">
            <Trash2 size={15} /> Delete
          </button>
        )}
      </div>

      {error && <div className="text-red-400 text-sm bg-red-900/20 border border-red-700/30 rounded-xl p-3">{error}</div>}

      {/* Highlighted content */}
      {result.highlightedContent && (
        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Shield size={16} className="text-blue-400" /> Analyzed Content
          </h3>
          <div
            className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: result.highlightedContent }}
          />
          <p className="text-xs text-slate-500 mt-3">⚠️ Highlighted phrases are suspicious indicators found in the message.</p>
        </div>
      )}

      {/* Red Flags */}
      <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Shield size={16} className="text-orange-400" />
          Red Flags Detected ({result.redFlags?.length || 0})
        </h3>
        <RedFlagList flags={result.redFlags || []} />
      </div>

      {/* Recommendations */}
      <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5">
        <h3 className="text-white font-semibold mb-3">🛡️ What should you do now?</h3>
        <ul className="space-y-2">
          {(result.recommendations || []).map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-blue-400 mt-0.5 shrink-0">→</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* URL analysis extras */}
      {result.scanType === 'url' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5">
          <h3 className="text-white font-semibold mb-3">URL Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500">Domain</span>
              <div className="text-white font-mono mt-1">{result.domain}</div>
            </div>
            <div>
              <span className="text-slate-500">HTTPS</span>
              <div className={`mt-1 font-medium ${result.isHttps ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.isHttps ? '✓ Yes' : '✗ No'}
              </div>
            </div>
          </div>
          <p className="text-xs text-amber-400 bg-amber-900/20 border border-amber-700/30 rounded-lg p-2 mt-4">
            ⚠️ Disclaimer: This scan is a local educational analysis. The URL was NOT opened or fetched.
          </p>
        </div>
      )}
    </div>
  );
}
