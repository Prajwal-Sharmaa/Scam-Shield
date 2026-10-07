import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, Send } from 'lucide-react';
import ScanResult from '../components/ScanResult';
import { analyzeMessage } from '../services/api';

const SOURCE_TYPES = [
  { value: 'sms', label: 'SMS' },
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram_dm', label: 'Instagram / DM' },
  { value: 'call_transcript', label: 'Call Transcript' },
  { value: 'other', label: 'Other' },
];

export default function ScanMessage() {
  const location = useLocation();
  const [text, setText] = useState('');
  const [sourceType, setSourceType] = useState('sms');
  const [sender, setSender] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill if navigated from dashboard
  useEffect(() => {
    if (location.state?.prefilled) {
      setText(location.state.prefilled);
      if (location.state.sourceType) setSourceType(location.state.sourceType);
    }
    if (location.state?.result) {
      setResult(location.state.result);
      setText(location.state.prefilled || '');
    }
  }, [location.state]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const trimmed = text.trim();
    if (!trimmed) { setError('Please enter a message to analyze.'); return; }
    if (trimmed.length < 10) { setError('Message must be at least 10 characters.'); return; }

    setLoading(true);
    try {
      const res = await analyzeMessage(trimmed, sourceType, sender);
      setResult(res.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Is the server running?');
    }
    setLoading(false);
  }

  function handleReset() {
    setResult(null);
    setText('');
    setSender('');
    setError('');
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="text-blue-400" size={24} /> Message & Email Scanner
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Paste suspicious SMS, email, WhatsApp, or DM content to analyze it.</p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source type */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Message Source</label>
            <div className="flex flex-wrap gap-2">
              {SOURCE_TYPES.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSourceType(s.value)}
                  className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                    sourceType === s.value
                      ? 'bg-blue-600 border-blue-500 text-white font-medium'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sender */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Sender (optional)</label>
            <input
              type="text"
              value={sender}
              onChange={e => setSender(e.target.value)}
              placeholder="e.g., +91-XXXXXX1234 or noreply@example.com"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Message text */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Message / Email Content <span className="text-red-400">*</span>
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={8}
              placeholder="Paste the suspicious message here…"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${text.length < 10 && text.length > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                {text.length} / 5000 characters
              </span>
              {text.length < 10 && text.length > 0 && (
                <span className="text-xs text-red-400">Minimum 10 characters required</span>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-700/30 text-red-400 rounded-xl p-3 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || text.trim().length < 10}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spin" /> Analyzing…</>
            ) : (
              <><Send size={16} /> Analyze Message</>
            )}
          </button>
        </form>
      ) : (
        <ScanResult result={result} onReset={handleReset} />
      )}
    </div>
  );
}
