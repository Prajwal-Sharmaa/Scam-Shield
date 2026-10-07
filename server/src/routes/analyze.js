const router = require('express').Router();
const { analyzeMessageHandler, analyzeUrlHandler, saveScanHandler } = require('../controllers/analyzeController');

router.post('/message', analyzeMessageHandler);
router.post('/url', analyzeUrlHandler);
router.post('/save', saveScanHandler);

module.exports = router;
