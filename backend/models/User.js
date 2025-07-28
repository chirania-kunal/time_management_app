const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide first name'],
    trim: true,
    maxlength: [20, 'Name cannot be more than 50 characters']
  },
  lastName:{
    type: String,
    required:[true,'Please provide last name'],
    trim: true,
    maxlength : [20,'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  lastLogin: {
    type: Date,
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    weekStartDay: {
      type: String,
      enum: ['sunday', 'monday'],
      default: 'monday'
    },
    reminderMode: { 
      type: String, 
      enum: ['notification', 'call'], 
      default: 'notification' 
    }
  },
  dailyActivity:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"DailyActivity"
  }]
}, { timestamps: true });


module.exports = mongoose.model('User', UserSchema);
