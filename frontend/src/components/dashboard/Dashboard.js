import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Assignment as TaskIcon,
  CheckCircle as CheckCircleIcon,
  Timer as TimerIcon,
  TrendingUp as ProductivityIcon,
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch productivity stats for today
      const statsResponse = await axios.get('/api/stats/productivity?period=day');
      setStats(statsResponse.data.data);
      
      // Fetch recent tasks
      const tasksResponse = await axios.get('/api/tasks?limit=5');
      setRecentTasks(tasksResponse.data.data);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPercentage = (value) => {
    return `${parseFloat(value).toFixed(1)}%`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'missed': return 'error';
      default: return 'default';
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome to Your Time Tracking Dashboard
            </Typography>
            <Typography variant="body1">
              Track your tasks, monitor productivity, and stay organized with your daily activities.
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        {stats && (
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TaskIcon color="primary" />
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Today's Tasks
                        </Typography>
                        <Typography variant="h4">
                          {stats.summary.totalTasks}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircleIcon color="success" />
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Completed
                        </Typography>
                        <Typography variant="h4">
                          {stats.summary.completedTasks}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TimerIcon color="info" />
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Completion Rate
                        </Typography>
                        <Typography variant="h4">
                          {formatPercentage(stats.summary.completionRate)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ProductivityIcon color="secondary" />
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Productivity
                        </Typography>
                        <Typography variant="h4">
                          {stats.summary.avgProductivityScore}/10
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                  onClick={() => navigate('/tasks')}
                  sx={{ py: 2 }}
                >
                  Create Task
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<CalendarIcon />}
                  fullWidth
                  onClick={() => navigate('/daily')}
                  sx={{ py: 2 }}
                >
                  View Daily Activity
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<ProductivityIcon />}
                  fullWidth
                  onClick={() => navigate('/productivity')}
                  sx={{ py: 2 }}
                >
                  Productivity Report
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<PlayIcon />}
                  fullWidth
                  onClick={() => navigate('/tasks')}
                  sx={{ py: 2 }}
                >
                  Start Timer
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Today's Progress */}
        {stats && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Today's Progress
              </Typography>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Task Completion
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats.summary.completedTasks} of {stats.summary.totalTasks}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats.summary.totalTasks > 0 ? (stats.summary.completedTasks / stats.summary.totalTasks) * 100 : 0}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Time Efficiency
                </Typography>
                <Typography variant="h6">
                  {formatPercentage(stats.summary.efficiency)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {formatDuration(stats.summary.totalActualMinutes)} / {formatDuration(stats.summary.totalScheduledMinutes)}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Recent Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Recent Tasks
              </Typography>
              <Button
                size="small"
                onClick={() => navigate('/tasks')}
              >
                View All
              </Button>
            </Box>
            {recentTasks.length > 0 ? (
              <Box>
                {recentTasks.slice(0, 5).map((task) => (
                  <Box key={task._id} mb={2} p={2} border={1} borderColor="divider" borderRadius={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Typography variant="subtitle2" gutterBottom>
                          {task.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {task.description}
                        </Typography>
                        <Box display="flex" gap={1} alignItems="center">
                          <Chip
                            label={task.status}
                            color={getStatusColor(task.status)}
                            size="small"
                          />
                          {task.category && (
                            <Chip label={task.category} size="small" variant="outlined" />
                          )}
                        </Box>
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        {formatDateTime(task.scheduledStart)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="textSecondary">
                  No tasks found
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/tasks')}
                  sx={{ mt: 2 }}
                >
                  Create Your First Task
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Productivity Tips */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, background: '#f8f9fa' }}>
            <Typography variant="h6" gutterBottom>
              💡 Productivity Tips
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  • Break large tasks into smaller, manageable chunks
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  • Use the Pomodoro Technique for focused work sessions
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  • Review your daily progress to identify patterns
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  • Set realistic time estimates for your tasks
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard; 