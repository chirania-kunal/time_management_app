const mongoose = require('mongoose');

const categoryBreakdownSchema = new mongoose.Schema({
  category: String,
  totalTasks: Number,
  completedTasks: Number,
  productiveMinutes: Number
}, { _id: false });

const productivitySummarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['weekly', 'monthly'],
    required: true
  },
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  totalProductiveTime: {
    type: Number,
    default: 0 // in minutes
  },
  averageProductivity: {
    type: Number,
    default: 0 // could be a score or percentage
  },
  mostProductiveCategory: String,
  leastProductiveCategory: String,
  categoryBreakdown: [categoryBreakdownSchema]
}, {
  timestamps: true
});

// Optional: compound index to avoid duplicates
productivitySummarySchema.index({ user: 1, type: 1, periodStart: 1 }, { unique: true });

module.exports = mongoose.model('ProductivitySummary', productivitySummarySchema);
