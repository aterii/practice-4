import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';
import { AppDispatch, RootState } from '../store';
import { fetchCars, addSelectedCar, removeSelectedCar, showMoreCars } from '../store/slices/carsSlice';
import { Car } from '../types/car';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { addFavorite, removeFavorite } from '../store/slices/favoritesSlice';
import {
  BODY_TYPE_LABELS,
  FUEL_TYPE_LABELS,
  TRANSMISSION_LABELS,
  DRIVE_TYPE_LABELS,
  SAFETY_LABELS,
  COMFORT_LABELS,
} from '../data/carLabels';

const criteria = [
  'Цена',
  'Безопасность',
  'Экономичность',
  'Комфорт',
  'Вместимость',
];

function normalize(value: number, min: number, max: number, reverse = false) {
  if (!isFinite(min) || !isFinite(max) || max === min) return 1;
  const norm = (value - min) / (max - min);
  return reverse ? 1 - norm : norm;
}

function getCarScore(car: Car, weights: number[], minmax: any) {
  const priceScore = normalize(car.price ?? 0, minmax.price.min, minmax.price.max, true);
  const safetyScore = Object.values(car.safety || {}).filter(Boolean).length / (minmax.safety.max || 1);
  const fuelScore = normalize(car.fuelConsumption ?? 0, minmax.fuelConsumption.min, minmax.fuelConsumption.max, true);
  const comfortScore = Object.values(car.comfort || {}).filter(Boolean).length / (minmax.comfort.max || 1);
  const capacityScore = normalize(car.power ?? 0, minmax.power.min, minmax.power.max);
  return (
    (weights[0] || 0) * priceScore +
    (weights[1] || 0) * safetyScore +
    (weights[2] || 0) * fuelScore +
    (weights[3] || 0) * comfortScore +
    (weights[4] || 0) * capacityScore
  );
}

const CarSelection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: cars, selectedCars, status, error, visibleCount } = useSelector((state: RootState) => state.cars);
  const ahpWeights = useSelector((state: RootState) => state.ahp.weights);
  const favorites = useSelector((state: RootState) => state.favorites.ids);
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    year: '',
    price: '',
    bodyType: '',
  });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCars());
    }
  }, [status, dispatch]);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredCars = cars.filter((car: Car) => {
    return (
      car.brand.toLowerCase().includes(filters.brand.toLowerCase()) &&
      car.model.toLowerCase().includes(filters.model.toLowerCase()) &&
      (filters.year === '' || car.year.toString().includes(filters.year)) &&
      (filters.price === '' || car.price.toString().includes(filters.price)) &&
      (filters.bodyType === '' || car.bodyType === filters.bodyType)
    );
  });

  const handleAddCar = (car: Car) => {
    dispatch(addSelectedCar(car));
  };

  const handleRemoveCar = (carId: number) => {
    dispatch(removeSelectedCar(carId));
  };

  // min/max для нормализации
  const minmax = {
    price: {
      min: isFinite(Math.min(...filteredCars.map(c => c.price))) ? Math.min(...filteredCars.map(c => c.price)) : 0,
      max: isFinite(Math.max(...filteredCars.map(c => c.price))) ? Math.max(...filteredCars.map(c => c.price)) : 1,
    },
    safety: {
      max: isFinite(Math.max(...filteredCars.map(c => Object.values(c.safety || {}).filter(Boolean).length))) ? Math.max(...filteredCars.map(c => Object.values(c.safety || {}).filter(Boolean).length)) : 1,
    },
    fuelConsumption: {
      min: isFinite(Math.min(...filteredCars.map(c => c.fuelConsumption))) ? Math.min(...filteredCars.map(c => c.fuelConsumption)) : 0,
      max: isFinite(Math.max(...filteredCars.map(c => c.fuelConsumption))) ? Math.max(...filteredCars.map(c => c.fuelConsumption)) : 1,
    },
    comfort: {
      max: isFinite(Math.max(...filteredCars.map(c => Object.values(c.comfort || {}).filter(Boolean).length))) ? Math.max(...filteredCars.map(c => Object.values(c.comfort || {}).filter(Boolean).length)) : 1,
    },
    power: {
      min: isFinite(Math.min(...filteredCars.map(c => c.power))) ? Math.min(...filteredCars.map(c => c.power)) : 0,
      max: isFinite(Math.max(...filteredCars.map(c => c.power))) ? Math.max(...filteredCars.map(c => c.power)) : 1,
    },
  };

  // Считаем баллы для всех авто
  const carsWithScore = filteredCars.map(car => ({
    ...car,
    score: ahpWeights.length === 5 ? getCarScore(car, ahpWeights, minmax) : null,
  }));

  // Сортируем по баллу (если есть веса), иначе по цене
  const sortedCars = ahpWeights.length === 5
    ? [...carsWithScore].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    : [...carsWithScore].sort((a, b) => a.price - b.price);

  if (status === 'loading' && cars.length === 0) {
    return <LoadingSpinner message="Загрузка автомобилей..." />;
  }

  if (status === 'failed') {
    return <ErrorAlert message={error || 'Произошла ошибка при загрузке автомобилей'} />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Выбор автомобиля
      </Typography>

      {/* Фильтры */}
      <Box sx={{ mb: 4, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
        <TextField
          name="brand"
          label="Марка"
          value={filters.brand}
          onChange={handleTextChange}
          fullWidth
        />
        <TextField
          name="model"
          label="Модель"
          value={filters.model}
          onChange={handleTextChange}
          fullWidth
        />
        <TextField
          name="year"
          label="Год"
          value={filters.year}
          onChange={handleTextChange}
          fullWidth
        />
        <TextField
          name="price"
          label="Цена"
          value={filters.price}
          onChange={handleTextChange}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel>Тип кузова</InputLabel>
          <Select
            name="bodyType"
            value={filters.bodyType}
            onChange={handleSelectChange}
            label="Тип кузова"
          >
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="sedan">Седан</MenuItem>
            <MenuItem value="hatchback">Хэтчбек</MenuItem>
            <MenuItem value="suv">Внедорожник</MenuItem>
            <MenuItem value="crossover">Кроссовер</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Выбранные автомобили */}
      {selectedCars.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Выбранные автомобили ({selectedCars.length}/3)
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
            {selectedCars.map((car: Car) => (
              <Card key={car.id}>
                <div style={{width: '100%', height: 200, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span style={{color:'#888'}}>Нет фото</span>
                </div>
                <CardContent>
                  <Typography variant="h6">{car.brand} {car.model}</Typography>
                  <Typography color="textSecondary">Год: {car.year}</Typography>
                  <Typography color="textSecondary">Цена: {car.price.toLocaleString()} ₽</Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<RemoveIcon />}
                    onClick={() => handleRemoveCar(car.id)}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    Удалить из сравнения
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Список автомобилей */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
        {sortedCars.slice(0, visibleCount).map((car: any) => {
          const isSelected = selectedCars.some((c: Car) => c.id === car.id);
          return (
            <Card key={car.id}>
              <div style={{width: '100%', height: 200, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <span style={{color:'#888'}}>Нет фото</span>
              </div>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">{car.brand} {car.model}</Typography>
                  <IconButton
                    color={favorites.includes(car.id) ? 'warning' : 'default'}
                    onClick={() =>
                      favorites.includes(car.id)
                        ? dispatch(removeFavorite(car.id))
                        : dispatch(addFavorite(car.id))
                    }
                    sx={{ ml: 1 }}
                  >
                    {favorites.includes(car.id) ? <StarIcon /> : <StarBorderIcon />}
                  </IconButton>
                </Box>
                <Typography color="textSecondary">Год: {car.year}</Typography>
                <Typography color="textSecondary">Цена: {car.price.toLocaleString()} ₽</Typography>
                <Typography color="textSecondary">Тип кузова: {BODY_TYPE_LABELS[car.bodyType] || car.bodyType}</Typography>
                <Typography color="textSecondary">Тип топлива: {FUEL_TYPE_LABELS[car.fuelType] || car.fuelType}</Typography>
                <Typography color="textSecondary">Трансмиссия: {TRANSMISSION_LABELS[car.transmission] || car.transmission}</Typography>
                <Typography color="textSecondary">Привод: {DRIVE_TYPE_LABELS[car.driveType] || car.driveType}</Typography>
                <Typography color="textSecondary">Мощность: {car.power} л.с.</Typography>
                <Typography color="textSecondary">Расход топлива: {car.fuelConsumption} л/100км</Typography>
                {car.description && <Typography color="textSecondary">{car.description}</Typography>}
                {car.safety && Object.keys(car.safety).length > 0 && (
                  <Typography color="textSecondary" sx={{ mt: 1 }}>
                    Безопасность: {Object.keys(car.safety)
                      .filter(k => car.safety[k])
                      .map(k => SAFETY_LABELS[k] || k)
                      .join(', ')}
                  </Typography>
                )}
                {car.comfort && Object.keys(car.comfort).length > 0 && (
                  <Typography color="textSecondary">
                    Комфорт: {Object.keys(car.comfort)
                      .filter(k => car.comfort[k])
                      .map(k => COMFORT_LABELS[k] || k)
                      .join(', ')}
                  </Typography>
                )}
                {typeof car.score === 'number' && (
                  <Typography color="primary" sx={{ fontWeight: 500 }}>
                    Коэффициент соответствия: {car.score.toFixed(1)}
                  </Typography>
                )}
                {isSelected ? (
                  <Button variant="outlined" color="primary" disabled sx={{ mt: 2 }} fullWidth>
                    Уже в сравнении
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleAddCar(car)}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    Добавить к сравнению
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>
      {visibleCount < sortedCars.length && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button variant="outlined" onClick={() => dispatch(showMoreCars())}>
            Загрузить еще
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CarSelection;