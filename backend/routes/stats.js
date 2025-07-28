const express = require('express');
const router = express.Router();
const {
  getProductivityStats,
  getCategoryStats,
  getTimeTrackingTrends
} = require('../controllers/stats');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Stats routes
router.get('/productivity', getProductivityStats);
router.get('/categories', getCategoryStats);
router.get('/trends', getTimeTrackingTrends);

module.exports = router; 