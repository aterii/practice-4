import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchCars, showMoreCars } from '../store/slices/carsSlice';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Car } from '../types/car';
import { Card, CardContent, Typography, Grid, CircularProgress, Box } from '@mui/material';

const CarList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: cars, status, error, visibleCount } = useSelector((state: RootState) => state.cars);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCars());
    }
  }, [status, dispatch]);

  const handleLoadMore = () => {
    dispatch(showMoreCars());
  };

  if (status === 'loading' && cars.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'failed') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const visibleCars = cars.slice(0, visibleCount);
  const hasMore = visibleCount < cars.length;

  return (
    <InfiniteScroll
      dataLength={visibleCars.length}
      next={handleLoadMore}
      hasMore={hasMore}
      loader={
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      }
      endMessage={
        <Box display="flex" justifyContent="center" p={2}>
          <Typography>Больше машин нет</Typography>
        </Box>
      }
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {visibleCars.map((car: Car) => (
          <Card key={car.id}>
            <CardContent>
              <Typography variant="h6">{car.brand} {car.model}</Typography>
              <Typography color="textSecondary">
                Год: {car.year}
              </Typography>
              <Typography color="textSecondary">
                Цена: {car.price.toLocaleString()} ₽
              </Typography>
              <Typography color="textSecondary">
                Тип кузова: {car.bodyType}
              </Typography>
              <Typography color="textSecondary">
                Тип топлива: {car.fuelType}
              </Typography>
              <Typography color="textSecondary">
                Мощность: {car.power} л.с.
              </Typography>
              <Typography color="textSecondary">
                Расход топлива: {car.fuelConsumption} л/100км
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </InfiniteScroll>
  );
};

export default CarList; 