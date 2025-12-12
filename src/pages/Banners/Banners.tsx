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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNotification } from '../../context/NotificationContext';

interface Banner {
  _id: string;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  position: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

export const Banners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([
    {
      _id: '1',
      title: 'Summer Festival 2024',
      description: 'Main banner for summer events',
      image_url: 'https://via.placeholder.com/1200x400',
      link_url: '/events/summer-festival',
      position: 'Home - Top',
      is_active: true,
      start_date: '2024-06-01',
      end_date: '2024-08-31',
    },
    {
      _id: '2',
      title: 'Early Bird Discount',
      description: 'Promotional banner for early bird tickets',
      image_url: 'https://via.placeholder.com/1200x400',
      link_url: '/tickets/early-bird',
      position: 'Tickets - Sidebar',
      is_active: true,
      start_date: '2024-05-01',
      end_date: '2024-12-31',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    position: 'Home - Top',
    start_date: '',
    end_date: '',
  });
  const { showNotification } = useNotification();

  const loadData = async () => {
    setLoading(true);
    // TODO: Replace with actual API call
    setTimeout(() => setLoading(false), 500);
  };

  const handleOpenDialog = (banner?: Banner) => {
    if (banner) {
      setSelectedBanner(banner);
      setFormData({
        title: banner.title,
        description: banner.description,
        image_url: banner.image_url,
        link_url: banner.link_url,
        position: banner.position,
        start_date: banner.start_date,
        end_date: banner.end_date,
      });
    } else {
      setSelectedBanner(null);
      setFormData({
        title: '',
        description: '',
        image_url: '',
        link_url: '',
        position: 'Home - Top',
        start_date: '',
        end_date: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedBanner(null);
  };

  const handleSubmit = async () => {
    try {
      // TODO: Replace with actual API call
      showNotification(
        selectedBanner ? 'Banner updated successfully' : 'Banner created successfully',
        'success'
      );
      handleCloseDialog();
      loadData();
    } catch (error) {
      showNotification('Failed to save banner', 'error');
    }
  };

  const handleDeleteClick = (banner: Banner) => {
    setSelectedBanner(banner);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // TODO: Replace with actual API call
      showNotification('Banner deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedBanner(null);
      loadData();
    } catch (error) {
      showNotification('Failed to delete banner', 'error');
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
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">
          Banners Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={loadData} color="primary">
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Banner
          </Button>
        </Box>
      </Box>

      <Card elevation={2} sx={{ width: '100%' }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {banners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No banners found
                    </TableCell>
                  </TableRow>
                ) : (
                  banners.map((banner) => (
                    <TableRow key={banner._id} hover>
                      <TableCell>{banner.title}</TableCell>
                      <TableCell>{banner.description}</TableCell>
                      <TableCell>{banner.position}</TableCell>
                      <TableCell>{new Date(banner.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(banner.end_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={banner.is_active ? 'Active' : 'Inactive'}
                          color={banner.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => window.open(banner.image_url, '_blank')}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleOpenDialog(banner)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteClick(banner)}>
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
        <DialogTitle>{selectedBanner ? 'Edit Banner' : 'Create New Banner'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            <TextField
              label="Image URL"
              fullWidth
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              required
            />
            <TextField
              label="Link URL"
              fullWidth
              value={formData.link_url}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Position</InputLabel>
              <Select
                value={formData.position}
                label="Position"
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              >
                <MenuItem value="Home - Top">Home - Top</MenuItem>
                <MenuItem value="Home - Middle">Home - Middle</MenuItem>
                <MenuItem value="Home - Bottom">Home - Bottom</MenuItem>
                <MenuItem value="Events - Top">Events - Top</MenuItem>
                <MenuItem value="Tickets - Sidebar">Tickets - Sidebar</MenuItem>
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedBanner ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete banner "{selectedBanner?.title}"? This action cannot be undone.
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
