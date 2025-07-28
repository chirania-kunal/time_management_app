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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

const API = process.env.REACT_APP_API_URL;

const ProductivityDashboard = () => {
  const [productivityStats, setProductivityStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('week');

  const fetchAllStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch productivity stats
      const productivityResponse = await axios.get(`${API}/api/stats/productivity?period=${period}`);
      setProductivityStats(productivityResponse.data.data);
      
      // Fetch category stats
      const categoryResponse = await axios.get(`${API}/api/stats/categories`);
      setCategoryStats(categoryResponse.data.data);
      
      // Fetch trends
      const trendsResponse = await axios.get(`${API}/api/stats/trends?days=30`);
      setTrends(trendsResponse.data.data.trends);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPercentage = (value) => {
    return `${parseFloat(value).toFixed(1)}%`;
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
        {/* Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUpIcon color="primary" />
                <Typography variant="h4" component="h1">
                  Productivity Dashboard
                </Typography>
              </Box>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Period</InputLabel>
                <Select
                  value={period}
                  label="Period"
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <MenuItem value="day">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>
        </Grid>

        {/* Summary Cards */}
        {productivityStats && (
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircleIcon color="success" />
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Completion Rate
                        </Typography>
                        <Typography variant="h4">
                          {formatPercentage(productivityStats.summary.completionRate)}
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
                      <TimerIcon color="primary" />
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Efficiency
                        </Typography>
                        <Typography variant="h4">
                          {formatPercentage(productivityStats.summary.efficiency)}
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
                      <ScheduleIcon color="info" />
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Total Tasks
                        </Typography>
                        <Typography variant="h4">
                          {productivityStats.summary.totalTasks}
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
                      <TrendingUpIcon color="secondary" />
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Avg Productivity
                        </Typography>
                        <Typography variant="h4">
                          {productivityStats.summary.avgProductivityScore}/10
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Time Distribution Chart */}
        {productivityStats && (
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Time Distribution
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productivityStats.dailyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'totalTasks' ? value : formatDuration(value),
                        name === 'totalTasks' ? 'Tasks' : 'Minutes'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="totalEffectiveMinutes" name="Effective Time" fill="#8884d8" />
                    <Bar dataKey="totalTasks" name="Tasks" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Category Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Category Distribution
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, totalTasks }) => `${category}: ${totalTasks}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalTasks"
                    nameKey="category"
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name === 'totalTasks' ? 'Tasks' : 'Minutes']} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Trends Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Productivity Trends (Last 30 Days)
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'completionRate' ? formatPercentage(value) : value,
                      name === 'completionRate' ? 'Completion Rate' : 
                      name === 'totalTasks' ? 'Tasks' : 'Minutes'
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="completionRate" 
                    name="Completion Rate" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalTasks" 
                    name="Total Tasks" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalEffectiveMinutes" 
                    name="Effective Minutes" 
                    stroke="#ffc658" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Category Statistics Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Category Performance
            </Typography>
            <Grid container spacing={2}>
              {categoryStats.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.category}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <CategoryIcon color="primary" />
                        <Typography variant="h6">
                          {category.category || 'Uncategorized'}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {category.totalTasks} tasks • {formatPercentage(category.completionRate)} completion
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Scheduled: {formatDuration(category.totalScheduledMinutes)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Actual: {formatDuration(category.totalActualMinutes)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Avg Score: {category.avgProductivityScore}/10
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
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

export default ProductivityDashboard; 