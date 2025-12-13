import React, { useEffect, useState } from 'react';
import {
  Box,
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
  Button,
  Grid,
  Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import type { Booking, BookingStatus } from '../../types';

export const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await api.getBookings();
      setBookings(data);
    } catch (error: any) {
      console.error('Failed to load bookings:', error);
      showNotification('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailsDialogOpen(true);
  };

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedBooking) return;

    try {
      await api.cancelBooking(selectedBooking._id);
      showNotification('Booking cancelled successfully', 'success');
      setCancelDialogOpen(false);
      setSelectedBooking(null);
      loadBookings();
    } catch (error: any) {
      console.error('Failed to cancel booking:', error);
      showNotification('Failed to cancel booking', 'error');
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'refunded':
        return 'error';
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
          Bookings Management
        </Typography>
        <IconButton onClick={loadBookings} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      <Card elevation={2}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} variant="outlined" sx={{ width: '100%', overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Booking ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>User ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Event ID</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Payment Method</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking._id} hover>
                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        {booking._id.substring(0, 8)}...
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        {booking.user_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        {booking.event_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell align="right">
                        {booking.currency} ${booking.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>
                        {booking.payment_method}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          color={getStatusColor(booking.status)}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>{format(new Date(booking.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleViewDetails(booking)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        {booking.status !== 'cancelled' && booking.status !== 'refunded' && (
                          <IconButton size="small" onClick={() => handleCancelClick(booking)}>
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Booking ID
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {selectedBooking._id}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedBooking.status}
                    color={getStatusColor(selectedBooking.status)}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    User ID
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {selectedBooking.user_id}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Event ID
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {selectedBooking.event_id}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Function ID
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {selectedBooking.function_id}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Payment Method
                  </Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {selectedBooking.payment_method}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h6">
                    {selectedBooking.currency} ${selectedBooking.total_amount.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Created At
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(selectedBooking.created_at), 'MMM dd, yyyy HH:mm:ss')}
                  </Typography>
                </Grid>
                {selectedBooking.confirmed_at && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Confirmed At
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(selectedBooking.confirmed_at), 'MMM dd, yyyy HH:mm:ss')}
                    </Typography>
                  </Grid>
                )}
                {selectedBooking.payment_intent_id && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Payment Intent ID
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {selectedBooking.payment_intent_id}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Tickets
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedBooking.tickets.map((ticket, index) => (
                      <TableRow key={index}>
                        <TableCell>{ticket.ticket_name}</TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>{ticket.ticket_type}</TableCell>
                        <TableCell align="right">{ticket.quantity}</TableCell>
                        <TableCell align="right">${ticket.unit_price.toFixed(2)}</TableCell>
                        <TableCell align="right">${ticket.subtotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} align="right">
                        <strong>Total:</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>${selectedBooking.total_amount.toFixed(2)}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </Typography>
          {selectedBooking && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Booking ID:</strong> {selectedBooking._id}
              </Typography>
              <Typography variant="body2">
                <strong>Amount:</strong> {selectedBooking.currency} ${selectedBooking.total_amount.toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No, Keep It</Button>
          <Button onClick={handleCancelConfirm} color="error" variant="contained">
            Yes, Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
