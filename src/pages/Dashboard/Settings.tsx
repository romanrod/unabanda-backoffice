import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

export const Settings: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Settings
      </Typography>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="body1" color="textSecondary">
            Settings page - Coming soon
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
