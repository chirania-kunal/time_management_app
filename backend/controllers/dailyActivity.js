const DailyActivity = require('../models/DailyActivity');
const Task = require('../models/Task');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all daily activities for a user
// @route   GET /api/daily-activities
// @access  Private
exports.getDailyActivities = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, limit = 30 } = req.query;
  
  let query = { user: req.user.id };
  
  // Add date range filter if provided
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  const dailyActivities = await DailyActivity.find(query)
    .populate({
      path: 'tasks',
      select: 'title status scheduledStart scheduledEnd actualStart actualEnd durationMinutes actualDurationMinutes'
    })
    .sort({ date: -1 })
    .limit(parseInt(limit));
  
  res.status(200).json({
    success: true,
    count: dailyActivities.length,
    data: dailyActivities
  });
});

// @desc    Get daily activity by date
// @route   GET /api/daily-activities/:date
// @access  Private
exports.getDailyActivityByDate = asyncHandler(async (req, res, next) => {
  const { date } = req.params;
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  let dailyActivity = await DailyActivity.findOne({
    user: req.user.id,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).populate({
    path: 'tasks',
    select: 'title description status scheduledStart scheduledEnd actualStart actualEnd durationMinutes actualDurationMinutes category productivityScore'
  });
  
  // If no daily activity exists, create one with tasks for that date
  if (!dailyActivity) {
    // Get all tasks for this date
    const tasks = await Task.find({
      user: req.user.id,
      scheduledStart: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });
    
    // Create daily activity
    dailyActivity = await DailyActivity.create({
      user: req.user.id,
      date: startOfDay,
      tasks: tasks.map(task => task._id),
      totalTasks: tasks.length,
      completedTasks: tasks.filter(task => task.status === 'completed').length,
      missedTasks: tasks.filter(task => task.status === 'missed').length,
      totalEffectiveMinutes: tasks
        .filter(task => task.status === 'completed' && task.actualDurationMinutes)
        .reduce((sum, task) => sum + task.actualDurationMinutes, 0)
    });
    
    await dailyActivity.populate({
      path: 'tasks',
      select: 'title description status scheduledStart scheduledEnd actualStart actualEnd durationMinutes actualDurationMinutes category productivityScore'
    });
  }
  
  // Enrich with additional stats
  const enrichedData = {
    ...dailyActivity.toObject(),
    stats: {
      totalScheduledMinutes: dailyActivity.tasks.reduce((sum, task) => sum + (task.durationMinutes || 0), 0),
      totalActualMinutes: dailyActivity.tasks.reduce((sum, task) => sum + (task.actualDurationMinutes || 0), 0),
      completionRate: dailyActivity.totalTasks > 0 ? (dailyActivity.completedTasks / dailyActivity.totalTasks * 100).toFixed(1) : 0,
      productivityScore: dailyActivity.tasks.length > 0 
        ? (dailyActivity.tasks.reduce((sum, task) => sum + (task.productivityScore || 0), 0) / dailyActivity.tasks.length).toFixed(1)
        : 0
    }
  };
  
  res.status(200).json({
    success: true,
    data: enrichedData
  });
});

// @desc    Update daily activity stats
// @route   PUT /api/daily-activities/:id
// @access  Private
exports.updateDailyActivity = asyncHandler(async (req, res, next) => {
  const dailyActivity = await DailyActivity.findOne({
    _id: req.params.id,
    user: req.user.id
  });
  
  if (!dailyActivity) {
    return next(new ErrorResponse('Daily activity not found', 404));
  }
  
  // Recalculate stats based on current tasks
  const tasks = await Task.find({ _id: { $in: dailyActivity.tasks } });
  
  const updatedData = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.status === 'completed').length,
    missedTasks: tasks.filter(task => task.status === 'missed').length,
    totalEffectiveMinutes: tasks
      .filter(task => task.status === 'completed' && task.actualDurationMinutes)
      .reduce((sum, task) => sum + task.actualDurationMinutes, 0)
  };
  
  const updatedDailyActivity = await DailyActivity.findByIdAndUpdate(
    req.params.id,
    updatedData,
    { new: true, runValidators: true }
  ).populate({
    path: 'tasks',
    select: 'title status scheduledStart scheduledEnd actualStart actualEnd durationMinutes actualDurationMinutes'
  });
  
  res.status(200).json({
    success: true,
    data: updatedDailyActivity
  });
}); 