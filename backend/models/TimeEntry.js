const mongoose = require('mongoose');

const TimeEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: false
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  startTime: {
    type: Date,
    required: [true, 'Please provide a start time']
  },
  endTime: {
    type: Date,
    required: false
  },
  duration: {
    type: Number, // Duration in minutes
    required: false
  },
  isRunning: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['work', 'personal', 'learning', 'health', 'other'],
    default: 'work'
  }
}, { timestamps: true });

// Calculate duration before saving if start and end times are provided
TimeEntrySchema.pre('save', function(next) {
  if (this.startTime && this.endTime && !this.duration) {
    const durationMs = this.endTime - this.startTime;
    this.duration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
  }
  next();
});

module.exports = mongoose.model('TimeEntry', TimeEntrySchema); 