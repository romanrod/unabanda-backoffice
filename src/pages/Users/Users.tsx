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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import type { User, CreateUserDto, UpdateUserDto, UserRole } from '../../types';

export const Users: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserDto>({
    email: '',
    password: '',
    full_name: '',
    role: 'end_user',
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      showNotification(t('users.failedToLoadUsers'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        password: '',
        full_name: user.full_name,
        role: user.role,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        email: '',
        password: '',
        full_name: '',
        role: 'end_user',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        // Update user
        const updateData: UpdateUserDto = {
          email: formData.email !== selectedUser.email ? formData.email : undefined,
          full_name: formData.full_name !== selectedUser.full_name ? formData.full_name : undefined,
        };
        await api.updateUser(selectedUser._id, updateData);

        // Update role separately if changed
        if (formData.role !== selectedUser.role) {
          await api.updateUserRole(selectedUser._id, formData.role);
        }

        showNotification(t('users.userUpdatedSuccess'), 'success');
      } else {
        // Create user
        await api.createUser(formData);
        showNotification(t('users.userCreatedSuccess'), 'success');
      }
      handleCloseDialog();
      loadUsers();
    } catch (error: any) {
      console.error('Failed to save user:', error);
      const errorMessage = error.response?.data?.detail || t('users.failedToSaveUser');
      showNotification(errorMessage, 'error');
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await api.deleteUser(selectedUser._id);
      showNotification(t('users.userDeletedSuccess'), 'success');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      showNotification(t('users.failedToDeleteUser'), 'error');
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'creator':
        return 'primary';
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
          {t('users.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={loadUsers} color="primary">
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            {t('users.addUser')}
          </Button>
        </Box>
      </Box>

      <Card elevation={2}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} variant="outlined" sx={{ width: '100%', overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('users.fullName')}</TableCell>
                  <TableCell>{t('users.email')}</TableCell>
                  <TableCell>{t('users.role')}</TableCell>
                  <TableCell>{t('users.status')}</TableCell>
                  <TableCell>{t('users.created')}</TableCell>
                  <TableCell align="right">{t('users.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {t('users.noUsersFound')}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip label={t(`users.roles.${user.role}`)} color={getRoleColor(user.role)} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.is_active ? t('users.active') : t('users.inactive')}
                          color={user.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{format(new Date(user.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleOpenDialog(user)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteClick(user)}>
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedUser ? t('users.editUser') : t('users.createNewUser')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label={t('users.fullName')}
              fullWidth
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
            <TextField
              label={t('users.email')}
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            {!selectedUser && (
              <TextField
                label={t('users.password')}
                type="password"
                fullWidth
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                helperText={t('users.passwordHelper')}
              />
            )}
            <FormControl fullWidth>
              <InputLabel>{t('users.role')}</InputLabel>
              <Select
                value={formData.role}
                label={t('users.role')}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              >
                <MenuItem value="end_user">{t('users.roles.end_user')}</MenuItem>
                <MenuItem value="creator">{t('users.roles.creator')}</MenuItem>
                <MenuItem value="admin">{t('users.roles.admin')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('users.cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedUser ? t('users.update') : t('users.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('users.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('users.deleteConfirmMessage', { userName: selectedUser?.full_name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('users.cancel')}</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {t('users.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
