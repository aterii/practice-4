import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Tooltip,
  CardMedia,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { Car } from '../types/car';

const FEATURE_LABELS: Record<string, string> = {
  ABS: 'ABS',
  ESP: 'ESP',
  airbag: 'Подушки безопасности',
  lane_assist: 'Система удержания в полосе',
  climate_control: 'Климат-контроль',
  leather_seats: 'Кожаные сиденья',
  navigation: 'Навигация',
  parking_sensors: 'Парктроники',
  cruise_control: 'Круиз-контроль',
  bluetooth: 'Bluetooth',
  // ...добавьте остальные опции по необходимости
};

const BODY_TYPE_LABELS: Record<string, string> = {
  sedan: 'Седан',
  hatchback: 'Хэтчбек',
  crossover: 'Кроссовер',
  suv: 'Внедорожник',
  wagon: 'Универсал',
  minivan: 'Минивэн',
  coupe: 'Купе',
  cabriolet: 'Кабриолет',
};
const FUEL_TYPE_LABELS: Record<string, string> = {
  petrol: 'Бензин',
  diesel: 'Дизель',
  electric: 'Электромобиль',
  hybrid: 'Гибрид',
};
const TRANSMISSION_LABELS: Record<string, string> = {
  manual: 'Механическая',
  automatic: 'Автоматическая',
  robot: 'Робот',
  variator: 'Вариатор',
};
const DRIVE_TYPE_LABELS: Record<string, string> = {
  front: 'Передний',
  rear: 'Задний',
  all: 'Полный',
};

const BEST_BY_MIN = ['price', 'fuelConsumption', 'maintenanceCost'];
const BEST_BY_MAX = ['power', 'capacity', 'safety', 'comfort', 'year'];

const getBestIndexes = (cars: Car[], key: string) => {
  const values = cars.map(car => {
    const value = car[key as keyof Car];
    if (typeof value === 'object' || value === undefined || value === null) return null;
    return Number(value);
  }).filter((v): v is number => typeof v === 'number' && !isNaN(v));

  if (values.length === 0) return [];

  if (BEST_BY_MIN.includes(key)) {
    const min = Math.min(...values);
    return cars.map((car, idx) => (Number(car[key as keyof Car]) === min ? idx : -1)).filter(idx => idx !== -1);
  }
  if (BEST_BY_MAX.includes(key)) {
    const max = Math.max(...values);
    return cars.map((car, idx) => (Number(car[key as keyof Car]) === max ? idx : -1)).filter(idx => idx !== -1);
  }
  return [];
};

const CarComparison: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCars, status, error } = useSelector((state: RootState) => state.cars);

  if (status === 'loading') {
    return <LoadingSpinner message="Загрузка данных для сравнения..." />;
  }

  if (status === 'failed') {
    return <ErrorAlert message={error || 'Произошла ошибка при загрузке данных'} />;
  }

  if (selectedCars.length < 2) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Для сравнения необходимо выбрать минимум 2 автомобиля
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/car-selection')}
          sx={{ mt: 2 }}
        >
          Выбрать автомобили
        </Button>
      </Box>
    );
  }

  const comparisonFields = [
    { key: 'price', label: 'Цена', format: (value: number) => `${value.toLocaleString()} ₽` },
    { key: 'year', label: 'Год выпуска' },
    { key: 'bodyType', label: 'Тип кузова' },
    { key: 'fuelType', label: 'Тип топлива' },
    { key: 'transmission', label: 'Трансмиссия' },
    { key: 'driveType', label: 'Привод' },
    { key: 'power', label: 'Мощность', format: (value: number) => `${value} л.с.` },
    { key: 'fuelConsumption', label: 'Расход топлива', format: (value: number) => `${value} л/100км` },
  ];

  const renderCellValue = (car: Car, key: string, format?: (value: any) => string) => {
    const value = car[key as keyof Car];
    if (typeof value === 'object' || value === undefined || value === null) {
      return '—';
    }
    if (key === 'bodyType') return BODY_TYPE_LABELS[value] || value;
    if (key === 'fuelType') return FUEL_TYPE_LABELS[value] || value;
    if (key === 'transmission') return TRANSMISSION_LABELS[value] || value;
    if (key === 'driveType') return DRIVE_TYPE_LABELS[value] || value;
    return format ? format(value as number) : String(value);
  };

  const renderFeatureChips = (features: { [key: string]: boolean } | undefined | null) => {
    const enabled = Object.entries(features || {}).filter(([_, v]) => v);
    if (enabled.length === 0) return <Typography color="textSecondary">—</Typography>;
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {enabled.slice(0, 3).map(([key]) => (
          <Chip key={key} label={FEATURE_LABELS[key] || key} size="small" sx={{ m: 0.5 }} />
        ))}
        {enabled.length > 3 && (
          <Tooltip title={enabled.slice(3).map(([k]) => FEATURE_LABELS[k] || k).join(', ')}>
            <Chip label={`+ ещё ${enabled.length - 3}`} size="small" sx={{ m: 0.5 }} />
          </Tooltip>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Сравнение автомобилей
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Характеристика</TableCell>
              {selectedCars.map((car: Car) => (
                <TableCell key={car.id} align="center">
                  <Typography variant="h6">{car.brand} {car.model}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {comparisonFields.map(({ key, label, format }) => {
              const bestIndexes = getBestIndexes(selectedCars, key);
              return (
                <TableRow key={key}>
                  <TableCell component="th" scope="row">
                    {label}
                  </TableCell>
                  {selectedCars.map((car: Car, idx: number) => (
                    <TableCell
                      key={car.id}
                      align="center"
                      sx={bestIndexes.includes(idx) ? { backgroundColor: '#e0ffe0', fontWeight: 'bold' } : {}}
                    >
                      {renderCellValue(car, key, format)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell component="th" scope="row">
                Безопасность
              </TableCell>
              {selectedCars.map((car: Car) => (
                <TableCell key={car.id} align="center">
                  {renderFeatureChips(car.safety)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row">
                Комфорт
              </TableCell>
              {selectedCars.map((car: Car) => (
                <TableCell key={car.id} align="center">
                  {renderFeatureChips(car.comfort)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row">Фото</TableCell>
              {selectedCars.map((car: Car) => (
                <TableCell key={car.id} align="center">
                  <div style={{width: 120, height: 80, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'}}>
                    <span style={{color:'#888', fontSize: 12}}>Нет фото</span>
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/car-selection')}
        >
          Вернуться к выбору автомобилей
        </Button>
      </Box>
    </Box>
  );
};

export default CarComparison; 