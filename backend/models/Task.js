const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    // ... existing fields ...
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index:true
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String, // e.g. Work, Exercise, etc.
    },

    scheduledStart: {
      type: Date,
      required: true,
    },
    scheduledEnd: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number // Optional, but useful for visualizing time slots
      // required: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrencePattern: {
      type: String,
      enum: ["daily", "weekly", "monthly", "none"],
      default: "none",
    },
    notes: {
      type: String,
    },

    reminderType: {
      type: String,
      enum: ["notification", "call"],
      default: "notification",
    },
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "missed"],
      default: "scheduled",
    },
    productivityScore: Number, // Optional if using ML or manual entry

    // *** NEW FIELDS ***
    actualStart: {
      type: Date,
    },
    actualEnd: {
      type: Date,
    },
    actualDurationMinutes: {
        type: Number,
        // Calculated based on actualStart and actualEnd
    }
  },
  { timestamps: true } // Keep this for createdAt and updatedAt
);

// Pre-save hook for durationMinutes (original)
taskSchema.pre("save", function (next) {
  if (this.isModified('scheduledStart') || this.isModified('scheduledEnd')) {
    if (this.scheduledStart && this.scheduledEnd && !this.durationMinutes) {
        this.durationMinutes = Math.round(
            (this.scheduledEnd - this.scheduledStart) / (1000 * 60)
        );
    }
  }

  // Calculate actualDurationMinutes if actualStart and actualEnd are present
  if (this.actualStart && this.actualEnd && (this.isModified('actualStart') || this.isModified('actualEnd'))) {
    this.actualDurationMinutes = Math.round(
      (this.actualEnd - this.actualStart) / (1000 * 60)
    );
  }
  next();
});

// Pre-validate hook for scheduledEnd (original)
taskSchema.pre("validate", function (next) {
  if (this.scheduledEnd <= this.scheduledStart) {
    return next(new Error("scheduledEnd must be after scheduledStart"));
  }
  // Optional: Add validation for actualEnd vs actualStart if you want to enforce it
  if (this.actualStart && this.actualEnd && this.actualEnd <= this.actualStart) {
      return next(new Error("actualEnd must be after actualStart"));
  }
  next();
});

module.exports = mongoose.model("Task", taskSchema);