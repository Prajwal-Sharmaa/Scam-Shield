function errorHandler(err, req, res, next) {
  console.error('[ScamShield Error]', err.message);
  res.status(500).json({ error: 'Internal server error. Please try again.' });
}

module.exports = errorHandler;
