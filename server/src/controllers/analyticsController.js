const { getDb } = require('../database/init');

// GET /api/analytics
function getAnalytics(req, res, next) {
  try {
    const db = getDb();

    const totalScans = db.prepare('SELECT COUNT(*) as count FROM scans').get().count;
    const highRisk = db.prepare("SELECT COUNT(*) as count FROM scans WHERE risk_level IN ('High Risk','Critical Risk') AND is_false_positive = 0").get().count;
    const safeScans = db.prepare("SELECT COUNT(*) as count FROM scans WHERE risk_level = 'Safe' AND is_false_positive = 0").get().count;

    // Risk level distribution
    const riskDist = db.prepare(`
      SELECT risk_level, COUNT(*) as count FROM scans WHERE is_false_positive = 0
      GROUP BY risk_level ORDER BY risk_score DESC
    `).all();

    // Category distribution
    const categoryDist = db.prepare(`
      SELECT category, COUNT(*) as count FROM scans WHERE is_false_positive = 0 AND category IS NOT NULL
      GROUP BY category ORDER BY count DESC LIMIT 10
    `).all();

    // Source type distribution
    const sourceDist = db.prepare(`
      SELECT source_type, COUNT(*) as count FROM scans WHERE source_type IS NOT NULL
      GROUP BY source_type ORDER BY count DESC
    `).all();

    // Scans over time (last 14 days)
    const scansOverTime = db.prepare(`
      SELECT date(created_at) as date, COUNT(*) as count
      FROM scans
      WHERE created_at >= date('now', '-14 days')
      GROUP BY date(created_at)
      ORDER BY date ASC
    `).all();

    // Most common red flags
    const allScans = db.prepare("SELECT red_flags FROM scans WHERE red_flags IS NOT NULL AND is_false_positive = 0").all();
    const flagCounts = {};
    for (const row of allScans) {
      try {
        const flags = JSON.parse(row.red_flags);
        for (const f of flags) {
          flagCounts[f.title] = (flagCounts[f.title] || 0) + 1;
        }
      } catch {}
    }
    const topFlags = Object.entries(flagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    // Most common scam type
    const topCategory = categoryDist[0]?.category || 'N/A';

    // Safety insights
    const urgencyCount = db.prepare(`
      SELECT COUNT(*) as count FROM scans WHERE red_flags LIKE '%urgency%' OR red_flags LIKE '%Urgency%'
    `).get().count;
    const otpCount = db.prepare(`
      SELECT COUNT(*) as count FROM scans WHERE red_flags LIKE '%otp%' OR red_flags LIKE '%OTP%'
    `).get().count;

    const insights = [
      `${highRisk} out of ${totalScans} scans were flagged as High Risk or Critical.`,
      urgencyCount > 0 ? `${urgencyCount} scans contained urgency or fear-based language.` : null,
      otpCount > 0 ? `OTP theft attempts were detected in ${otpCount} scan(s).` : null,
      `${safeScans} scan(s) were classified as safe.`,
      topCategory !== 'N/A' ? `The most common scam category was "${topCategory}".` : null,
    ].filter(Boolean);

    res.json({
      success: true,
      analytics: {
        totalScans,
        highRisk,
        safeScans,
        topCategory,
        riskDistribution: riskDist,
        categoryDistribution: categoryDist,
        sourceDistribution: sourceDist,
        scansOverTime,
        topRedFlags: topFlags,
        insights
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnalytics };
