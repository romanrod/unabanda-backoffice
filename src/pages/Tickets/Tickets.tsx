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
  Switch,
  FormControlLabel,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import type { Ticket, CreateTicketDto, UpdateTicketDto, TicketType, Event, EventFunction } from '../../types';

export const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedEventForForm, setSelectedEventForForm] = useState<Event | null>(null);
  const [formData, setFormData] = useState<CreateTicketDto>({
    event_id: '',
    function_id: '',
    type: 'general',
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    quantity_available: 100,
    max_per_order: 10,
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load events and tickets independently so one failure doesn't block the other
      const eventsPromise = api.getAllEventsAdmin().catch((error) => {
        console.error('Failed to load events:', error);
        showNotification('Failed to load events', 'error');
        return [];
      });

      const ticketsPromise = api.getTickets().catch((error) => {
        console.error('Failed to load tickets:', error);
        showNotification('Failed to load tickets', 'error');
        return [];
      });

      const [eventsData, ticketsData] = await Promise.all([eventsPromise, ticketsPromise]);

      console.log('📊 [Tickets] Loaded events:', eventsData);
      console.log('📊 [Tickets] Events count:', eventsData.length);
      setEvents(eventsData);
      setTickets(ticketsData);
    } catch (error: any) {
      console.error('Unexpected error loading data:', error);
      showNotification('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (ticket?: Ticket) => {
    console.log('🎫 [Tickets] Opening dialog, events available:', events.length);
    console.log('🎫 [Tickets] Events:', events);
    if (ticket) {
      setSelectedTicket(ticket);
      const event = events.find(e => e._id === ticket.event_id);
      setSelectedEventForForm(event || null);
      setFormData({
        event_id: ticket.event_id,
        function_id: ticket.function_id,
        type: ticket.type,
        name: ticket.name,
        description: ticket.description || '',
        price: ticket.price,
        currency: ticket.currency,
        quantity_available: ticket.quantity_available,
        max_per_order: ticket.max_per_order,
      });
    } else {
      setSelectedTicket(null);
      setSelectedEventForForm(null);
      setFormData({
        event_id: '',
        function_id: '',
        type: 'general',
        name: '',
        description: '',
        price: 0,
        currency: 'USD',
        quantity_available: 100,
        max_per_order: 10,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTicket(null);
    setSelectedEventForForm(null);
  };

  const handleEventChange = (event: Event | null) => {
    setSelectedEventForForm(event);
    setFormData({
      ...formData,
      event_id: event?._id || '',
      function_id: '',
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedTicket) {
        // Update ticket
        const updateData: UpdateTicketDto = {
          type: formData.type,
          name: formData.name,
          description: formData.description,
          price: formData.price,
          quantity_available: formData.quantity_available,
          max_per_order: formData.max_per_order,
        };
        await api.updateTicket(selectedTicket._id, updateData);
        showNotification('Ticket updated successfully', 'success');
      } else {
        // Create ticket
        await api.createTicket(formData);
        showNotification('Ticket created successfully', 'success');
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error('Failed to save ticket:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to save ticket';
      showNotification(errorMessage, 'error');
    }
  };

  const handleDeleteClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTicket) return;

    try {
      await api.deleteTicket(selectedTicket._id);
      showNotification('Ticket deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedTicket(null);
      loadData();
    } catch (error: any) {
      console.error('Failed to delete ticket:', error);
      showNotification('Failed to delete ticket', 'error');
    }
  };

  const getEventName = (eventId: string) => {
    return events.find(e => e._id === eventId)?.name || 'Unknown Event';
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
          Tickets Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={loadData} color="primary">
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Ticket
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
                  <TableCell>Event</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Available</TableCell>
                  <TableCell align="right">Sold</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket._id} hover>
                      <TableCell>{ticket.name}</TableCell>
                      <TableCell>{getEventName(ticket.event_id)}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{ticket.type}</TableCell>
                      <TableCell align="right">
                        {ticket.currency} ${ticket.price.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">{ticket.quantity_available}</TableCell>
                      <TableCell align="right">{ticket.quantity_sold}</TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.is_active ? 'Active' : 'Inactive'}
                          color={ticket.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleOpenDialog(ticket)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteClick(ticket)}>
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
        <DialogTitle>{selectedTicket ? 'Edit Ticket' : 'Create New Ticket'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {!selectedTicket && (
              <>
                <Autocomplete
                  options={events}
                  getOptionLabel={(option) => option.name}
                  value={selectedEventForForm}
                  onChange={(_, newValue) => handleEventChange(newValue)}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  noOptionsText={events.length === 0 ? "No events available. Please create an event first." : "No options"}
                  renderInput={(params) => <TextField {...params} label="Event" required />}
                />
                {selectedEventForForm && selectedEventForForm.functions.length > 0 && (
                  <FormControl fullWidth>
                    <InputLabel>Function/Show</InputLabel>
                    <Select
                      value={formData.function_id}
                      label="Function/Show"
                      onChange={(e) => setFormData({ ...formData, function_id: e.target.value })}
                      required
                    >
                      {selectedEventForForm.functions.map((func) => (
                        <MenuItem key={func.id} value={func.id}>
                          {new Date(func.date_time).toLocaleString()} - Capacity: {func.capacity}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {selectedEventForForm && selectedEventForForm.functions.length === 0 && (
                  <Typography color="error" variant="body2">
                    This event has no functions/shows. Please add functions to the event first.
                  </Typography>
                )}
              </>
            )}

            <TextField
              label="Ticket Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Type"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TicketType })}
                  >
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="vip">VIP</MenuItem>
                    <MenuItem value="early_bird">Early Bird</MenuItem>
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="senior">Senior</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={formData.currency}
                    label="Currency"
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="ARS">ARS</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Price"
                  type="number"
                  fullWidth
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Quantity Available"
                  type="number"
                  fullWidth
                  value={formData.quantity_available}
                  onChange={(e) => setFormData({ ...formData, quantity_available: parseInt(e.target.value) })}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Max Per Order"
                  type="number"
                  fullWidth
                  value={formData.max_per_order}
                  onChange={(e) => setFormData({ ...formData, max_per_order: parseInt(e.target.value) })}
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedTicket ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete ticket "{selectedTicket?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
