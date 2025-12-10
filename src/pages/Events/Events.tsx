import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Publish as PublishIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import type { Event, CreateEventDto, UpdateEventDto, EventCategory, EventStatus, EventFunction } from '../../types';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<{ id: string; name: string } | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateEventDto>({
    name: '',
    description: '',
    category: 'music',
    location: '',
    functions: [],
  });
  const [newFunction, setNewFunction] = useState({
    date_time: '',
    duration_minutes: 120,
    capacity: 100,
    available_seats: 100,
  });
  const { showNotification } = useNotification();

  // Helper function to safely get event ID (handles both _id and id)
  const getEventId = (event: any): string => {
    const id = event._id || event.id;
    console.log('🔑 [Events] Getting event ID:', { _id: event._id, id: event.id, resolved: id });
    return id;
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getAllEventsAdmin();
      console.log('📊 [Events] Loaded events:', data);
      console.log('📊 [Events] First event structure:', data[0]);
      setEvents(data);
    } catch (error: any) {
      console.error('Failed to load events:', error);
      showNotification('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (event?: Event) => {
    if (event) {
      const eventId = getEventId(event);
      console.log('✏️ [Events] Opening edit dialog for event:', eventId, event);
      setSelectedEvent(event);
      setEditingEventId(eventId);
      setFormData({
        name: event.name,
        description: event.description,
        category: event.category,
        location: event.location,
        functions: event.functions,
      });
    } else {
      console.log('➕ [Events] Opening create dialog');
      setSelectedEvent(null);
      setEditingEventId(null);
      setFormData({
        name: '',
        description: '',
        category: 'music',
        location: '',
        functions: [],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
    setEditingEventId(null);
  };

  const handleAddFunction = () => {
    setFormData({
      ...formData,
      functions: [...formData.functions, { ...newFunction, id: Date.now().toString() }],
    });
    setNewFunction({
      date_time: '',
      duration_minutes: 120,
      capacity: 100,
      available_seats: 100,
    });
  };

  const handleRemoveFunction = (index: number) => {
    setFormData({
      ...formData,
      functions: formData.functions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingEventId) {
        // Update event
        const updateData: UpdateEventDto = {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          location: formData.location,
        };
        await api.updateEvent(editingEventId, updateData);
        showNotification('Event updated successfully', 'success');
      } else {
        // Create event
        await api.createEvent(formData);
        showNotification('Event created successfully', 'success');
      }
      handleCloseDialog();
      loadEvents();
    } catch (error: any) {
      console.error('Failed to save event:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to save event';
      showNotification(errorMessage, 'error');
    }
  };

  const handlePublish = async (eventId: string) => {
    console.log('📢 [Events] Publishing event:', eventId);
    try {
      await api.publishEvent(eventId);
      showNotification('Event published successfully', 'success');
      loadEvents();
    } catch (error: any) {
      console.error('❌ [Events] Failed to publish event:', error);
      showNotification('Failed to publish event', 'error');
    }
  };

  const handleDeleteClick = (event: Event) => {
    const eventId = getEventId(event);
    console.log('🗑️ [Events] Delete clicked for event:', eventId, event.name);
    setEventToDelete({ id: eventId, name: event.name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    try {
      await api.deleteEvent(eventToDelete.id);
      showNotification('Event deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      loadEvents();
    } catch (error: any) {
      console.error('Failed to delete event:', error);
      showNotification('Failed to delete event', 'error');
    }
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Events Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={loadEvents} color="primary">
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Event
          </Button>
        </Box>
      </Box>

      <Card elevation={2}>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Functions</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No events found
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => (
                    <TableRow key={getEventId(event)} hover>
                      <TableCell>{event.name}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{event.category}</TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell>
                        <Chip label={event.status} color={getStatusColor(event.status)} size="small" />
                      </TableCell>
                      <TableCell>{event.functions.length}</TableCell>
                      <TableCell>{format(new Date(event.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell align="right">
                        {event.status === 'draft' && (
                          <IconButton size="small" onClick={() => handlePublish(getEventId(event))} title="Publish">
                            <PublishIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton size="small" onClick={() => handleOpenDialog(event)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteClick(event)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingEventId ? 'Edit Event' : 'Create New Event'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Event Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                  >
                    <MenuItem value="music">Music</MenuItem>
                    <MenuItem value="sports">Sports</MenuItem>
                    <MenuItem value="conferences">Conferences</MenuItem>
                    <MenuItem value="theater">Theater</MenuItem>
                    <MenuItem value="comedy">Comedy</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Location"
                  fullWidth
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 2 }}>
              Functions/Shows
            </Typography>

            {!editingEventId && (
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Add Function
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Date & Time"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={newFunction.date_time}
                      onChange={(e) => setNewFunction({ ...newFunction, date_time: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      label="Duration (min)"
                      type="number"
                      fullWidth
                      value={newFunction.duration_minutes}
                      onChange={(e) =>
                        setNewFunction({ ...newFunction, duration_minutes: parseInt(e.target.value) })
                      }
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      label="Capacity"
                      type="number"
                      fullWidth
                      value={newFunction.capacity}
                      onChange={(e) => {
                        const capacity = parseInt(e.target.value);
                        setNewFunction({ ...newFunction, capacity, available_seats: capacity });
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddFunction} fullWidth>
                      Add Function
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            {formData.functions.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Added Functions
                </Typography>
                {formData.functions.map((func, index) => (
                  <Box
                    key={index}
                    sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: 'grey.50', mb: 1 }}
                  >
                    <Typography variant="body2">
                      {format(new Date(func.date_time), 'MMM dd, yyyy HH:mm')} - {func.duration_minutes}min -
                      Capacity: {func.capacity}
                    </Typography>
                    {!editingEventId && (
                      <IconButton size="small" onClick={() => handleRemoveFunction(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={formData.functions.length === 0 && !editingEventId}>
            {editingEventId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); setEventToDelete(null); }}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete event "{eventToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteDialogOpen(false); setEventToDelete(null); }}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
