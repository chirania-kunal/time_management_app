const mongoose = require('mongoose');

const dailyActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  totalTasks: {
    type: Number,
    default: 0
  },
  completedTasks: {
    type: Number,
    default: 0
  },
  missedTasks: {
    type: Number,
    default: 0
  },
  totalEffectiveMinutes: {
    type: Number,
    default: 0 // sum of effective durations of completed tasks
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task"
  }],
  productiveSummaries : [{
    type:mongoose.Schema.Types.ObjectId,
    ref:"ProductivitySummary"
  }]

}, { timestamps: true });

dailyActivitySchema.index({ user: 1, date: 1 }, { unique: true });


module.exports = mongoose.model('DailyActivity', dailyActivitySchema);
