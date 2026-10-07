const router = require('express').Router();

// GET /api/demo-data — returns sample scam messages for the "Try Demo Examples" section
router.get('/', (req, res) => {
  res.json({
    success: true,
    examples: [
      {
        id: 1,
        label: 'Fake Bank KYC SMS',
        type: 'message',
        sourceType: 'sms',
        text: 'Dear Customer, Your SBI account has been BLOCKED due to incomplete KYC. Update KYC within 24 hours to avoid permanent suspension. Click here: http://sbi-kyc-update.xyz/verify?ref=48291'
      },
      {
        id: 2,
        label: 'OTP Theft WhatsApp',
        type: 'message',
        sourceType: 'whatsapp',
        text: 'Hi! I accidentally sent an OTP to your number. Please share it with me urgently, it will expire in 5 minutes. My account will be blocked if you don\'t help!'
      },
      {
        id: 3,
        label: 'Lottery Prize Scam',
        type: 'message',
        sourceType: 'email',
        text: 'CONGRATULATIONS! You have been selected as the lucky winner of Rs. 25,00,000 in the National Digital Lottery 2024. To claim your prize, you must pay a small processing fee of Rs. 1,999. Contact us immediately at prize@nationallottery-india.xyz'
      },
      {
        id: 4,
        label: 'Fake Job Offer',
        type: 'message',
        sourceType: 'whatsapp',
        text: 'Genuine Work From Home Job Opportunity! Earn Rs. 15,000 to Rs. 40,000 per month. No experience required. Data entry work. Guaranteed income. Pay Rs. 500 registration fee to start immediately. Limited seats available. Respond NOW!'
      },
      {
        id: 5,
        label: 'Phishing URL',
        type: 'url',
        sourceType: 'url',
        text: 'http://secure-login-hdfc-bank-verify-account.xyz/update?user=7483910&ref=kyc'
      },
      {
        id: 6,
        label: 'Safe Reminder (Low Risk)',
        type: 'message',
        sourceType: 'sms',
        text: 'Reminder: Your electricity bill of Rs. 1,240 is due on 15th June. Pay at your nearest payment center or via official app. Customer care: 1912'
      }
    ]
  });
});

module.exports = router;
