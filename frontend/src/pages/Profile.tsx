import React, { useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Card,
  CardContent,
  CardMedia,
  IconButton,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { updatePreferences, fetchPreferences } from '../store/slices/preferencesSlice';
import { useNavigate } from 'react-router-dom';
import { removeFavorite } from '../store/slices/favoritesSlice';
import { Star as StarIcon } from '@mui/icons-material';
import { Car } from '../types/car';
import {
  BODY_TYPE_LABELS,
  FUEL_TYPE_LABELS,
  TRANSMISSION_LABELS,
  DRIVE_TYPE_LABELS,
  SAFETY_LABELS,
  COMFORT_LABELS,
} from '../data/carLabels';

const USAGE_PURPOSES = [
  'Поездки по городу',
  'Семейные путешествия',
  'Перевозка грузов',
  'Спортивная езда',
  'Внедорожное использование',
];

const BODY_TYPES = [
  'Седан',
  'Хэтчбек',
  'Универсал',
  'Кроссовер',
  'Внедорожник',
  'Минивэн',
  'Купе',
  'Кабриолет',
];

const FUEL_TYPES = ['Бензин', 'Дизель', 'Электромобиль', 'Гибрид'];

const TRANSMISSIONS = ['Механическая', 'Автоматическая', 'Робот', 'Вариатор'];

const DRIVE_TYPES = ['Передний', 'Задний', 'Полный'];

const SAFETY_FEATURES = [
  'ABS',
  'ESP',
  'Подушки безопасности',
  'Система помощи при торможении',
  'Система контроля слепых зон',
  'Система помощи при парковке',
  'Камера заднего вида',
  'Адаптивный круиз-контроль',
];

const COMFORT_FEATURES = [
  'Кондиционер',
  'Климат-контроль',
  'Электростеклоподъемники',
  'Электропривод сидений',
  'Подогрев сидений',
  'Мультимедийная система',
  'Навигация',
  'Кожаный салон',
];

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const preferences = useSelector((state: RootState) => state.preferences);
  const favorites = useSelector((state: RootState) => state.favorites.ids);
  const cars: Car[] = useSelector((state: RootState) => state.cars.items);
  const favoriteCars: Car[] = cars.filter((car: Car) => favorites.includes(car.id));

  useEffect(() => {
    dispatch(fetchPreferences());
  }, [dispatch]);

  // Локальный стейт для формы
  const [form, setForm] = React.useState<any>(null);
  useEffect(() => {
    if (preferences.preferences) {
      setForm(preferences.preferences);
    }
  }, [preferences.preferences]);

  // Обработчик для обычных инпутов
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (!form) return;
    dispatch(updatePreferences({ [name === 'budget' ? 'maxBudget' : name]: type === 'number' ? Number(value) : value }));
  };

  // Обработчик для Select (single/multiple)
  const handleSelectChange = (name: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [name]: name === 'usagePurpose' ? (Array.isArray(value) ? value : [value]) : value,
    }));
  };
  const handleSelectBlur = (name: string) => {
    if (!form) return;
    dispatch(updatePreferences({ [name]: form[name] }));
  };

  // Для чекбоксов-комфорт/безопасность
  const handleFeaturesChange = (name: string, value: string[]) => {
    const featuresObj = value.reduce((acc: { [key: string]: boolean }, feature: string) => {
      acc[feature] = true;
      return acc;
    }, {});
    setForm((prev: any) => ({
      ...prev,
      [name]: featuresObj,
    }));
    dispatch(updatePreferences({ [name]: featuresObj }));
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Профиль пользователя
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Box component="form" noValidate autoComplete="off">
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Цели использования</InputLabel>
                <Select
                  multiple
                  name="usagePurpose"
                  value={form?.usagePurpose || []}
                  onChange={e => handleSelectChange('usagePurpose', e.target.value)}
                  onBlur={() => handleSelectBlur('usagePurpose')}
                  input={<OutlinedInput label="Цели использования" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {USAGE_PURPOSES.map((purpose) => (
                    <MenuItem key={purpose} value={purpose}>
                      {purpose}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Бюджет (₽)"
                name="maxBudget"
                type="number"
                value={form?.maxBudget || ''}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
              />

              <FormControl fullWidth>
                <InputLabel>Тип кузова</InputLabel>
                <Select
                  name="bodyType"
                  value={form?.bodyType || ''}
                  onChange={e => handleSelectChange('bodyType', e.target.value)}
                  onBlur={() => handleSelectBlur('bodyType')}
                  label="Тип кузова"
                >
                  {BODY_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Тип топлива</InputLabel>
                <Select
                  name="fuelType"
                  value={form?.fuelType || ''}
                  onChange={e => handleSelectChange('fuelType', e.target.value)}
                  onBlur={() => handleSelectBlur('fuelType')}
                  label="Тип топлива"
                >
                  {FUEL_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Трансмиссия</InputLabel>
                <Select
                  name="transmission"
                  value={form?.transmission || ''}
                  onChange={e => handleSelectChange('transmission', e.target.value)}
                  onBlur={() => handleSelectBlur('transmission')}
                  label="Трансмиссия"
                >
                  {TRANSMISSIONS.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Привод</InputLabel>
                <Select
                  name="driveType"
                  value={form?.driveType || ''}
                  onChange={e => handleSelectChange('driveType', e.target.value)}
                  onBlur={() => handleSelectBlur('driveType')}
                  label="Привод"
                >
                  {DRIVE_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Минимальная мощность (л.с.)"
                name="minPower"
                type="number"
                value={form?.minPower || ''}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
              />

              <TextField
                fullWidth
                label="Максимальный расход топлива (л/100км)"
                name="maxFuelConsumption"
                type="number"
                value={form?.maxFuelConsumption || ''}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
              />
            </Box>

            <Box>
              <FormControl fullWidth>
                <InputLabel>Системы безопасности</InputLabel>
                <Select
                  multiple
                  name="safetyFeatures"
                  value={Object.keys(form?.safetyFeatures || {}).filter(k => form?.safetyFeatures?.[k])}
                  onChange={e => handleFeaturesChange('safetyFeatures', Array.isArray(e.target.value) ? e.target.value : [e.target.value])}
                  input={<OutlinedInput label="Системы безопасности" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {SAFETY_FEATURES.map((feature) => (
                    <MenuItem key={feature} value={feature}>
                      {feature}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth>
                <InputLabel>Комфорт</InputLabel>
                <Select
                  multiple
                  name="comfortFeatures"
                  value={Object.keys(form?.comfortFeatures || {}).filter(k => form?.comfortFeatures?.[k])}
                  onChange={e => handleFeaturesChange('comfortFeatures', Array.isArray(e.target.value) ? e.target.value : [e.target.value])}
                  input={<OutlinedInput label="Комфорт" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {COMFORT_FEATURES.map((feature) => (
                    <MenuItem key={feature} value={feature}>
                      {feature}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>
      </Paper>
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Избранные автомобили
        </Typography>
        {favoriteCars.length === 0 ? (
          <Typography color="textSecondary">Нет избранных автомобилей.</Typography>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {favoriteCars.map((car: Car) => (
              <Card
                key={car.id}
                sx={{
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 6 },
                }}
              >
                <div style={{width: '100%', height: 200, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span style={{color:'#888'}}>Нет фото</span>
                </div>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">{car.brand} {car.model}</Typography>
                    <IconButton color="warning" onClick={() => dispatch(removeFavorite(car.id))}>
                      <StarIcon />
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
                  <Typography variant="body2" display="inline" sx={{ mt: 1 }}>Удалить из избранного</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Profile; 