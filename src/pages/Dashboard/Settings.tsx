import React from 'react';
import { Box, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, type SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {t('settings.title')}
      </Typography>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('settings.general')}
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>{t('settings.language')}</InputLabel>
            <Select
              value={i18n.language}
              label={t('settings.language')}
              onChange={handleLanguageChange}
            >
              <MenuItem value="es">{t('settings.spanish')}</MenuItem>
              <MenuItem value="en">{t('settings.english')}</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>
    </Box>
  );
};
