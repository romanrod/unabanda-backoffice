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
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import type { Event, CreateEventDto, UpdateEventDto, EventCategory, EventStatus, EventFunction } from '../../types';

// Helper function to get full image URL
const getImageUrl = (path: string): string => {
  if (!path) return '';
  // If path already starts with http, return as is
  if (path.startsWith('http')) return path;
  // Otherwise, prepend API base URL
  const baseUrl = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000');
  return `${baseUrl}${path}`;
};

export const Events: React.FC = () => {
  const { t } = useTranslation();
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
    duration_hours: 2,
    duration_mins: 0,
    capacity: 100,
    available_seats: 100,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
      showNotification(t('events.failedToLoadEvents'), 'error');
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
      // Set image preview from existing event if available
      if (event.images && event.images.length > 0) {
        setImagePreview(getImageUrl(event.images[0]));
      } else {
        setImagePreview(null);
      }
      setSelectedImage(null);
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
      setSelectedImage(null);
      setImagePreview(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
    setEditingEventId(null);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleAddFunction = () => {
    // Calculate total minutes from hours and minutes
    const totalMinutes = (newFunction.duration_hours * 60) + newFunction.duration_mins;

    setFormData({
      ...formData,
      functions: [...formData.functions, {
        ...newFunction,
        duration_minutes: totalMinutes,
        id: Date.now().toString()
      }],
    });
    setNewFunction({
      date_time: '',
      duration_minutes: 120,
      duration_hours: 2,
      duration_mins: 0,
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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification(t('events.invalidImageFile'), 'error');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification(t('events.imageTooLarge'), 'error');
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
        // Add image if a new one was selected
        if (selectedImage) {
          updateData.image = selectedImage;
        }
        await api.updateEvent(editingEventId, updateData);
        showNotification(t('events.eventUpdatedSuccess'), 'success');
      } else {
        // Create event - image is required
        if (!selectedImage) {
          showNotification(t('events.eventImageRequired'), 'error');
          return;
        }

        const createData: CreateEventDto = {
          ...formData,
          image: selectedImage,
        };
        await api.createEvent(createData);
        showNotification(t('events.eventCreatedSuccess'), 'success');
      }
      handleCloseDialog();
      loadEvents();
    } catch (error: any) {
      console.error('Failed to save event:', error);
      const errorMessage = error.response?.data?.detail || t('events.failedToSaveEvent');
      showNotification(errorMessage, 'error');
    }
  };

  const handlePublish = async (eventId: string) => {
    console.log('📢 [Events] Publishing event:', eventId);
    try {
      // Verificar que el evento tenga tickets asociados
      const tickets = await api.getTickets(eventId);

      if (!tickets || tickets.length === 0) {
        showNotification('Agregar tickets al evento para publicar', 'error');
        return;
      }

      await api.publishEvent(eventId);
      showNotification(t('events.eventPublishedSuccess'), 'success');
      loadEvents();
    } catch (error: any) {
      console.error('❌ [Events] Failed to publish event:', error);
      showNotification(t('events.failedToPublishEvent'), 'error');
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
      showNotification(t('events.eventDeletedSuccess'), 'success');
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      loadEvents();
    } catch (error: any) {
      console.error('Failed to delete event:', error);
      showNotification(t('events.failedToDeleteEvent'), 'error');
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

  const getStatusLabel = (status: EventStatus) => {
    return t(`events.statuses.${status}`, status);
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
          {t('events.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={loadEvents} color="primary">
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            {t('events.addEvent')}
          </Button>
        </Box>
      </Box>

      <Card elevation={2}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} variant="outlined" sx={{ width: '100%', overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('events.eventName')}</TableCell>
                  <TableCell>{t('events.category')}</TableCell>
                  <TableCell>{t('events.location')}</TableCell>
                  <TableCell>{t('events.status')}</TableCell>
                  <TableCell>{t('events.functions')}</TableCell>
                  <TableCell>{t('events.created')}</TableCell>
                  <TableCell align="right">{t('events.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      {t('events.noEventsFound')}
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => (
                    <TableRow key={getEventId(event)} hover>
                      <TableCell>{event.name}</TableCell>
                      <TableCell>{t(`events.categories.${event.category}`)}</TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell>
                        <Chip label={getStatusLabel(event.status)} color={getStatusColor(event.status)} size="small" />
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
        <DialogTitle>{editingEventId ? t('events.editEvent') : t('events.createNewEvent')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label={t('events.eventName')}
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              label={t('events.description')}
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
                  <InputLabel>{t('events.category')}</InputLabel>
                  <Select
                    value={formData.category}
                    label={t('events.category')}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                  >
                    <MenuItem value="music">{t('events.categories.music')}</MenuItem>
                    <MenuItem value="sports">{t('events.categories.sports')}</MenuItem>
                    <MenuItem value="conferences">{t('events.categories.conferences')}</MenuItem>
                    <MenuItem value="theater">{t('events.categories.theater')}</MenuItem>
                    <MenuItem value="comedy">{t('events.categories.comedy')}</MenuItem>
                    <MenuItem value="other">{t('events.categories.other')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('events.location')}
                  fullWidth
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </Grid>
            </Grid>

            {/* Image Upload Section */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('events.eventImage')} {!editingEventId && <span style={{ color: 'red' }}>*</span>}
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                {selectedImage ? selectedImage.name : t('events.uploadImage')}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
              {imagePreview && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                    }}
                  />
                </Box>
              )}
            </Box>

            <Typography variant="h6" sx={{ mt: 2 }}>
              {t('events.functionsShows')}
            </Typography>

            {!editingEventId && (
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('events.addFunction')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={t('events.dateTime')}
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={newFunction.date_time}
                      onChange={(e) => setNewFunction({ ...newFunction, date_time: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={3} sm={1.5}>
                    <TextField
                      label={t('events.hours')}
                      type="number"
                      fullWidth
                      inputProps={{ min: 0 }}
                      value={newFunction.duration_hours}
                      onChange={(e) => {
                        const hours = Math.max(0, parseInt(e.target.value) || 0);
                        const totalMinutes = (hours * 60) + newFunction.duration_mins;
                        setNewFunction({ ...newFunction, duration_hours: hours, duration_minutes: totalMinutes });
                      }}
                    />
                  </Grid>
                  <Grid item xs={3} sm={1.5}>
                    <TextField
                      label={t('events.minutes')}
                      type="number"
                      fullWidth
                      inputProps={{ min: 0, max: 59 }}
                      value={newFunction.duration_mins}
                      onChange={(e) => {
                        const mins = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
                        const totalMinutes = (newFunction.duration_hours * 60) + mins;
                        setNewFunction({ ...newFunction, duration_mins: mins, duration_minutes: totalMinutes });
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      label={t('events.capacity')}
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
                      {t('events.addFunction')}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            {formData.functions.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('events.addedFunctions')}
                </Typography>
                {formData.functions.map((func, index) => {
                  const hours = Math.floor(func.duration_minutes / 60);
                  const mins = func.duration_minutes % 60;
                  const durationDisplay = hours > 0
                    ? `${hours}h ${mins > 0 ? `${mins}min` : ''}`
                    : `${mins}min`;

                  return (
                    <Box
                      key={index}
                      sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: 'grey.50', mb: 1 }}
                    >
                      <Typography variant="body2">
                        {format(new Date(func.date_time), 'MMM dd, yyyy HH:mm')} - {durationDisplay.trim()} -
                        Capacity: {func.capacity}
                      </Typography>
                      {!editingEventId && (
                        <IconButton size="small" onClick={() => handleRemoveFunction(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('events.cancel')}</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              (!editingEventId && (formData.functions.length === 0 || !selectedImage)) ||
              (editingEventId && false) // Always enabled for edit
            }
          >
            {editingEventId ? t('events.update') : t('events.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); setEventToDelete(null); }}>
        <DialogTitle>{t('events.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('events.deleteConfirmMessage', { eventName: eventToDelete?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteDialogOpen(false); setEventToDelete(null); }}>{t('events.cancel')}</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {t('events.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
