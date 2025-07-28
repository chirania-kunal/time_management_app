const Task = require('../models/Task');

// Get tasks that need reminders
const getTasksNeedingReminders = async (userId) => {
  const now = new Date();
  const reminderWindow = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
  
  const tasks = await Task.find({
    user: userId,
    status: { $in: ['scheduled', 'in-progress'] },
    scheduledStart: { $gte: now, $lte: reminderWindow },
    reminderType: { $exists: true, $ne: null }
  });
  
  return tasks;
};

// Process reminders (placeholder for now)
const processReminders = async (userId) => {
  const tasksNeedingReminders = await getTasksNeedingReminders(userId);
  
  const reminders = tasksNeedingReminders.map(task => ({
    taskId: task._id,
    title: task.title,
    scheduledStart: task.scheduledStart,
    reminderType: task.reminderType,
    message: `Reminder: ${task.title} is scheduled to start at ${task.scheduledStart.toLocaleTimeString()}`
  }));
  
  // TODO: Integrate with actual notification system (email, push notifications, etc.)
  console.log('Reminders to send:', reminders);
  
  return reminders;
};

// Mark reminder as sent
const markReminderSent = async (taskId) => {
  // TODO: Add a field to track if reminder was sent
  // await Task.findByIdAndUpdate(taskId, { reminderSent: true });
};

module.exports = {
  getTasksNeedingReminders,
  processReminders,
  markReminderSent
}; 