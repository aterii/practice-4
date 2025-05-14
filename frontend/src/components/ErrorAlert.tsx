import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => {
  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Alert severity="error" onClose={onClose}>
        <AlertTitle>Ошибка</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorAlert; 