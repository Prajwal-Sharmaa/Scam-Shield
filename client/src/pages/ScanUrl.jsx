import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Link2, Search } from 'lucide-react';
import ScanResult from '../components/ScanResult';
import { analyzeUrl } from '../services/api';

export default function ScanUrl() {
  const location = useLocation();
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state?.prefilled) {
      setUrl(location.state.prefilled);
    }
  }, [location.state]);

  function validateUrl(val) {
    try {
      const u = new URL(val.startsWith('http') ? val : `https://${val}`);
      return u.hostname.includes('.');
    } catch { return false; }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const trimmed = url.trim();
    if (!trimmed) { setError('Please enter a URL.'); return; }
    if (!validateUrl(trimmed)) { setError('Please enter a valid URL (e.g., https://example.com).'); return; }

    setLoading(true);
    try {
      const res = await analyzeUrl(trimmed);
      setResult(res.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Is the server running?');
    }
    setLoading(false);
  }

  function handleReset() {
    setResult(null);
    setUrl('');
    setError('');
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Link2 className="text-purple-400" size={24} /> URL Scanner
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Analyze suspicious URLs for phishing indicators. <strong className="text-amber-400">The URL is never opened or visited.</strong></p>
      </div>

      <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 text-sm text-amber-300">
        ⚠️ <strong>Disclaimer:</strong> This scan is a local educational analysis. The URL is NOT opened, fetched, or visited at any point.
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Suspicious URL <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="e.g., http://suspicious-site.xyz/login?ref=bank"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-700/30 text-red-400 rounded-xl p-3 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spin" /> Analyzing…</>
            ) : (
              <><Search size={16} /> Analyze URL</>
            )}
          </button>

          {/* URL pattern info */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <h3 className="text-white text-sm font-medium mb-3">What we check:</h3>
            <ul className="space-y-1 text-xs text-slate-400">
              {[
                'HTTPS encryption status',
                'URL shortener detection (bit.ly, tinyurl, etc.)',
                'IP address-based URLs',
                'Excessive subdomains',
                'Suspicious keywords (login, verify, reward, urgent…)',
                'Typosquatting (paypa1, g00gle, faceb00k…)',
                'Unusual TLDs (.xyz, .tk, .ml…)',
                'Excessive hyphens and query parameters'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-blue-400">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </form>
      ) : (
        <ScanResult result={result} onReset={handleReset} />
      )}
    </div>
  );
}
