import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  console.log('🛡️ [PROTECTED] ProtectedRoute check - loading:', loading, 'isAuthenticated:', isAuthenticated);

  if (loading) {
    console.log('🛡️ [PROTECTED] Showing loading spinner');
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log('🛡️ [PROTECTED] Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  console.log('🛡️ [PROTECTED] Authenticated, rendering children');
  return <>{children}</>;
};
