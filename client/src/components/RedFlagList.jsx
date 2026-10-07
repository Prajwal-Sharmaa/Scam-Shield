import { getRiskColor } from '../utils/constants';
import { SEVERITY_COLORS } from '../utils/constants';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

const SEVERITY_ICONS = {
  critical: AlertCircle,
  high: AlertTriangle,
  medium: AlertTriangle,
  low: Info,
};

export default function RedFlagList({ flags = [] }) {
  if (!flags.length) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
        <CheckCircle size={18} />
        <span className="text-sm">No significant red flags detected.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {flags.map((flag, i) => {
        const colors = SEVERITY_COLORS[flag.severity] || SEVERITY_COLORS.low;
        const Icon = SEVERITY_ICONS[flag.severity] || Info;

        return (
          <div key={i} className={`rounded-xl border p-4 ${colors.bg} ${colors.text.replace('text-', 'border-').replace('-400', '-500/20')}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Icon size={16} className={colors.text} />
                <span className={`font-semibold text-sm ${colors.text}`}>{flag.title}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${colors.badge}`}>
                {flag.severity}
              </span>
            </div>

            <p className="text-slate-300 text-sm mb-2">{flag.explanation}</p>

            {flag.matchedPhrases?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs text-slate-500 mr-1">Detected:</span>
                {flag.matchedPhrases.map((phrase, j) => (
                  <span key={j} className="text-xs bg-slate-700/60 text-amber-300 px-2 py-0.5 rounded font-mono">
                    "{phrase}"
                  </span>
                ))}
              </div>
            )}

            <div className="mt-2 text-xs text-slate-500">
              Score contribution: +{flag.scoreContribution || flag.score_contribution} pts
            </div>
          </div>
        );
      })}
    </div>
  );
}
