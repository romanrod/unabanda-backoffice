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
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNotification } from '../../context/NotificationContext';

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  users_count: number;
  is_active: boolean;
  created_at: string;
}

export const AccessControl: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([
    {
      _id: '1',
      name: 'Admin',
      description: 'Full system access',
      permissions: ['users.read', 'users.write', 'events.read', 'events.write', 'tickets.read', 'tickets.write'],
      users_count: 3,
      is_active: true,
      created_at: '2024-01-15',
    },
    {
      _id: '2',
      name: 'Event Manager',
      description: 'Manage events and tickets',
      permissions: ['events.read', 'events.write', 'tickets.read', 'tickets.write'],
      users_count: 5,
      is_active: true,
      created_at: '2024-02-20',
    },
    {
      _id: '3',
      name: 'Viewer',
      description: 'Read-only access',
      permissions: ['users.read', 'events.read', 'tickets.read'],
      users_count: 10,
      is_active: true,
      created_at: '2024-03-10',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });
  const { showNotification } = useNotification();

  const availablePermissions = [
    { key: 'users.read', label: 'View Users' },
    { key: 'users.write', label: 'Manage Users' },
    { key: 'events.read', label: 'View Events' },
    { key: 'events.write', label: 'Manage Events' },
    { key: 'tickets.read', label: 'View Tickets' },
    { key: 'tickets.write', label: 'Manage Tickets' },
    { key: 'bookings.read', label: 'View Bookings' },
    { key: 'bookings.write', label: 'Manage Bookings' },
    { key: 'banners.read', label: 'View Banners' },
    { key: 'banners.write', label: 'Manage Banners' },
    { key: 'billing.read', label: 'View Billing' },
    { key: 'billing.write', label: 'Manage Billing' },
  ];

  const loadData = async () => {
    setLoading(true);
    // TODO: Replace with actual API call
    setTimeout(() => setLoading(false), 500);
  };

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setSelectedRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      });
    } else {
      setSelectedRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: [],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRole(null);
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, permissions: [...formData.permissions, permission] });
    } else {
      setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== permission) });
    }
  };

  const handleSubmit = async () => {
    try {
      // TODO: Replace with actual API call
      showNotification(
        selectedRole ? 'Role updated successfully' : 'Role created successfully',
        'success'
      );
      handleCloseDialog();
      loadData();
    } catch (error) {
      showNotification('Failed to save role', 'error');
    }
  };

  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // TODO: Replace with actual API call
      showNotification('Role deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedRole(null);
      loadData();
    } catch (error) {
      showNotification('Failed to delete role', 'error');
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
          Access Control
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={loadData} color="primary">
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Role
          </Button>
        </Box>
      </Box>

      <Card elevation={2} sx={{ width: '100%' }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Role Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell align="center">Users</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No roles found
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role._id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{role.name}</Typography>
                      </TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {role.permissions.slice(0, 3).map((perm) => (
                            <Chip key={perm} label={perm} size="small" variant="outlined" />
                          ))}
                          {role.permissions.length > 3 && (
                            <Chip label={`+${role.permissions.length - 3} more`} size="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={role.users_count} size="small" color="primary" />
                      </TableCell>
                      <TableCell>{new Date(role.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={role.is_active ? 'Active' : 'Inactive'}
                          color={role.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleOpenDialog(role)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteClick(role)}>
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
        <DialogTitle>{selectedRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Role Name"
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
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Permissions
              </Typography>
              <FormGroup>
                <Grid container spacing={1}>
                  {availablePermissions.map((perm) => (
                    <Grid item xs={12} sm={6} key={perm.key}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.permissions.includes(perm.key)}
                            onChange={(e) => handlePermissionChange(perm.key, e.target.checked)}
                          />
                        }
                        label={perm.label}
                      />
                    </Grid>
                  ))}
                </Grid>
              </FormGroup>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete role "{selectedRole?.name}"? This action cannot be undone.
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
