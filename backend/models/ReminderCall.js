const mongoose = require('mongoose');

const reminderCallSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  callScheduledTime: {
    type: Date,
    required: true
  },
  callAttemptedAt: {
    type: Date
  },
  callCompletedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'called', 'failed'],
    default: 'pending'
  },
  failureReason: {
    type: String,
    default: null
  },
  reminderType: {
    type: String,
    enum: ['voice', 'sms', 'email'],
    default: 'voice'
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

module.exports = mongoose.model('ReminderCall', reminderCallSchema);
