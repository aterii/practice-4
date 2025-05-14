import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Container>
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Добро пожаловать в сервис подбора автомобилей
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Выберите автомобиль, который подходит именно вам
        </Typography>
      </Box>
    </Container>
  );
};

export default Home; 