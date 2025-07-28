const Task = require('../models/Task');
const DailyActivity = require('../models/DailyActivity');

// Generate recurring tasks based on pattern
const generateRecurringTasks = async (baseTask, endDate = null) => {
  const tasks = [];
  const maxDate = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  
  let currentDate = new Date(baseTask.scheduledStart);
  let currentEndDate = new Date(baseTask.scheduledEnd);
  
  while (currentDate <= maxDate) {
    // Skip if this task already exists for this date
    const existingTask = await Task.findOne({
      user: baseTask.user,
      title: baseTask.title,
      scheduledStart: currentDate,
      isRecurring: true,
      recurrencePattern: baseTask.recurrencePattern
    });
    
    if (!existingTask) {
      const newTask = new Task({
        ...baseTask.toObject(),
        _id: undefined, // Remove the original ID
        scheduledStart: new Date(currentDate),
        scheduledEnd: new Date(currentEndDate),
        status: 'scheduled',
        actualStart: null,
        actualEnd: null,
        actualDurationMinutes: null
      });
      
      tasks.push(newTask);
    }
    
    // Calculate next occurrence based on pattern
    switch (baseTask.recurrencePattern) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1);
        currentEndDate.setDate(currentEndDate.getDate() + 1);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        currentEndDate.setDate(currentEndDate.getDate() + 7);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        currentEndDate.setMonth(currentEndDate.getMonth() + 1);
        break;
      default:
        break;
    }
  }
  
  return tasks;
};

// Process recurring tasks for a specific date range
const processRecurringTasks = async (userId, startDate, endDate) => {
  const recurringTasks = await Task.find({
    user: userId,
    isRecurring: true,
    recurrencePattern: { $ne: 'none' },
    scheduledStart: { $lte: endDate }
  });
  
  const generatedTasks = [];
  
  for (const task of recurringTasks) {
    const newTasks = await generateRecurringTasks(task, endDate);
    generatedTasks.push(...newTasks);
  }
  
  // Save all generated tasks
  if (generatedTasks.length > 0) {
    const savedTasks = await Task.insertMany(generatedTasks);
    
    // Update daily activities for the new tasks
    for (const task of savedTasks) {
      const taskDate = new Date(task.scheduledStart);
      taskDate.setHours(0, 0, 0, 0);
      
      await DailyActivity.findOneAndUpdate(
        { user: userId, date: taskDate },
        { $push: { tasks: task._id } },
        { upsert: true }
      );
    }
    
    return savedTasks;
  }
  
  return [];
};

// Clean up old recurring tasks (optional)
const cleanupOldRecurringTasks = async (userId, daysToKeep = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const deletedTasks = await Task.deleteMany({
    user: userId,
    isRecurring: true,
    scheduledStart: { $lt: cutoffDate },
    status: { $in: ['completed', 'missed'] }
  });
  
  return deletedTasks;
};

module.exports = {
  generateRecurringTasks,
  processRecurringTasks,
  cleanupOldRecurringTasks
}; 