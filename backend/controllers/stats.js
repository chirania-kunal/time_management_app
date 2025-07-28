const Task = require('../models/Task');
const DailyActivity = require('../models/DailyActivity');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get productivity stats
// @route   GET /api/stats/productivity
// @access  Private
exports.getProductivityStats = asyncHandler(async (req, res, next) => {
  const { period = 'week', startDate, endDate } = req.query;
  
  let start, end;
  
  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else {
    // Default to current period
    end = new Date();
    start = new Date();
    
    switch (period) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 7);
    }
  }
  
  // Get tasks for the period
  const tasks = await Task.find({
    user: req.user.id,
    scheduledStart: { $gte: start, $lte: end }
  });
  
  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const missedTasks = tasks.filter(task => task.status === 'missed').length;
  const scheduledTasks = tasks.filter(task => task.status === 'scheduled').length;
  
  const totalScheduledMinutes = tasks.reduce((sum, task) => sum + (task.durationMinutes || 0), 0);
  const totalActualMinutes = tasks.reduce((sum, task) => sum + (task.actualDurationMinutes || 0), 0);
  
  const avgProductivityScore = tasks.length > 0 
    ? tasks.reduce((sum, task) => sum + (task.productivityScore || 0), 0) / tasks.length
    : 0;
  
  // Calculate completion rate
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100) : 0;
  
  // Calculate efficiency (actual vs scheduled time)
  const efficiency = totalScheduledMinutes > 0 
    ? (totalActualMinutes / totalScheduledMinutes * 100) 
    : 0;
  
  // Get daily breakdown
  const dailyStats = await DailyActivity.aggregate([
    {
      $match: {
        user: req.user.id,
        date: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        totalTasks: { $sum: "$totalTasks" },
        completedTasks: { $sum: "$completedTasks" },
        totalEffectiveMinutes: { $sum: "$totalEffectiveMinutes" }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      period: {
        start: start,
        end: end
      },
      summary: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        missedTasks,
        scheduledTasks,
        completionRate: completionRate.toFixed(1),
        totalScheduledMinutes,
        totalActualMinutes,
        efficiency: efficiency.toFixed(1),
        avgProductivityScore: avgProductivityScore.toFixed(1)
      },
      dailyBreakdown: dailyStats
    }
  });
});

// @desc    Get task category stats
// @route   GET /api/stats/categories
// @access  Private
exports.getCategoryStats = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  let query = { user: req.user.id };
  if (startDate && endDate) {
    query.scheduledStart = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  
  const categoryStats = await Task.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$category",
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
        },
        totalScheduledMinutes: { $sum: "$durationMinutes" },
        totalActualMinutes: { $sum: "$actualDurationMinutes" },
        avgProductivityScore: { $avg: "$productivityScore" }
      }
    },
    {
      $project: {
        category: "$_id",
        totalTasks: 1,
        completedTasks: 1,
        completionRate: {
          $multiply: [
            { $divide: ["$completedTasks", "$totalTasks"] },
            100
          ]
        },
        totalScheduledMinutes: 1,
        totalActualMinutes: 1,
        avgProductivityScore: { $round: ["$avgProductivityScore", 1] }
      }
    },
    { $sort: { totalTasks: -1 } }
  ]);
  
  res.status(200).json({
    success: true,
    data: categoryStats
  });
});

// @desc    Get time tracking trends
// @route   GET /api/stats/trends
// @access  Private
exports.getTimeTrackingTrends = asyncHandler(async (req, res, next) => {
  const { days = 30 } = req.query;
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  
  const trends = await DailyActivity.aggregate([
    {
      $match: {
        user: req.user.id,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        totalTasks: { $sum: "$totalTasks" },
        completedTasks: { $sum: "$completedTasks" },
        totalEffectiveMinutes: { $sum: "$totalEffectiveMinutes" },
        completionRate: {
          $avg: {
            $cond: [
              { $gt: ["$totalTasks", 0] },
              { $divide: ["$completedTasks", "$totalTasks"] },
              0
            ]
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      period: { startDate, endDate },
      trends
    }
  });
}); 