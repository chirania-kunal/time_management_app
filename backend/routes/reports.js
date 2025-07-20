const express = require('express');
const router = express.Router();
const {
  getSummaryReport,
  getDetailedReport,
  getHeatmapData
} = require('../controllers/reports');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Routes for reports
router.get('/summary', getSummaryReport);
router.get('/detailed', getDetailedReport);
router.get('/heatmap', getHeatmapData);

module.exports = router; 