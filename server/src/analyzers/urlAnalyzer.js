const { getRiskLevel, calculateConfidence } = require('./riskScorer');
const { generateRecommendations } = require('./recommendationEngine');
const { CATEGORY_LABELS } = require('./patterns');

// URL shorteners to detect
const URL_SHORTENERS = ['bit.ly','tinyurl.com','t.co','goo.gl','ow.ly','rb.gy','is.gd','buff.ly','short.io','tiny.cc','cutt.ly','rebrand.ly'];

// Suspicious keywords in URL paths/query
const SUSPICIOUS_WORDS = ['login','verify','account','update','secure','bank','wallet','prize','reward','free','urgent','password','confirm','suspend','blocked','limited','recover','unusual','activity','click','redirect','offer'];

// Suspicious TLDs (not universally bad but worth flagging in context)
const SUSPICIOUS_TLDS = ['.xyz','.top','.tk','.ml','.ga','.cf','.gq','.club','.online','.site','.icu','.buzz','.loan','.vip'];

// Typosquatting map: legitimate brand → list of known fakes
const TYPOSQUATS = {
  'paypal': ['paypa1','paypa1.com','paypel','paypall'],
  'google': ['g00gle','g0ogle','gooogle','googIe'],
  'facebook': ['faceb00k','facebok','faceboook','facebook-login'],
  'amazon': ['amaz0n','arnazon','amazan','amazon-update'],
  'apple': ['app1e','appleupdate','apple-id-verify'],
  'netflix': ['netfl1x','nettflix','netflix-verify'],
  'microsoft': ['micros0ft','micr0soft','microsoft-update'],
  'sbi': ['sbi-bank','sbionline','sbi-kyc'],
  'hdfc': ['hdfc-bank-kyc','hdfcupdate'],
  'icici': ['icicibank-verify','icicisecure'],
};

/**
 * Parses and analyzes a URL for risk indicators.
 * NEVER fetches, opens, or visits the URL. All analysis is local.
 */
function analyzeUrl(rawUrl) {
  const urlFlags = [];
  let parsedUrl;
  let domain = '';
  let isHttps = false;

  // Parse URL safely
  try {
    // Ensure it has a scheme
    const normalized = rawUrl.startsWith('http') ? rawUrl : `http://${rawUrl}`;
    parsedUrl = new URL(normalized);
    domain = parsedUrl.hostname;
    isHttps = parsedUrl.protocol === 'https:';
  } catch {
    return {
      error: 'Invalid URL format. Please enter a valid URL.',
      riskScore: 0,
      riskLevel: 'Safe',
    };
  }

  const fullUrl = rawUrl.toLowerCase();
  const path = (parsedUrl.pathname + parsedUrl.search).toLowerCase();
  const domainLower = domain.toLowerCase();

  // Check 1: Not HTTPS
  if (!isHttps) {
    urlFlags.push({
      id: 'no_https',
      title: 'No HTTPS Encryption',
      severity: 'medium',
      explanation: 'The URL does not use HTTPS, meaning data transmission is not encrypted.',
      matchedPhrases: ['http://'],
      scoreContribution: 12
    });
  }

  // Check 2: URL shortener
  if (URL_SHORTENERS.some(s => domainLower.includes(s))) {
    urlFlags.push({
      id: 'url_shortener',
      title: 'URL Shortener Detected',
      severity: 'high',
      explanation: 'Shortened URLs hide the real destination, commonly used in phishing campaigns.',
      matchedPhrases: [domain],
      scoreContribution: 22
    });
  }

  // Check 3: IP address instead of domain
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(domain)) {
    urlFlags.push({
      id: 'ip_address_url',
      title: 'IP Address Used Instead of Domain',
      severity: 'high',
      explanation: 'Legitimate websites use domain names. IP-based URLs are a strong indicator of phishing.',
      matchedPhrases: [domain],
      scoreContribution: 25
    });
  }

  // Check 4: Excessive subdomains (more than 3 dots in hostname)
  const subdomainCount = (domainLower.match(/\./g) || []).length;
  if (subdomainCount >= 3) {
    urlFlags.push({
      id: 'excessive_subdomains',
      title: 'Excessive Subdomains',
      severity: 'medium',
      explanation: 'Phishing sites often use many subdomains to mimic legitimate URLs (e.g., login.bank.secure.verify.evil.com).',
      matchedPhrases: [domain],
      scoreContribution: 15
    });
  }

  // Check 5: Suspicious words in URL
  const foundWords = SUSPICIOUS_WORDS.filter(w => fullUrl.includes(w));
  if (foundWords.length > 0) {
    urlFlags.push({
      id: 'suspicious_keywords',
      title: 'Suspicious Keywords in URL',
      severity: foundWords.length >= 3 ? 'high' : 'medium',
      explanation: `The URL contains words commonly found in phishing and scam sites: ${foundWords.join(', ')}.`,
      matchedPhrases: foundWords,
      scoreContribution: Math.min(20, foundWords.length * 7)
    });
  }

  // Check 6: Too many hyphens in domain
  const hyphenCount = (domainLower.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    urlFlags.push({
      id: 'excessive_hyphens',
      title: 'Excessive Hyphens in Domain',
      severity: 'medium',
      explanation: 'Phishing domains often use multiple hyphens to create fake-looking legitimate names (e.g., secure-bank-login-verify.com).',
      matchedPhrases: [domain],
      scoreContribution: 12
    });
  }

  // Check 7: Typosquatting
  const squatMatches = [];
  for (const [brand, fakes] of Object.entries(TYPOSQUATS)) {
    for (const fake of fakes) {
      if (domainLower.includes(fake)) {
        squatMatches.push({ brand, fake });
      }
    }
  }
  if (squatMatches.length > 0) {
    urlFlags.push({
      id: 'typosquatting',
      title: 'Possible Typosquatting',
      severity: 'critical',
      explanation: `The domain appears to mimic "${squatMatches[0].brand}" using typosquatting (${squatMatches[0].fake}).`,
      matchedPhrases: squatMatches.map(m => m.fake),
      scoreContribution: 30
    });
  }

  // Check 8: Suspicious TLD
  const suspiciousTld = SUSPICIOUS_TLDS.find(tld => domainLower.endsWith(tld));
  if (suspiciousTld) {
    urlFlags.push({
      id: 'suspicious_tld',
      title: 'Suspicious Top-Level Domain',
      severity: 'medium',
      explanation: `The TLD "${suspiciousTld}" is commonly associated with free domains used in phishing campaigns.`,
      matchedPhrases: [suspiciousTld],
      scoreContribution: 15
    });
  }

  // Check 9: Many query parameters
  const paramCount = [...parsedUrl.searchParams.keys()].length;
  if (paramCount >= 4) {
    urlFlags.push({
      id: 'excessive_params',
      title: 'Excessive Query Parameters',
      severity: 'low',
      explanation: 'Many query parameters can be used for tracking or obfuscating redirect logic.',
      matchedPhrases: [`${paramCount} parameters`],
      scoreContribution: 8
    });
  }

  // Check 10: Long URL (over 100 chars)
  if (rawUrl.length > 100) {
    urlFlags.push({
      id: 'long_url',
      title: 'Unusually Long URL',
      severity: 'low',
      explanation: 'Very long URLs can be used to hide the true destination or confuse users.',
      matchedPhrases: [`${rawUrl.length} characters`],
      scoreContribution: 6
    });
  }

  // Score calculation for URLs
  const rawTotal = urlFlags.reduce((sum, f) => sum + f.scoreContribution, 0);
  const score = Math.min(100, Math.round(100 * (1 - Math.exp(-rawTotal / 55))));
  const riskLevel = getRiskLevel(score);
  const confidence = calculateConfidence(urlFlags, score);
  const category = urlFlags.some(f => f.id === 'typosquatting') ? 'phishing' :
    urlFlags.some(f => f.id === 'url_shortener') ? 'phishing' :
    score > 60 ? 'phishing' : 'safe';

  const recommendations = generateRecommendations(riskLevel, category);
  const explanation = score <= 20
    ? `The URL appears relatively safe based on local analysis. Risk score: ${score}/100.`
    : `This URL has a risk score of ${score}/100 (${riskLevel}). ${urlFlags.length} suspicious indicator(s) were detected. ` +
      `Do NOT visit this URL. This is a local educational analysis only and does not open the website.`;

  return {
    scanType: 'url',
    sourceType: 'url',
    originalContent: rawUrl,
    domain,
    isHttps,
    riskScore: score,
    riskLevel,
    category,
    categoryLabel: CATEGORY_LABELS[category] || 'URL Analysis',
    confidence,
    explanation,
    recommendations,
    redFlags: urlFlags,
    scoreBreakdown: { rawTotal, breakdown: urlFlags.map(f => ({ flag: f.title, severity: f.severity, weighted: f.scoreContribution })) },
    highlightedContent: '',
    analyzedAt: new Date().toISOString()
  };
}

module.exports = { analyzeUrl };
