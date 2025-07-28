import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon
} from '@mui/icons-material';

const statusOptions = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'missed', label: 'Missed' }
];

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  // Task form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    scheduledStart: '',
    scheduledEnd: '',
    status: 'scheduled',
    productivityScore: 5
  });

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/tasks');
      setTasks(res.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Open dialog for add/edit
  const handleOpenDialog = (task = null) => {
    setEditTask(task);
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        category: task.category || '',
        scheduledStart: task.scheduledStart ? task.scheduledStart.slice(0, 16) : '',
        scheduledEnd: task.scheduledEnd ? task.scheduledEnd.slice(0, 16) : '',
        status: task.status,
        productivityScore: task.productivityScore || 5
      });
    } else {
      setForm({
        title: '',
        description: '',
        category: '',
        scheduledStart: '',
        scheduledEnd: '',
        status: 'scheduled',
        productivityScore: 5
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditTask(null);
    setForm({
      title: '',
      description: '',
      category: '',
      scheduledStart: '',
      scheduledEnd: '',
      status: 'scheduled',
      productivityScore: 5
    });
  };

  // Handle form change
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create or update task
  const handleSubmit = async (e) => {
    e.preventDefault();
    setDialogLoading(true);
    try {
      if (editTask) {
        await axios.put(`/api/tasks/${editTask._id}`, form);
        setSuccess('Task updated successfully');
      } else {
        await axios.post('/api/tasks', form);
        setSuccess('Task created successfully');
      }
      handleCloseDialog();
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setDialogLoading(false);
    }
  };

  // Delete task
  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;
    setDialogLoading(true);
    try {
      await axios.delete(`/api/tasks/${deleteTaskId}`);
      setSuccess('Task deleted successfully');
      setDeleteTaskId(null);
      fetchTasks();
    } catch (err) {
      setError('Failed to delete task');
    } finally {
      setDialogLoading(false);
    }
  };

  // Start/Stop timer (for demo, just update status)
  const handleStartTask = async (taskId) => {
    try {
      await axios.put(`/api/tasks/${taskId}/start`);
      setSuccess('Task started');
      fetchTasks();
    } catch (err) {
      setError('Failed to start task');
    }
  };
  const handleStopTask = async (taskId) => {
    try {
      await axios.put(`/api/tasks/${taskId}/stop`);
      setSuccess('Task completed');
      fetchTasks();
    } catch (err) {
      setError('Failed to complete task');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4">Task Manager</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                Add Task
              </Button>
            </Box>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Scheduled</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Productivity</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No tasks found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tasks.map((task) => (
                        <TableRow key={task._id}>
                          <TableCell>{task.title}</TableCell>
                          <TableCell>{task.description}</TableCell>
                          <TableCell>{task.category}</TableCell>
                          <TableCell>
                            {task.scheduledStart ? new Date(task.scheduledStart).toLocaleString() : ''}
                            <br />
                            {task.scheduledEnd ? new Date(task.scheduledEnd).toLocaleString() : ''}
                          </TableCell>
                          <TableCell>
                            <Chip label={task.status} color={
                              task.status === 'completed' ? 'success' :
                              task.status === 'in-progress' ? 'primary' :
                              task.status === 'missed' ? 'error' : 'default'
                            } />
                          </TableCell>
                          <TableCell>
                            <Chip label={task.productivityScore ? `${task.productivityScore}/10` : '-'} color="info" />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton onClick={() => handleOpenDialog(task)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton onClick={() => setDeleteTaskId(task._id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                            {task.status === 'scheduled' && (
                              <Tooltip title="Start">
                                <IconButton color="primary" onClick={() => handleStartTask(task._id)}>
                                  <PlayIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            {task.status === 'in-progress' && (
                              <Tooltip title="Complete">
                                <IconButton color="success" onClick={() => handleStopTask(task._id)}>
                                  <StopIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Add/Edit Task Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editTask ? 'Edit Task' : 'Add Task'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Title"
              name="title"
              value={form.title}
              onChange={handleFormChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Description"
              name="description"
              value={form.description}
              onChange={handleFormChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Category"
              name="category"
              value={form.category}
              onChange={handleFormChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Scheduled Start"
              name="scheduledStart"
              type="datetime-local"
              value={form.scheduledStart}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Scheduled End"
              name="scheduledEnd"
              type="datetime-local"
              value={form.scheduledEnd}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="normal"
              fullWidth
              select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleFormChange}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="normal"
              fullWidth
              label="Productivity Score (1-10)"
              name="productivityScore"
              type="number"
              inputProps={{ min: 1, max: 10 }}
              value={form.productivityScore}
              onChange={handleFormChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={dialogLoading}>
            {dialogLoading ? <CircularProgress size={20} /> : (editTask ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTaskId} onClose={() => setDeleteTaskId(null)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this task?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTaskId(null)}>Cancel</Button>
          <Button onClick={handleDeleteTask} color="error" variant="contained" disabled={dialogLoading}>
            {dialogLoading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
      </Snackbar>
    </Container>
  );
};

export default TaskManager;