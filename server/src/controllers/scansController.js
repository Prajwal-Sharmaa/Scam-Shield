const { getDb } = require('../database/init');

// GET /api/scans
function getScans(req, res, next) {
  try {
    const db = getDb();
    const {
      page = 1, limit = 20, search = '', riskLevel = '', category = '',
      sourceType = '', sortBy = 'newest', scanType = ''
    } = req.query;

    const offset = (Math.max(1, parseInt(page)) - 1) * Math.min(100, parseInt(limit));
    const pageSize = Math.min(100, parseInt(limit));

    let where = [];
    let params = [];

    if (search) {
      where.push("(original_content LIKE ? OR sender LIKE ? OR domain LIKE ? OR category LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (riskLevel) { where.push("risk_level = ?"); params.push(riskLevel); }
    if (category)  { where.push("category = ?");   params.push(category); }
    if (sourceType){ where.push("source_type = ?"); params.push(sourceType); }
    if (scanType)  { where.push("scan_type = ?");  params.push(scanType); }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const orderMap = {
      newest: 'created_at DESC',
      oldest: 'created_at ASC',
      highest: 'risk_score DESC',
      lowest: 'risk_score ASC'
    };
    const orderClause = `ORDER BY ${orderMap[sortBy] || 'created_at DESC'}`;

    const countRow = db.prepare(`SELECT COUNT(*) as total FROM scans ${whereClause}`).get(...params);
    const rows = db.prepare(`SELECT * FROM scans ${whereClause} ${orderClause} LIMIT ? OFFSET ?`).all(...params, pageSize, offset);

    const scans = rows.map(row => ({
      ...row,
      recommendations: tryParse(row.recommendations, []),
      redFlags: tryParse(row.red_flags, []),
      scoreBreakdown: tryParse(row.score_breakdown, {}),
      isFalsePositive: row.is_false_positive === 1
    }));

    res.json({
      success: true,
      scans,
      total: countRow.total,
      page: parseInt(page),
      totalPages: Math.ceil(countRow.total / pageSize)
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/scans/:id
function getScanById(req, res, next) {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM scans WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Scan not found.' });

    res.json({
      success: true,
      scan: {
        ...row,
        recommendations: tryParse(row.recommendations, []),
        redFlags: tryParse(row.red_flags, []),
        scoreBreakdown: tryParse(row.score_breakdown, {}),
        isFalsePositive: row.is_false_positive === 1
      }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/scans
function createScan(req, res, next) {
  try {
    const db = getDb();
    const r = req.body;
    if (!r || !r.scanType) return res.status(400).json({ error: 'Invalid scan data.' });

    const stmt = db.prepare(`
      INSERT INTO scans (scan_type, source_type, original_content, sender, domain, risk_score, risk_level, category, confidence, explanation, recommendations, red_flags, score_breakdown, highlighted_content, is_false_positive, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))
    `);

    const info = stmt.run(
      r.scanType, r.sourceType || null, r.originalContent, r.sender || null, r.domain || null,
      r.riskScore, r.riskLevel, r.category, r.confidence, r.explanation,
      JSON.stringify(r.recommendations || []),
      JSON.stringify(r.redFlags || []),
      JSON.stringify(r.scoreBreakdown || {}),
      r.highlightedContent || ''
    );

    res.status(201).json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/scans/:id
function deleteScan(req, res, next) {
  try {
    const db = getDb();
    db.prepare('DELETE FROM scans WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/scans
function deleteAllScans(req, res, next) {
  try {
    const db = getDb();
    db.prepare('DELETE FROM scans').run();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/scans/:id/false-positive
function markFalsePositive(req, res, next) {
  try {
    const db = getDb();
    db.prepare('UPDATE scans SET is_false_positive = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/scans/export/csv
function exportCsv(req, res, next) {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM scans ORDER BY created_at DESC').all();

    const headers = ['id','scan_type','source_type','original_content','sender','domain','risk_score','risk_level','category','confidence','created_at'];
    const csvLines = [headers.join(',')];

    for (const row of rows) {
      csvLines.push(headers.map(h => {
        const val = String(row[h] || '').replace(/"/g, '""').replace(/\n/g, ' ');
        return `"${val}"`;
      }).join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="scamshield-history.csv"');
    res.send(csvLines.join('\n'));
  } catch (err) {
    next(err);
  }
}

function tryParse(val, fallback) {
  try { return val ? JSON.parse(val) : fallback; } catch { return fallback; }
}

module.exports = { getScans, getScanById, createScan, deleteScan, deleteAllScans, markFalsePositive, exportCsv };
