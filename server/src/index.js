require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { initializeDatabase } = require('./database/init');
const analyzeRoutes = require('./routes/analyze');
const scansRoutes = require('./routes/scans');
const analyticsRoutes = require('./routes/analytics');
const demoRoutes = require('./routes/demo');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '50kb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Initialize DB
initializeDatabase();

// Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/scans', scansRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/demo-data', demoRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', name: 'ScamShield AI' }));

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`ScamShield AI server running on http://localhost:${PORT}`);
});

module.exports = app;
