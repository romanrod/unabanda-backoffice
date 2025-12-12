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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useNotification } from '../../context/NotificationContext';

interface Invoice {
  _id: string;
  invoice_number: string;
  customer_name: string;
  event_name: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  payment_method: string;
}

export const Billing: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      _id: '1',
      invoice_number: 'INV-2024-001',
      customer_name: 'John Doe',
      event_name: 'Summer Festival 2024',
      amount: 15000,
      currency: 'ARS',
      status: 'paid',
      issue_date: '2024-06-01',
      due_date: '2024-06-15',
      payment_method: 'Credit Card',
    },
    {
      _id: '2',
      invoice_number: 'INV-2024-002',
      customer_name: 'Jane Smith',
      event_name: 'Quebraditos',
      amount: 25000,
      currency: 'ARS',
      status: 'pending',
      issue_date: '2024-06-05',
      due_date: '2024-06-20',
      payment_method: 'Bank Transfer',
    },
    {
      _id: '3',
      invoice_number: 'INV-2024-003',
      customer_name: 'Bob Johnson',
      event_name: 'Rock Concert',
      amount: 8000,
      currency: 'ARS',
      status: 'overdue',
      issue_date: '2024-05-20',
      due_date: '2024-06-05',
      payment_method: 'Credit Card',
    },
    {
      _id: '4',
      invoice_number: 'INV-2024-004',
      customer_name: 'Alice Williams',
      event_name: 'Jazz Night',
      amount: 12000,
      currency: 'ARS',
      status: 'paid',
      issue_date: '2024-06-10',
      due_date: '2024-06-25',
      payment_method: 'MercadoPago',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { showNotification } = useNotification();

  const loadData = async () => {
    setLoading(true);
    // TODO: Replace with actual API call
    setTimeout(() => setLoading(false), 500);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedInvoice(null);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    showNotification(`Downloading invoice ${invoice.invoice_number}`, 'info');
    // TODO: Implement actual download logic
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'cancelled':
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

  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingAmount = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueAmount = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">
          Billing
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={loadData} color="primary">
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />}>
            Create Invoice
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Revenue
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                ARS ${totalRevenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Pending
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="warning.main">
                ARS ${pendingAmount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Overdue
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="error.main">
                ARS ${overdueAmount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Invoices Table */}
      <Card elevation={2} sx={{ width: '100%' }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Issue Date</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice._id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{invoice.invoice_number}</Typography>
                      </TableCell>
                      <TableCell>{invoice.customer_name}</TableCell>
                      <TableCell>{invoice.event_name}</TableCell>
                      <TableCell align="right">
                        {invoice.currency} ${invoice.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{new Date(invoice.issue_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.payment_method}</TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          color={getStatusColor(invoice.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleViewInvoice(invoice)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDownloadInvoice(invoice)}>
                          <DownloadIcon fontSize="small" />
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

      {/* Invoice Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Invoice Details</DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Invoice Number
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedInvoice.invoice_number}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                    color={getStatusColor(selectedInvoice.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Customer
                  </Typography>
                  <Typography variant="body1">{selectedInvoice.customer_name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Event
                  </Typography>
                  <Typography variant="body1">{selectedInvoice.event_name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Amount
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedInvoice.currency} ${selectedInvoice.amount.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Payment Method
                  </Typography>
                  <Typography variant="body1">{selectedInvoice.payment_method}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Issue Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedInvoice.issue_date).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Due Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedInvoice.due_date).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => selectedInvoice && handleDownloadInvoice(selectedInvoice)}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
