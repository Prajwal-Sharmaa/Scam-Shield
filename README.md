# ScamShield AI 🛡️

> Analyze suspicious messages, emails, and URLs before they harm you.

![ScamShield AI](https://img.shields.io/badge/ScamShield-AI-blue?style=for-the-badge&logo=shield)
![Status](https://img.shields.io/badge/Status-Demo%20Ready-green?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node.js%20%2B%20SQLite-blueviolet?style=for-the-badge)

---

## 📌 Problem Statement

Millions of people fall victim to SMS phishing (smishing), fake job offers, OTP theft, KYC scams, and fraudulent URLs every year. Most users cannot identify the subtle psychological manipulation tactics used in these messages. ScamShield AI provides an accessible, educational tool to analyze suspicious content locally and return an explainable risk score with actionable safety guidance.

---

## ✨ Features

- **Message Scanner** – Analyze SMS, WhatsApp, Email, Instagram DMs, Call Transcripts
- **URL Scanner** – Detect phishing indicators in URLs (never opens the URL)
- **Risk Scoring** – 0–100 score using a transparent, explainable rule-based engine
- **Red Flag Detection** – 20+ pattern categories with severity levels
- **Highlighted Content** – Suspicious phrases highlighted in original message
- **Scan History** – SQLite-backed history with search, filter, sort, and CSV export
- **Analytics Dashboard** – Charts for risk distribution, categories, timeline, top flags
- **Demo Examples** – Click-to-analyze sample scam messages
- **Responsive Design** – Desktop sidebar + mobile navigation

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| HTTP Client | Axios |
| Routing | React Router v6 |

---

## 📁 Folder Structure

```
scamshield-ai/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Layout, RiskGauge, RedFlagList, ScanResult
│   │   ├── pages/              # Dashboard, ScanMessage, ScanUrl, History, Analytics, About
│   │   ├── services/api.js     # Axios API calls
│   │   └── utils/constants.js  # Colors, labels, helpers
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                     # Express backend
│   └── src/
│       ├── analyzers/          # messageAnalyzer, urlAnalyzer, riskScorer, redFlagDetector, recommendationEngine
│       ├── controllers/        # analyzeController, scansController, analyticsController
│       ├── routes/             # analyze, scans, analytics, demo
│       ├── database/           # init.js (schema), seed.js (demo data)
│       └── middleware/         # errorHandler
├── package.json                # Root scripts using concurrently
├── .env.example
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm 9+

### Steps

```bash
# 1. Navigate to the project folder
cd scamshield-ai

# 2. Install all dependencies (root + server + client)
npm run install:all

# 3. Seed the database with 14 demo scans
npm run seed

# 4. Start the full application (both frontend & backend)
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/health

> **Note:** The backend uses Node.js built-in `node:sqlite` (Node 22.5+). The `--experimental-sqlite` flag is already wired into the npm scripts automatically.

---

## 🎮 Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend concurrently |
| `npm run server` | Start backend only (port 5000) |
| `npm run client` | Start frontend only (port 5173) |
| `npm run seed` | Seed database with 14 demo scans |
| `npm run install:all` | Install all dependencies in one command |

### Manual startup (if concurrently has issues)
```bash
# Terminal 1 – Backend
cd server
node --experimental-sqlite src/index.js

# Terminal 2 – Frontend
cd client
npm run dev
```

---

## 🧠 How Risk Scoring Works

The scoring engine uses a **diminishing-returns formula**:

```
score = 100 × (1 − e^(−rawTotal / 60))
```

Where `rawTotal` is the sum of weighted flag contributions:
- Each red flag has a **base score** (5–35 points) and a **severity** (critical/high/medium/low)
- Severity weights: critical=1.0, high=0.8, medium=0.6, low=0.4
- `contribution = base_score × severity_weight`

This means:
- 1 critical flag (~30 raw) → score ~39
- 3 high-severity flags (~60 raw) → score ~63  
- 5 mixed flags (~90 raw) → score ~78

**Risk levels:**
- 0–20: Safe (green)
- 21–40: Low Risk (blue)
- 41–60: Medium Risk (amber)
- 61–80: High Risk (orange)
- 81–100: Critical Risk (red)

---

## 🧪 Sample Test Cases

| Message | Expected Risk | Category |
|---------|--------------|----------|
| "Your SBI account blocked. Click http://sbi-kyc.xyz" | Critical | Bank Fraud |
| "Share OTP urgently, my account will be blocked" | Critical | OTP Scam |
| "You have won Rs 25 lakh lottery. Pay fee to claim" | Critical | Lottery Scam |
| "Work from home, earn Rs 40k. Pay registration fee" | High | Job Scam |
| "Install AnyDesk for customer support" | Critical | Remote Access |
| "Your electricity bill is due on 15th June" | Safe | Safe |

---

## ⚠️ Limitations

- Analysis is rule-based, not true AI — novel scam variants may not be detected
- Cannot verify whether a URL is actually malicious (no network requests)
- No user authentication — local demo storage only
- English-language patterns only
- False positives possible for legitimate urgent messages

---

## 🔮 Future Enhancements

- Multi-language scam pattern support (Hindi, Tamil, etc.)
- Machine learning model trained on scam datasets
- Browser extension for real-time scanning
- Community-submitted scam patterns database
- Integration with government scam reporting APIs
- SMS forwarding for automatic scanning

---

## 🛡️ Safety Disclaimer

ScamShield AI is an **educational tool for demonstration purposes**. It does not:
- Make real API calls or visit URLs
- Guarantee detection of all scams
- Replace professional cybersecurity tools
- Store any sensitive personal data beyond local demo scans

If you suspect you've been scammed: Call **1930** (India Cybercrime Helpline) or visit **cybercrime.gov.in**.

---

*Built as a college minor project. For educational use only.*
