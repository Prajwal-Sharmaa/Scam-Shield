const router = require('express').Router();
const { getScans, getScanById, createScan, deleteScan, deleteAllScans, markFalsePositive, exportCsv } = require('../controllers/scansController');

router.get('/export/csv', exportCsv);
router.get('/', getScans);
router.get('/:id', getScanById);
router.post('/', createScan);
router.delete('/', deleteAllScans);
router.delete('/:id', deleteScan);
router.patch('/:id/false-positive', markFalsePositive);

module.exports = router;
