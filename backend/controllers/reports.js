const TimeEntry = require('../models/TimeEntry');
const Project = require('../models/Project');
const moment = require('moment');

// @desc    Get time summary report
// @route   GET /api/reports/summary
// @access  Private
exports.getSummaryReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;
    
    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide start and end dates'
      });
    }
    
    // Set date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Find all completed time entries in the date range
    const timeEntries = await TimeEntry.find({
      user: req.user.id,
      startTime: { $gte: start, $lte: end },
      duration: { $exists: true, $ne: null }
    }).populate('project', 'name color');
    
    // Calculate total time
    const totalMinutes = timeEntries.reduce((total, entry) => total + entry.duration, 0);
    const totalHours = Math.round((totalMinutes / 60) * 100) / 100;
    
    // Group data based on groupBy parameter
    let groupedData = {};
    
    switch (groupBy) {
      case 'day':
        timeEntries.forEach(entry => {
          const day = moment(entry.startTime).format('YYYY-MM-DD');
          if (!groupedData[day]) {
            groupedData[day] = 0;
          }
          groupedData[day] += entry.duration;
        });
        break;
        
      case 'week':
        timeEntries.forEach(entry => {
          const week = moment(entry.startTime).format('YYYY-[W]WW');
          if (!groupedData[week]) {
            groupedData[week] = 0;
          }
          groupedData[week] += entry.duration;
        });
        break;
        
      case 'month':
        timeEntries.forEach(entry => {
          const month = moment(entry.startTime).format('YYYY-MM');
          if (!groupedData[month]) {
            groupedData[month] = 0;
          }
          groupedData[month] += entry.duration;
        });
        break;
        
      case 'project':
        timeEntries.forEach(entry => {
          if (entry.project) {
            const projectId = entry.project._id.toString();
            const projectName = entry.project.name;
            
            if (!groupedData[projectId]) {
              groupedData[projectId] = {
                id: projectId,
                name: projectName,
                color: entry.project.color,
                minutes: 0
              };
            }
            groupedData[projectId].minutes += entry.duration;
          } else {
            if (!groupedData['no-project']) {
              groupedData['no-project'] = {
                id: 'no-project',
                name: 'No Project',
                color: '#9e9e9e',
                minutes: 0
              };
            }
            groupedData['no-project'].minutes += entry.duration;
          }
        });
        groupedData = Object.values(groupedData);
        break;
        
      case 'category':
        timeEntries.forEach(entry => {
          const category = entry.category || 'other';
          if (!groupedData[category]) {
            groupedData[category] = 0;
          }
          groupedData[category] += entry.duration;
        });
        break;
        
      default:
        // No grouping, return daily data
        timeEntries.forEach(entry => {
          const day = moment(entry.startTime).format('YYYY-MM-DD');
          if (!groupedData[day]) {
            groupedData[day] = 0;
          }
          groupedData[day] += entry.duration;
        });
    }
    
    res.status(200).json({
      success: true,
      data: {
        totalMinutes,
        totalHours,
        startDate: start,
        endDate: end,
        groupBy: groupBy || 'day',
        groupedData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get detailed time entries report
// @route   GET /api/reports/detailed
// @access  Private
exports.getDetailedReport = async (req, res) => {
  try {
    const { startDate, endDate, project, category } = req.query;
    
    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide start and end dates'
      });
    }
    
    // Set date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Build query
    let query = {
      user: req.user.id,
      startTime: { $gte: start, $lte: end },
      duration: { $exists: true, $ne: null }
    };
    
    // Filter by project if provided
    if (project) {
      query.project = project;
    }
    
    // Filter by category if provided
    if (category) {
      query.category = category;
    }
    
    // Find all completed time entries in the date range
    const timeEntries = await TimeEntry.find(query)
      .populate('project', 'name color')
      .sort({ startTime: -1 });
    
    // Calculate total time
    const totalMinutes = timeEntries.reduce((total, entry) => total + entry.duration, 0);
    const totalHours = Math.round((totalMinutes / 60) * 100) / 100;
    
    // Group entries by day
    const entriesByDay = {};
    timeEntries.forEach(entry => {
      const day = moment(entry.startTime).format('YYYY-MM-DD');
      if (!entriesByDay[day]) {
        entriesByDay[day] = [];
      }
      entriesByDay[day].push({
        id: entry._id,
        description: entry.description,
        project: entry.project ? {
          id: entry.project._id,
          name: entry.project.name,
          color: entry.project.color
        } : null,
        category: entry.category,
        startTime: entry.startTime,
        endTime: entry.endTime,
        duration: entry.duration,
        tags: entry.tags
      });
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalMinutes,
        totalHours,
        startDate: start,
        endDate: end,
        entriesByDay
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get productivity heatmap data
// @route   GET /api/reports/heatmap
// @access  Private
exports.getHeatmapData = async (req, res) => {
  try {
    // Get date range (default to last 365 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365);
    
    // Find all completed time entries in the date range
    const timeEntries = await TimeEntry.find({
      user: req.user.id,
      startTime: { $gte: startDate, $lte: endDate },
      duration: { $exists: true, $ne: null }
    });
    
    // Group by day for heatmap
    const heatmapData = {};
    timeEntries.forEach(entry => {
      const day = moment(entry.startTime).format('YYYY-MM-DD');
      if (!heatmapData[day]) {
        heatmapData[day] = 0;
      }
      heatmapData[day] += entry.duration;
    });
    
    // Convert to array format for heatmap
    const formattedData = Object.keys(heatmapData).map(date => ({
      date,
      value: Math.round(heatmapData[date] / 60), // Convert to hours
      intensity: calculateIntensity(heatmapData[date])
    }));
    
    res.status(200).json({
      success: true,
      data: {
        startDate,
        endDate,
        heatmapData: formattedData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to calculate intensity level (1-5) for heatmap
const calculateIntensity = (minutes) => {
  const hours = minutes / 60;
  if (hours < 1) return 1;
  if (hours < 3) return 2;
  if (hours < 5) return 3;
  if (hours < 8) return 4;
  return 5;
}; 