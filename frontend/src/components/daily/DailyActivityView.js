import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  Warning as WarningIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const API = process.env.REACT_APP_API_URL;

const DailyActivityView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyActivity, setDailyActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchDailyActivity = useCallback(async () => {
    try {
      setLoading(true);
      const dateString = selectedDate.toISOString().split('T')[0];
      const response = await axios.get(`${API}/api/daily-activities/${dateString}`);
      setDailyActivity(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch daily activity');
      console.error('Error fetching daily activity:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchDailyActivity();
  }, [fetchDailyActivity]);

  const handleStartTimer = async (taskId) => {
    try {
      await axios.put(`${API}/api/tasks/${taskId}/start`);
      setSuccess('Task timer started');
      fetchDailyActivity();
    } catch (err) {
      setError('Failed to start timer');
    }
  };

  const handleStopTimer = async (taskId) => {
    try {
      await axios.put(`${API}/api/tasks/${taskId}/stop`);
      setSuccess('Task completed');
      fetchDailyActivity();
    } catch (err) {
      setError('Failed to stop timer');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'missed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'in-progress': return <TimerIcon />;
      case 'missed': return <WarningIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const calculateProgress = () => {
    if (!dailyActivity || dailyActivity.totalTasks === 0) return 0;
    return (dailyActivity.completedTasks / dailyActivity.totalTasks) * 100;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Header */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <CalendarIcon color="primary" />
                <Typography variant="h4" component="h1">
                  Daily Activity
                </Typography>
              </Box>
              <Box mt={2}>
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Summary Cards */}
          {dailyActivity && (
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Tasks
                      </Typography>
                      <Typography variant="h4">
                        {dailyActivity.totalTasks}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Completed
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {dailyActivity.completedTasks}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Missed
                      </Typography>
                      <Typography variant="h4" color="error.main">
                        {dailyActivity.missedTasks}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Time
                      </Typography>
                      <Typography variant="h4">
                        {formatDuration(dailyActivity.totalEffectiveMinutes)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          )}

          {/* Progress Bar */}
          {dailyActivity && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6">Daily Progress</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {dailyActivity.completedTasks} of {dailyActivity.totalTasks} tasks completed
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={calculateProgress()}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Box mt={1}>
                  <Typography variant="body2" color="textSecondary">
                    {calculateProgress().toFixed(1)}% complete
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Statistics */}
          {dailyActivity && dailyActivity.stats && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Daily Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccessTimeIcon color="primary" />
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Scheduled Time
                        </Typography>
                        <Typography variant="h6">
                          {formatDuration(dailyActivity.stats.totalScheduledMinutes)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TimerIcon color="success" />
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Actual Time
                        </Typography>
                        <Typography variant="h6">
                          {formatDuration(dailyActivity.stats.totalActualMinutes)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingUpIcon color="info" />
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Productivity Score
                        </Typography>
                        <Typography variant="h6">
                          {dailyActivity.stats.productivityScore}/10
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* Tasks List */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Tasks for {selectedDate.toLocaleDateString()}
              </Typography>
              {dailyActivity && dailyActivity.tasks && dailyActivity.tasks.length > 0 ? (
                <List>
                  {dailyActivity.tasks.map((task) => (
                    <React.Fragment key={task._id}>
                      <ListItem>
                        <ListItemIcon>
                          {getStatusIcon(task.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={task.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                {task.description}
                              </Typography>
                              <Box display="flex" gap={1} mt={1}>
                                <Chip
                                  label={task.status}
                                  color={getStatusColor(task.status)}
                                  size="small"
                                />
                                {task.category && (
                                  <Chip label={task.category} size="small" variant="outlined" />
                                )}
                                <Typography variant="body2" color="textSecondary">
                                  {formatTime(task.scheduledStart)} - {formatTime(task.scheduledEnd)}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box display="flex" gap={1}>
                            {task.status === 'scheduled' && (
                              <IconButton
                                color="primary"
                                onClick={() => handleStartTimer(task._id)}
                              >
                                <PlayIcon />
                              </IconButton>
                            )}
                            {task.status === 'in-progress' && (
                              <IconButton
                                color="success"
                                onClick={() => handleStopTimer(task._id)}
                              >
                                <StopIcon />
                              </IconButton>
                            )}
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="textSecondary">
                    No tasks scheduled for this date
                  </Typography>
                </Box>
              )}
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

        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess(null)}
        >
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default DailyActivityView; 