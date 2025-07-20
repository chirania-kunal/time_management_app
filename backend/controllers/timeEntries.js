const TimeEntry = require('../models/TimeEntry');
const Project = require('../models/Project');
const moment = require('moment');

// @desc    Get all time entries
// @route   GET /api/time-entries
// @access  Private
exports.getTimeEntries = async (req, res) => {
  try {
    // Build query
    let query = { user: req.user.id };
    
    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.startTime = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    // Filter by project
    if (req.query.project) {
      query.project = req.query.project;
    }
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by tags
    if (req.query.tags) {
      const tags = req.query.tags.split(',');
      query.tags = { $in: tags };
    }
    
    // Filter by running status
    if (req.query.isRunning) {
      query.isRunning = req.query.isRunning === 'true';
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Execute query
    const timeEntries = await TimeEntry.find(query)
      .populate('project', 'name color')
      .sort({ startTime: -1 })
      .skip(startIndex)
      .limit(limit);
    
    // Get total count
    const total = await TimeEntry.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: timeEntries.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: timeEntries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single time entry
// @route   GET /api/time-entries/:id
// @access  Private
exports.getTimeEntry = async (req, res) => {
  try {
    const timeEntry = await TimeEntry.findById(req.params.id).populate('project', 'name color');
    
    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        message: 'Time entry not found'
      });
    }
    
    // Make sure user owns the time entry
    if (timeEntry.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this time entry'
      });
    }
    
    res.status(200).json({
      success: true,
      data: timeEntry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new time entry
// @route   POST /api/time-entries
// @access  Private
exports.createTimeEntry = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    // Create time entry
    const timeEntry = await TimeEntry.create(req.body);
    
    res.status(201).json({
      success: true,
      data: timeEntry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update time entry
// @route   PUT /api/time-entries/:id
// @access  Private
exports.updateTimeEntry = async (req, res) => {
  try {
    let timeEntry = await TimeEntry.findById(req.params.id);
    
    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        message: 'Time entry not found'
      });
    }
    
    // Make sure user owns the time entry
    if (timeEntry.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this time entry'
      });
    }
    
    // Update time entry
    timeEntry = await TimeEntry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('project', 'name color');
    
    res.status(200).json({
      success: true,
      data: timeEntry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete time entry
// @route   DELETE /api/time-entries/:id
// @access  Private
exports.deleteTimeEntry = async (req, res) => {
  try {
    const timeEntry = await TimeEntry.findById(req.params.id);
    
    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        message: 'Time entry not found'
      });
    }
    
    // Make sure user owns the time entry
    if (timeEntry.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this time entry'
      });
    }
    
    await timeEntry.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Start time tracking
// @route   POST /api/time-entries/start
// @access  Private
exports.startTimeTracking = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    req.body.startTime = new Date();
    req.body.isRunning = true;

    // Check if project exists
    const project = await Project.findById(req.body.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `No project found with id of ${req.body.project}`
      });
    }

    // Check if user already has a running time entry
    const runningEntry = await TimeEntry.findOne({
      user: req.user.id,
      isRunning: true
    });

    if (runningEntry) {
      return res.status(400).json({
        success: false,
        message: 'You already have a running time entry'
      });
    }

    // Create time entry
    const timeEntry = await TimeEntry.create(req.body);

    res.status(201).json({
      success: true,
      data: timeEntry
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Stop time tracking
// @route   PUT /api/time-entries/:id/stop
// @access  Private
exports.stopTimeTracking = async (req, res) => {
  try {
    let timeEntry = await TimeEntry.findById(req.params.id);

    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        message: `No time entry found with id of ${req.params.id}`
      });
    }

    // Make sure user is time entry owner
    if (timeEntry.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this time entry`
      });
    }

    // Make sure time entry is running
    if (!timeEntry.isRunning) {
      return res.status(400).json({
        success: false,
        message: 'This time entry is not currently running'
      });
    }

    // Update time entry
    timeEntry = await TimeEntry.findByIdAndUpdate(
      req.params.id,
      {
        endTime: new Date(),
        isRunning: false
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: timeEntry
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get user's current running timer
// @route   GET /api/time-entries/current
// @access  Private
exports.getCurrentTimer = async (req, res) => {
  try {
    const timeEntry = await TimeEntry.findOne({
      user: req.user.id,
      isRunning: true
    }).populate('project', 'name color');
    
    res.status(200).json({
      success: true,
      data: timeEntry || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's time statistics
// @route   GET /api/time-entries/stats
// @access  Private
exports.getTimeStats = async (req, res) => {
  try {
    const { period } = req.query;
    let startDate, endDate;
    
    // Set date range based on period
    switch (period) {
      case 'day':
        startDate = moment().startOf('day').toDate();
        endDate = moment().endOf('day').toDate();
        break;
      case 'week':
        startDate = moment().startOf('week').toDate();
        endDate = moment().endOf('week').toDate();
        break;
      case 'month':
        startDate = moment().startOf('month').toDate();
        endDate = moment().endOf('month').toDate();
        break;
      case 'year':
        startDate = moment().startOf('year').toDate();
        endDate = moment().endOf('year').toDate();
        break;
      default:
        startDate = moment().subtract(30, 'days').toDate();
        endDate = moment().toDate();
    }
    
    // Get all time entries in the date range
    const timeEntries = await TimeEntry.find({
      user: req.user.id,
      startTime: { $gte: startDate, $lte: endDate },
      duration: { $exists: true, $ne: null } // Only completed entries
    }).populate('project', 'name color');
    
    // Calculate total time
    const totalMinutes = timeEntries.reduce((total, entry) => total + entry.duration, 0);
    
    // Group by category
    const categoryStats = {};
    timeEntries.forEach(entry => {
      const category = entry.category || 'other';
      if (!categoryStats[category]) {
        categoryStats[category] = 0;
      }
      categoryStats[category] += entry.duration;
    });
    
    // Group by project
    const projectStats = {};
    timeEntries.forEach(entry => {
      if (entry.project) {
        const projectId = entry.project._id.toString();
        const projectName = entry.project.name;
        const projectColor = entry.project.color;
        
        if (!projectStats[projectId]) {
          projectStats[projectId] = {
            id: projectId,
            name: projectName,
            color: projectColor,
            minutes: 0
          };
        }
        projectStats[projectId].minutes += entry.duration;
      }
    });
    
    // Group by day for heatmap
    const dailyStats = {};
    timeEntries.forEach(entry => {
      const day = moment(entry.startTime).format('YYYY-MM-DD');
      if (!dailyStats[day]) {
        dailyStats[day] = 0;
      }
      dailyStats[day] += entry.duration;
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalMinutes,
        totalHours: Math.round((totalMinutes / 60) * 100) / 100,
        categoryStats,
        projectStats: Object.values(projectStats),
        dailyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};