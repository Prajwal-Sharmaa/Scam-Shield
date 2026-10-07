const { CATEGORY_LABELS } = require('./patterns');

const RECOMMENDATIONS = {
  Critical: [
    'Do NOT share any OTP, password, or bank details with anyone.',
    'Do NOT click any links in this message.',
    'Block and report the sender immediately.',
    'If you have already shared information, call your bank immediately to block your account.',
    'File a complaint at cybercrime.gov.in or call 1930.',
    'Alert your family and friends about this scam.'
  ],
  'High Risk': [
    'Do not respond to this message or call back any number provided.',
    'Do not click any links or download attachments.',
    'Verify directly with the official organization using their official website.',
    'Block the sender on your phone or app.',
    'Report the number/message as spam on your device.'
  ],
  'Medium Risk': [
    'Be cautious before acting on this message.',
    'Verify the sender\'s identity through official channels.',
    'Do not provide personal information until verified.',
    'Check the sender\'s official website or call center directly.'
  ],
  'Low Risk': [
    'This message has some minor suspicious signals.',
    'Verify with the official source before taking action.',
    'Be aware of marketing tactics asking for your data.'
  ],
  Safe: [
    'This message appears safe, but always stay vigilant.',
    'Continue to practice good digital hygiene.',
    'Never share sensitive information unless you are 100% sure of the source.'
  ]
};

const CATEGORY_ACTIONS = {
  otp_scam: 'Never share OTPs. Legitimate services will NEVER ask you to share an OTP over call or message.',
  bank_fraud: 'Call your bank\'s official helpline immediately. Do not use numbers provided in suspicious messages.',
  phishing: 'Do not open any links. Visit the official website directly by typing the address in your browser.',
  lottery_scam: 'You cannot win a lottery you did not enter. This is 100% a scam. Ignore and delete.',
  investment_scam: 'Guaranteed returns do not exist in legitimate investments. Report to SEBI at scores.sebi.gov.in.',
  job_scam: 'Never pay a registration fee for a job offer. Report to your local police cyber cell.',
  impersonation: 'Call the real organization using their official number from their official website to verify.',
  upi_qr_scam: 'Never scan QR codes or accept UPI collect requests from unknown sources.',
  delivery_scam: 'Track your packages only via the official app or website. Never click links in SMS.',
  remote_access_scam: 'NEVER install any remote-access app for customer support. Hang up immediately.',
  advance_fee_fraud: 'If it sounds too good to be true, it is. Never pay fees to receive prizes or money.',
  social_engineering: 'Manipulative messages are designed to bypass your judgment. Take time to verify.',
  safe: 'Message appears legitimate. Continue to practice safe digital habits.'
};

/**
 * Generates plain-language explanation for the scan result.
 */
function generateExplanation(riskLevel, category, redFlags, score) {
  const categoryLabel = CATEGORY_LABELS[category] || 'Unknown';

  if (riskLevel === 'Safe') {
    return `This message does not contain significant scam indicators. It appears to be a legitimate communication. Risk score: ${score}/100.`;
  }

  const topFlags = redFlags.slice(0, 3).map(f => f.title).join(', ');

  return `This message has been classified as "${categoryLabel}" with a risk score of ${score}/100 (${riskLevel}). ` +
    `The analysis detected the following key indicators: ${topFlags}. ` +
    `These patterns are commonly found in scam messages targeting individuals for financial fraud or credential theft. ` +
    `${CATEGORY_ACTIONS[category] || 'Exercise caution and verify the sender before acting.'}`;
}

/**
 * Returns recommendations based on risk level and category.
 */
function generateRecommendations(riskLevel, category) {
  const base = RECOMMENDATIONS[riskLevel] || RECOMMENDATIONS['Safe'];
  const extra = CATEGORY_ACTIONS[category];
  if (extra && !base.includes(extra)) {
    return [extra, ...base];
  }
  return base;
}

module.exports = { generateExplanation, generateRecommendations };
