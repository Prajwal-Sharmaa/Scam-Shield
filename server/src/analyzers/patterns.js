// Red flag patterns for message analysis
const RED_FLAG_PATTERNS = [
  // Urgency / Fear
  {
    id: 'urgency_account_blocked',
    title: 'Account Blocked Threat',
    severity: 'critical',
    patterns: [/account\s*(has\s*been\s*)?(blocked|suspended|disabled|frozen)/gi, /your\s*account\s*will\s*be\s*(blocked|closed|suspended)/gi],
    explanation: 'Scammers create fear by claiming your account is blocked to force immediate action.',
    scoreContribution: 20,
    category: 'urgency'
  },
  {
    id: 'urgency_act_now',
    title: 'Artificial Urgency',
    severity: 'high',
    patterns: [/act\s*now/gi, /immediate(ly)?/gi, /urgent(ly)?/gi, /within\s*\d+\s*hours?/gi, /expires?\s*(in|today|soon)/gi, /last\s*(chance|warning|notice)/gi, /final\s*warning/gi, /do\s*not\s*delay/gi, /respond\s*(now|immediately)/gi],
    explanation: 'Creating false urgency is a classic social engineering tactic to prevent you from thinking critically.',
    scoreContribution: 15,
    category: 'urgency'
  },
  {
    id: 'urgency_limited_time',
    title: 'Limited Time Pressure',
    severity: 'medium',
    patterns: [/limited\s*time/gi, /offer\s*expires/gi, /don['\u2019]?t\s*miss/gi, /hurry/gi, /deadline/gi],
    explanation: 'Artificial deadlines pressure you into making hasty decisions.',
    scoreContribution: 10,
    category: 'urgency'
  },
  // Financial Bait
  {
    id: 'financial_prize',
    title: 'Prize / Lottery Claim',
    severity: 'critical',
    patterns: [/you\s*(have\s*)?(won|win|selected|chosen)/gi, /prize\s*(of|worth)?/gi, /lottery/gi, /lucky\s*(winner|draw)/gi, /congratulations.*won/gi, /cash\s*prize/gi, /reward\s*(of|worth)?/gi],
    explanation: 'Fake prize claims are used to extract personal information or advance fees from victims.',
    scoreContribution: 25,
    category: 'lottery_scam'
  },
  {
    id: 'financial_investment',
    title: 'Investment Fraud Promise',
    severity: 'high',
    patterns: [/guaranteed\s*(return|profit|income)/gi, /double\s*your\s*money/gi, /risk\s*free\s*investment/gi, /high\s*return/gi, /passive\s*income/gi, /crypto\s*(investment|profit|earn)/gi, /bitcoin\s*(investment|profit)/gi],
    explanation: 'Guaranteed high returns are a hallmark of investment fraud.',
    scoreContribution: 22,
    category: 'investment_scam'
  },
  {
    id: 'financial_advance_fee',
    title: 'Advance Fee / Processing Fee',
    severity: 'critical',
    patterns: [/advance\s*(fee|payment|charge)/gi, /processing\s*fee/gi, /registration\s*fee/gi, /small\s*fee\s*to\s*(claim|receive)/gi, /pay\s*(small\s*)?(amount|fee)\s*to/gi],
    explanation: 'Asking for upfront payments to "release" prizes or funds is a classic advance-fee fraud.',
    scoreContribution: 28,
    category: 'advance_fee_fraud'
  },
  // OTP / Credential Theft
  {
    id: 'otp_request',
    title: 'OTP / Verification Code Request',
    severity: 'critical',
    patterns: [/share.*otp/gi, /send.*otp/gi, /enter.*otp/gi, /otp.*do\s*not\s*share/gi, /never\s*share.*otp/gi, /one.time.*password/gi, /verification\s*code/gi],
    explanation: 'Legitimate services NEVER ask you to share OTPs. This is almost always a fraud attempt.',
    scoreContribution: 30,
    category: 'otp_scam'
  },
  // Banking / Financial Details
  {
    id: 'bank_details',
    title: 'Bank / Card Details Request',
    severity: 'critical',
    patterns: [/account\s*number/gi, /card\s*(number|details)/gi, /cvv/gi, /pin\s*(number)?/gi, /debit\s*card/gi, /credit\s*card\s*(number|details)/gi, /net\s*banking\s*(details|credentials|password)/gi, /ifsc/gi],
    explanation: 'No legitimate bank or company will ask for your full card or account details via SMS or message.',
    scoreContribution: 30,
    category: 'bank_fraud'
  },
  {
    id: 'kyc_update',
    title: 'Fake KYC / Update Request',
    severity: 'high',
    patterns: [/kyc\s*(update|verify|complete|pending|expired)/gi, /update\s*your\s*kyc/gi, /kyc\s*not\s*completed/gi, /aadhar\s*(verify|update|number)/gi, /pan\s*(card\s*)?(verify|update|number)/gi],
    explanation: 'Fake KYC requests are used to steal identity documents and banking credentials.',
    scoreContribution: 22,
    category: 'bank_fraud'
  },
  // Payment Scams
  {
    id: 'upi_scam',
    title: 'Suspicious UPI / QR Payment Request',
    severity: 'high',
    patterns: [/upi\s*(id|payment|transfer)/gi, /scan\s*qr\s*(code|to\s*pay)/gi, /pay\s*via\s*upi/gi, /gpay\s*transfer/gi, /phonepay\s*transfer/gi, /paytm\s*(transfer|wallet)/gi],
    explanation: 'Unsolicited UPI payment requests or QR codes are frequently used for payment fraud.',
    scoreContribution: 20,
    category: 'upi_qr_scam'
  },
  {
    id: 'wallet_recharge',
    title: 'Wallet / Recharge Scam',
    severity: 'medium',
    patterns: [/wallet\s*(recharge|top.?up)/gi, /free\s*recharge/gi, /cashback\s*(offer|reward)/gi],
    explanation: 'Free recharge or cashback offers often lead to phishing sites or data theft.',
    scoreContribution: 12,
    category: 'payment_scam'
  },
  // Job Scams
  {
    id: 'job_scam',
    title: 'Job / Work-From-Home Scam',
    severity: 'high',
    patterns: [/work\s*from\s*home/gi, /part.?time\s*(job|work|income)/gi, /earn\s*(daily|weekly|monthly)\s*(from\s*home)?/gi, /data\s*entry\s*(job|work)/gi, /genuine\s*(job|work)\s*opportunity/gi, /hiring\s*now/gi, /no\s*experience\s*(required|needed)/gi],
    explanation: 'Work-from-home job scams typically charge registration fees and disappear with your money.',
    scoreContribution: 18,
    category: 'job_scam'
  },
  // Impersonation
  {
    id: 'impersonation_bank',
    title: 'Bank Impersonation',
    severity: 'high',
    patterns: [/from\s*(sbi|hdfc|icici|axis|kotak|pnb|bank\s*of\s*india|yes\s*bank)/gi, /your\s*bank\s*(is\s*)?(calling|contacting)/gi, /bank\s*helpline/gi, /bank\s*customer\s*care/gi],
    explanation: 'Scammers impersonate banks to steal account credentials and OTPs.',
    scoreContribution: 18,
    category: 'impersonation'
  },
  {
    id: 'impersonation_govt',
    title: 'Government / Authority Impersonation',
    severity: 'high',
    patterns: [/income\s*tax\s*(department|notice|refund)/gi, /police\s*(notice|complaint|arrest)/gi, /court\s*summons/gi, /aadhaar\s*(blocked|suspended)/gi, /government\s*(scheme|notification)/gi, /trai/gi, /cyber\s*cell/gi],
    explanation: 'Impersonating government bodies creates fear and forces victims to comply with fraudulent demands.',
    scoreContribution: 22,
    category: 'impersonation'
  },
  {
    id: 'impersonation_delivery',
    title: 'Fake Delivery / Courier Scam',
    severity: 'medium',
    patterns: [/parcel.*held|package.*held/gi, /customs\s*(duty|clearance|fee)/gi, /delivery.*failed.*click/gi, /track.*package.*link/gi, /undelivered.*package/gi],
    explanation: 'Fake delivery notifications trick users into visiting phishing sites or paying fake fees.',
    scoreContribution: 15,
    category: 'delivery_scam'
  },
  // Suspicious Links
  {
    id: 'suspicious_link',
    title: 'Suspicious / Shortened Link',
    severity: 'high',
    patterns: [/https?:\/\/(bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|rb\.gy|is\.gd|buff\.ly|short\.io|link\d+\.)/gi, /click\s*(here|this\s*link)/gi, /visit\s*(this\s*)?(link|website|site)/gi, /tap\s*here/gi],
    explanation: 'Shortened or obscure links can redirect to phishing sites without revealing their true destination.',
    scoreContribution: 18,
    category: 'phishing'
  },
  // Secrecy
  {
    id: 'secrecy_request',
    title: 'Request for Secrecy',
    severity: 'high',
    patterns: [/do\s*not\s*(tell|inform|share)\s*(anyone|family|police)/gi, /keep\s*(this\s*)?(secret|confidential)/gi, /don['\u2019]?t\s*discuss\s*with\s*(family|anyone)/gi, /between\s*us\s*only/gi],
    explanation: 'Asking you to keep the interaction secret is a red flag that the person knows their activity is fraudulent.',
    scoreContribution: 25,
    category: 'social_engineering'
  },
  // Remote Access
  {
    id: 'remote_access',
    title: 'Remote Access Request',
    severity: 'critical',
    patterns: [/install\s*(anydesk|teamviewer|quicksupport|screenconnect|rustdesk)/gi, /remote\s*(access|control|desktop)/gi, /screen\s*sharing/gi, /give\s*(me|us)\s*(control|access)\s*(of|to)\s*your/gi],
    explanation: 'Installing remote access tools gives scammers full control over your device and banking apps.',
    scoreContribution: 35,
    category: 'remote_access_scam'
  },
  // Fake Customer Care
  {
    id: 'fake_customer_care',
    title: 'Fake Customer Care Number',
    severity: 'high',
    patterns: [/customer\s*(care|service|support)\s*(number|helpline)/gi, /toll\s*free\s*(number|helpline)/gi, /call\s*(our|the)\s*(helpline|support|customer)/gi, /whatsapp\s*(us|helpline|support)/gi],
    explanation: 'Fake customer care numbers connect you to scammers posing as support agents to steal credentials.',
    scoreContribution: 20,
    category: 'impersonation'
  },
  // Grammar / Capitalization signals
  {
    id: 'all_caps',
    title: 'Excessive Capitalization',
    severity: 'low',
    patterns: [/[A-Z]{5,}/g],
    explanation: 'Excessive capitalization is often used to create a sense of alarm or importance.',
    scoreContribution: 5,
    category: 'social_engineering'
  },
];

// Scam category labels
const CATEGORY_LABELS = {
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

module.exports = { RED_FLAG_PATTERNS, CATEGORY_LABELS };
