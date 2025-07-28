const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  startTask,
  stopTask
} = require('../controllers/task');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Routes for tasks
router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

// Timer routes
router.put('/:id/start', startTask);
router.put('/:id/stop', stopTask);

module.exports = router;
