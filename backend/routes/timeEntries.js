const express = require('express');
const router = express.Router();
const {
  getTimeEntries,
  getTimeEntry,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  startTimeTracking,
  stopTimeTracking,
  getCurrentTimer,
  getTimeStats
} = require('../controllers/timeEntries');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Routes for time entries
router.route('/')
  .get(getTimeEntries)
  .post(createTimeEntry);

router.route('/:id')
  .get(getTimeEntry)
  .put(updateTimeEntry)
  .delete(deleteTimeEntry);

// Timer routes
router.post('/start', startTimeTracking);
router.put('/:id/stop', stopTimeTracking);
router.get('/current', getCurrentTimer);

// Stats route
router.get('/stats', getTimeStats);

module.exports = router; 