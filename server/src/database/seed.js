require('dotenv').config();
const { initializeDatabase, getDb } = require('./init');
const { analyzeMessage } = require('../analyzers/messageAnalyzer');
const { analyzeUrl } = require('../analyzers/urlAnalyzer');

const DEMO_SCANS = [
  { type: 'message', sourceType: 'sms', sender: '+91-XXXXXX8821',
    text: 'Dear Customer, Your SBI account has been BLOCKED due to incomplete KYC. Update your KYC immediately within 24 hours or your account will be permanently suspended. Click here to verify: http://sbi-kyc-update.xyz/verify?ref=48291' },
  { type: 'message', sourceType: 'whatsapp', sender: 'Unknown (+91-XXXXX12345)',
    text: 'Hello! I accidentally sent an OTP to your number. Please urgently share that OTP with me, it expires in 5 minutes and my account will be blocked forever. Do not tell anyone about this.' },
  { type: 'message', sourceType: 'email', sender: 'prize@nationallottery-india.example',
    text: 'CONGRATULATIONS! You have won Rs. 25,00,000 in the National Digital Lottery 2024. You were selected as the lucky winner from 10 million participants. To claim your cash prize, pay a small processing fee of Rs. 1,999 via UPI to claim@upi.example. Act now — offer expires in 48 hours!' },
  { type: 'message', sourceType: 'whatsapp', sender: 'HR Team (+91-XXXXX55678)',
    text: 'Genuine Work From Home Job! Earn Rs. 15,000-40,000 per month. No experience required. Simple data entry work. Guaranteed income. Pay only Rs. 500 registration fee to get started. Limited seats — respond NOW!' },
  { type: 'message', sourceType: 'sms', sender: 'FKDLVY',
    text: 'Your package from Flipkart has been held at customs. Customs clearance fee of Rs. 299 is pending. Pay immediately to receive your delivery. Track and pay: http://fk-delivery-customs.example/pay?id=PK20948' },
  { type: 'message', sourceType: 'whatsapp', sender: 'Buyer (OLX)',
    text: 'Hi, I am interested in buying your product. I am in the Army so I cannot come in person. I will send my driver. Please scan this QR code to receive the advance payment. UPI ID: fraudster@upi.example. Scan QR to get Rs. 10,000.' },
  { type: 'message', sourceType: 'instagram_dm', sender: 'Instagram Support (fake)',
    text: 'Your Instagram account has been reported for violating community guidelines. Your account will be disabled in 24 hours unless you verify your identity. Click here to appeal: http://instagram-verify-appeal.example/login' },
  { type: 'message', sourceType: 'call_transcript', sender: 'Unknown caller',
    text: 'Hello sir, I am calling from HDFC Bank customer care. We noticed suspicious activity on your account. To secure your account, please share your debit card number, CVV, and OTP that you will receive. This is urgent — your account may be blocked.' },
  { type: 'message', sourceType: 'whatsapp', sender: 'Crypto Expert Group',
    text: 'Join our exclusive crypto investment program! Guaranteed 300% returns in 30 days. Our experts double your money with zero risk. Minimum investment Rs. 5,000. Bitcoin investment scheme with passive income. Limited spots available — register today!' },
  { type: 'message', sourceType: 'sms', sender: 'BSNL-BILL',
    text: 'Dear customer, your BSNL broadband bill of Rs. 999 for the month of May is due on 10 June 2024. Please pay at bsnl.in or your nearest CSC center. For queries, call 1500. Thank you.' },
  { type: 'message', sourceType: 'sms', sender: 'AMAZON',
    text: 'Amazon Sale is LIVE! Up to 70% off on electronics, fashion, and home appliances. Shop now at amazon.in. T&C apply. Reply STOP to unsubscribe.' },
  { type: 'url', sourceType: 'url', sender: null,
    text: 'http://secure-hdfc-bank-login-verify-account-update.xyz/kyc?user=739201&session=abc123&ref=urgent' },
  { type: 'message', sourceType: 'sms', sender: 'GOV-NOTICE',
    text: 'FINAL WARNING from Income Tax Department. Your PAN card is linked to fraudulent transactions. An arrest warrant will be issued within 24 hours. To avoid arrest, call our cyber cell officer immediately at 09876500000. Do not ignore this notice.' },
  { type: 'message', sourceType: 'call_transcript', sender: 'Tech Support (fake)',
    text: 'Hello, I am calling from Microsoft support. We detected a virus on your computer that is stealing your bank data. Please install AnyDesk immediately so our technician can fix it remotely. Give me the AnyDesk ID and password to complete the fix.' },
];

async function seedDatabase() {
  initializeDatabase();
  const db = getDb();

  const existingCount = db.prepare('SELECT COUNT(*) as count FROM scans').get().count;
  if (existingCount >= 12) {
    console.log(`Database already has ${existingCount} scans. Skipping seed.`);
    return;
  }

  const stmt = db.prepare(`
    INSERT INTO scans (scan_type, source_type, original_content, sender, domain, risk_score, risk_level, category, confidence, explanation, recommendations, red_flags, score_breakdown, highlighted_content, is_false_positive, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `);

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  db.exec('BEGIN');
  try {
    DEMO_SCANS.forEach((demo, i) => {
      let result;
      if (demo.type === 'url') {
        const { analyzeUrl: au } = require('../analyzers/urlAnalyzer');
        result = au(demo.text);
      } else {
        result = analyzeMessage(demo.text, { sourceType: demo.sourceType, sender: demo.sender });
      }

      const createdAt = new Date(now - (i * 1.2 * day)).toISOString().replace('T', ' ').slice(0, 19);

      stmt.run(
        result.scanType,
        result.sourceType,
        result.originalContent,
        demo.sender || null,
        result.domain || null,
        result.riskScore,
        result.riskLevel,
        result.category,
        result.confidence,
        result.explanation,
        JSON.stringify(result.recommendations),
        JSON.stringify(result.redFlags),
        JSON.stringify(result.scoreBreakdown),
        result.highlightedContent || '',
        createdAt
      );
    });
    db.exec('COMMIT');
    console.log(`✅ Seeded ${DEMO_SCANS.length} demo scans into the database.`);
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

seedDatabase().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
