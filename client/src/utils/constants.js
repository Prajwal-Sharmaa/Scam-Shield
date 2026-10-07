export const RISK_COLORS = {
  'Safe': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: '#10b981', hex: '#10b981' },
  'Low Risk': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', dot: '#3b82f6', hex: '#3b82f6' },
  'Medium Risk': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', dot: '#f59e0b', hex: '#f59e0b' },
  'High Risk': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', dot: '#f97316', hex: '#f97316' },
  'Critical Risk': { bg: 'bg-red-600/10', text: 'text-red-400', border: 'border-red-500/30', dot: '#ef4444', hex: '#ef4444' },
};

export const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', badge: 'bg-red-900/50 text-red-300 border border-red-700/50' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', badge: 'bg-orange-900/50 text-orange-300 border border-orange-700/50' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', badge: 'bg-amber-900/50 text-amber-300 border border-amber-700/50' },
  low: { bg: 'bg-blue-500/10', text: 'text-blue-400', badge: 'bg-blue-900/50 text-blue-300 border border-blue-700/50' },
};

export const CATEGORY_LABELS = {
  phishing: 'Phishing',
  bank_fraud: 'Bank Fraud',
  otp_scam: 'OTP Scam',
  job_scam: 'Job Scam',
  lottery_scam: 'Lottery/Prize Scam',
  investment_scam: 'Investment/Crypto Scam',
  impersonation: 'Impersonation',
  upi_qr_scam: 'UPI/QR Scam',
  delivery_scam: 'Parcel/Delivery Scam',
  advance_fee_fraud: 'Advance Fee Fraud',
  payment_scam: 'Payment Scam',
  remote_access_scam: 'Remote Access Scam',
  social_engineering: 'Social Engineering',
  urgency: 'Urgency/Fear Tactic',
  safe: 'Safe/Legitimate'
};

export const SOURCE_LABELS = {
  sms: 'SMS',
  email: 'Email',
  whatsapp: 'WhatsApp',
  instagram_dm: 'Instagram DM',
  call_transcript: 'Call Transcript',
  url: 'URL',
  other: 'Other',
};

export function getRiskColor(riskLevel) {
  return RISK_COLORS[riskLevel] || RISK_COLORS['Safe'];
}

export function truncate(str, n = 80) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return dateStr;
  }
}

export function getRiskScore(score) {
  const colors = [
    { max: 20, stroke: '#10b981' },
    { max: 40, stroke: '#3b82f6' },
    { max: 60, stroke: '#f59e0b' },
    { max: 80, stroke: '#f97316' },
    { max: 100, stroke: '#ef4444' },
  ];
  return colors.find(c => score <= c.max)?.stroke || '#ef4444';
}
