const { RED_FLAG_PATTERNS, CATEGORY_LABELS } = require('./patterns');

/**
 * Detects red flags in message text using pattern matching.
 * Returns array of matched flag objects with evidence.
 */
function detectRedFlags(text) {
  const found = [];
  const seenIds = new Set();

  for (const flag of RED_FLAG_PATTERNS) {
    for (const pattern of flag.patterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0 && !seenIds.has(flag.id)) {
        seenIds.add(flag.id);
        found.push({
          id: flag.id,
          title: flag.title,
          severity: flag.severity,
          explanation: flag.explanation,
          matchedPhrases: matches.map(m => m[0]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3),
          scoreContribution: flag.scoreContribution,
          category: flag.category
        });
        break;
      }
    }
  }

  return found;
}

/**
 * Highlights suspicious phrases inside the original message text.
 * Returns HTML-safe string with <mark> tags around flagged phrases.
 */
function highlightSuspiciousContent(text, redFlags) {
  let highlighted = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const allPhrases = redFlags.flatMap(f => f.matchedPhrases || []);

  // Sort by length descending to avoid partial replacements
  const sorted = [...new Set(allPhrases)].sort((a, b) => b.length - a.length);

  for (const phrase of sorted) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    highlighted = highlighted.replace(regex, m => `<mark class="highlight">${m}</mark>`);
  }

  return highlighted;
}

module.exports = { detectRedFlags, highlightSuspiciousContent };
