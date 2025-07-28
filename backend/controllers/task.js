const Task = require('../models/Task');
const DailyActivity = require('../models/DailyActivity');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { processRecurringTasks } = require('../utils/recurringTasks');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = asyncHandler(async (req, res, next) => {
  const { status, category, startDate, endDate, isRecurring } = req.query;
  
  let query = { user: req.user.id };
  
  // Add filters
  if (status) query.status = status;
  if (category) query.category = category;
  if (isRecurring !== undefined) query.isRecurring = isRecurring === 'true';
  if (startDate || endDate) {
    query.scheduledStart = {};
    if (startDate) query.scheduledStart.$gte = new Date(startDate);
    if (endDate) query.scheduledStart.$lte = new Date(endDate);
  }
  
  const tasks = await Task.find(query).sort({ scheduledStart: 1 });
  
  res.status(200).json({ 
    success: true, 
    count: tasks.length, 
    data: tasks 
  });
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findOne({ 
    _id: req.params.id, 
    user: req.user.id 
  });

  if (!task) {
    return next(new ErrorResponse('Task not found', 404));
  }

  res.status(200).json({ success: true, data: task });
});

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
exports.createTask = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  
  // Validate scheduled times
  if (req.body.scheduledEnd <= req.body.scheduledStart) {
    return next(new ErrorResponse('Scheduled end time must be after start time', 400));
  }
  
  const task = await Task.create(req.body);

  // Add task to DailyActivity
  const taskDate = new Date(task.scheduledStart);
  taskDate.setHours(0, 0, 0, 0);
  
  await DailyActivity.findOneAndUpdate(
    { user: req.user.id, date: taskDate },
    { 
      $push: { tasks: task._id },
      $inc: { totalTasks: 1 }
    },
    { new: true, upsert: true }
  );

  // If it's a recurring task, generate future occurrences
  if (task.isRecurring && task.recurrencePattern !== 'none') {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // Generate for next 30 days
    
    await processRecurringTasks(req.user.id, new Date(), endDate);
  }

  res.status(201).json({ success: true, data: task });
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findOne({ 
    _id: req.params.id, 
    user: req.user.id 
  });

  if (!task) {
    return next(new ErrorResponse('Task not found', 404));
  }

  // Validate scheduled times if being updated
  if (req.body.scheduledStart && req.body.scheduledEnd) {
    if (req.body.scheduledEnd <= req.body.scheduledStart) {
      return next(new ErrorResponse('Scheduled end time must be after start time', 400));
    }
  }
  
  // Validate actual times if being updated
  if (req.body.actualStart && req.body.actualEnd) {
    if (req.body.actualEnd <= req.body.actualStart) {
      return next(new ErrorResponse('Actual end time must be after start time', 400));
    }
  }

  // Store old date for DailyActivity update
  const oldDate = new Date(task.scheduledStart);
  oldDate.setHours(0, 0, 0, 0);

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Update DailyActivity if date changed
  const newDate = new Date(task.scheduledStart);
  newDate.setHours(0, 0, 0, 0);
  
  if (oldDate.getTime() !== newDate.getTime()) {
    // Remove from old daily activity
    await DailyActivity.findOneAndUpdate(
      { user: req.user.id, date: oldDate },
      { $pull: { tasks: task._id } }
    );
    
    // Add to new daily activity
    await DailyActivity.findOneAndUpdate(
      { user: req.user.id, date: newDate },
      { 
        $push: { tasks: task._id },
        $inc: { totalTasks: 1 }
      },
      { upsert: true }
    );
  }

  // Update DailyActivity stats
  await updateDailyActivityStats(req.user.id, newDate);

  res.status(200).json({ success: true, data: task });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findOne({ 
    _id: req.params.id, 
    user: req.user.id 
  });

  if (!task) {
    return next(new ErrorResponse('Task not found', 404));
  }

  // Remove from DailyActivity
  const taskDate = new Date(task.scheduledStart);
  taskDate.setHours(0, 0, 0, 0);
  
  await DailyActivity.findOneAndUpdate(
    { user: req.user.id, date: taskDate },
    { 
      $pull: { tasks: task._id },
      $inc: { totalTasks: -1 }
    }
  );

  await task.deleteOne();

  // Update DailyActivity stats
  await updateDailyActivityStats(req.user.id, taskDate);

  res.status(200).json({ success: true, data: {} });
});

// @desc    Start task timer
// @route   PUT /api/tasks/:id/start
// @access  Private
exports.startTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findOne({ 
    _id: req.params.id, 
    user: req.user.id 
  });

  if (!task) {
    return next(new ErrorResponse('Task not found', 404));
  }

  if (task.status === 'completed') {
    return next(new ErrorResponse('Cannot start a completed task', 400));
  }

  task.status = 'in-progress';
  task.actualStart = new Date();
  await task.save();

  res.status(200).json({ success: true, data: task });
});

// @desc    Stop task timer
// @route   PUT /api/tasks/:id/stop
// @access  Private
exports.stopTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findOne({ 
    _id: req.params.id, 
    user: req.user.id 
  });

  if (!task) {
    return next(new ErrorResponse('Task not found', 404));
  }

  if (task.status !== 'in-progress') {
    return next(new ErrorResponse('Task is not in progress', 400));
  }

  task.status = 'completed';
  task.actualEnd = new Date();
  await task.save();

  // Update DailyActivity stats
  const taskDate = new Date(task.scheduledStart);
  taskDate.setHours(0, 0, 0, 0);
  await updateDailyActivityStats(req.user.id, taskDate);

  res.status(200).json({ success: true, data: task });
});

// Helper function to update DailyActivity stats
const updateDailyActivityStats = async (userId, date) => {
  const dailyActivity = await DailyActivity.findOne({ user: userId, date });
  
  if (dailyActivity) {
    const tasks = await Task.find({ _id: { $in: dailyActivity.tasks } });
    
    const updatedData = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(task => task.status === 'completed').length,
      missedTasks: tasks.filter(task => task.status === 'missed').length,
      totalEffectiveMinutes: tasks
        .filter(task => task.status === 'completed' && task.actualDurationMinutes)
        .reduce((sum, task) => sum + task.actualDurationMinutes, 0)
    };
    
    await DailyActivity.findByIdAndUpdate(dailyActivity._id, updatedData);
  }
};
