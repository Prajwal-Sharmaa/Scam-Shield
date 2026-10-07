import { Shield, BookOpen, AlertTriangle, Code2, Database, Cpu } from 'lucide-react';

export default function About() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="text-blue-400" size={24} /> About ScamShield AI
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Educational cybersecurity project – how it works and why it exists.</p>
      </div>

      {/* Warning */}
      <div className="bg-amber-900/20 border border-amber-700/30 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-amber-300 font-semibold mb-1">Important Disclaimer</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              ScamShield AI is a <strong>local educational demo tool</strong> built for academic purposes.
              It uses rule-based pattern matching — not AI APIs or live databases. It <strong>does not guarantee</strong> detection
              of all scams and should never be your only defense. Always use common sense, official verification, and your bank's helpline.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Code2 size={17} className="text-blue-400" /> Technology Stack</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { layer: 'Frontend', tech: 'React 18 + Vite', color: 'text-blue-400' },
            { layer: 'Styling', tech: 'Tailwind CSS', color: 'text-teal-400' },
            { layer: 'Charts', tech: 'Recharts', color: 'text-purple-400' },
            { layer: 'Icons', tech: 'Lucide React', color: 'text-slate-300' },
            { layer: 'Backend', tech: 'Node.js + Express', color: 'text-green-400' },
            { layer: 'Database', tech: 'SQLite (better-sqlite3)', color: 'text-amber-400' },
            { layer: 'HTTP Client', tech: 'Axios', color: 'text-slate-300' },
            { layer: 'Routing', tech: 'React Router v6', color: 'text-pink-400' },
          ].map(t => (
            <div key={t.layer} className="flex justify-between bg-slate-900/60 rounded-xl p-3 text-sm">
              <span className="text-slate-400">{t.layer}</span>
              <span className={`font-medium ${t.color}`}>{t.tech}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Cpu size={17} className="text-purple-400" /> How the Analysis Works</h2>
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>ScamShield AI uses a multi-stage <strong className="text-white">explainable rule-based analysis engine</strong>:</p>
          <ol className="space-y-3 list-none">
            {[
              { step: '1. Pattern Detection', desc: 'The redFlagDetector scans the message against 20+ regex-based pattern groups covering urgency, OTP theft, financial bait, bank impersonation, fake jobs, and more.' },
              { step: '2. Severity Weighting', desc: 'Each matched pattern has a predefined score contribution and severity (critical, high, medium, low). Weights are applied to each match.' },
              { step: '3. Diminishing Returns Scoring', desc: 'Score = 100 × (1 − e^(−rawTotal/60)). This ensures a single critical flag gives ~30 points but 5 overlapping flags don\'t trivially reach 100.' },
              { step: '4. Category Detection', desc: 'The dominant scam category is determined by summing score contributions per category tag across all matched flags.' },
              { step: '5. Explanation & Recommendations', desc: 'Natural-language explanations and safety actions are generated based on risk level and detected category.' },
            ].map(s => (
              <li key={s.step} className="flex gap-3">
                <span className="text-blue-400 font-semibold shrink-0">{s.step}:</span>
                <span>{s.desc}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Risk Levels */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-4">Risk Level Scale</h2>
        <div className="space-y-2">
          {[
            { range: '0–20', level: 'Safe', color: 'text-emerald-400', desc: 'No significant scam indicators found.' },
            { range: '21–40', level: 'Low Risk', color: 'text-blue-400', desc: 'Minor suspicious signals. Verify before acting.' },
            { range: '41–60', level: 'Medium Risk', color: 'text-amber-400', desc: 'Multiple suspicious patterns. Caution advised.' },
            { range: '61–80', level: 'High Risk', color: 'text-orange-400', desc: 'Strong scam indicators. Do not share any information.' },
            { range: '81–100', level: 'Critical Risk', color: 'text-red-400', desc: 'Very high confidence scam. Block and report immediately.' },
          ].map(r => (
            <div key={r.level} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-xl">
              <span className="text-slate-500 text-xs w-12 shrink-0 mt-0.5">{r.range}</span>
              <span className={`font-semibold text-sm w-28 shrink-0 ${r.color}`}>{r.level}</span>
              <span className="text-slate-400 text-sm">{r.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency */}
      <div className="bg-red-900/20 border border-red-700/30 rounded-2xl p-5">
        <h2 className="text-red-300 font-semibold mb-3">🚨 If You've Been Scammed</h2>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>→ Call <strong className="text-white">1930</strong> – National Cybercrime Helpline (India)</li>
          <li>→ File a complaint at <strong className="text-white">cybercrime.gov.in</strong></li>
          <li>→ Block your bank card and call your bank immediately</li>
          <li>→ Change passwords for all important accounts</li>
          <li>→ Report to local police cyber cell</li>
        </ul>
      </div>

      <div className="text-center text-xs text-slate-600 py-4 border-t border-slate-800">
        ScamShield AI – College Minor Project · Built with React + Node.js + SQLite · Educational Use Only
      </div>
    </div>
  );
}
