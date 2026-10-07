const { analyzeMessage } = require('../analyzers/messageAnalyzer');
const { analyzeUrl } = require('../analyzers/urlAnalyzer');
const { getDb } = require('../database/init');

function saveScanToDb(result) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO scans (scan_type, source_type, original_content, sender, domain, risk_score, risk_level, category, confidence, explanation, recommendations, red_flags, score_breakdown, highlighted_content, is_false_positive, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))
  `);

  const info = stmt.run(
    result.scanType,
    result.sourceType || null,
    result.originalContent,
    result.sender || null,
    result.domain || null,
    result.riskScore,
    result.riskLevel,
    result.category,
    result.confidence,
    result.explanation,
    JSON.stringify(result.recommendations),
    JSON.stringify(result.redFlags),
    JSON.stringify(result.scoreBreakdown),
    result.highlightedContent || ''
  );

  return info.lastInsertRowid;
}

// POST /api/analyze/message
async function analyzeMessageHandler(req, res, next) {
  try {
    const { text, sourceType, sender } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }
    const trimmed = text.trim();
    if (trimmed.length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters long.' });
    }
    if (trimmed.length > 5000) {
      return res.status(400).json({ error: 'Message must be under 5000 characters.' });
    }

    const result = analyzeMessage(trimmed, { sourceType, sender });
    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
}

// POST /api/analyze/url
async function analyzeUrlHandler(req, res, next) {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required.' });
    }
    const trimmed = url.trim();
    if (trimmed.length < 4) {
      return res.status(400).json({ error: 'Please enter a valid URL.' });
    }

    const result = analyzeUrl(trimmed);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
}

// POST /api/analyze/message/save or /api/analyze/url/save  (save after analysis)
async function saveScanHandler(req, res, next) {
  try {
    const { result } = req.body;
    if (!result || !result.scanType) {
      return res.status(400).json({ error: 'Invalid scan result provided.' });
    }
    const id = saveScanToDb(result);
    res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyzeMessageHandler, analyzeUrlHandler, saveScanHandler };
