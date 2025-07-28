const express = require('express');
const router = express.Router();
const {
  getDailyActivities,
  getDailyActivityByDate,
  updateDailyActivity
} = require('../controllers/dailyActivity');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Routes for daily activities
router.route('/')
  .get(getDailyActivities);

router.route('/:date')
  .get(getDailyActivityByDate);

router.route('/:id')
  .put(updateDailyActivity);

module.exports = router; 