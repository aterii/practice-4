import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// Прокси-эндпоинт для получения автомобилей с внешнего API
router.get('/', async (req: Request, res: Response) => {
  try {
    const response = await axios.get('https://db-auto-production.up.railway.app/api/cars');
    // Приведение данных к единому формату (если потребуется)
    const cars = response.data.map((car: any) => ({
      id: car.id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      price: car.price,
      bodyType: car.body_type,
      fuelType: car.fuel_type,
      transmission: car.transmission,
      driveType: car.drive_type,
      power: car.power,
      fuelConsumption: car.fuel_consumption,
      safetyFeatures: car.safety_features.split(','),
      comfortFeatures: car.comfort_features.split(','),
      capacity: car.capacity,
      maintenanceCost: car.maintenance_cost,
      additionalOptions: car.additional_options.split(','),
      imageUrl: car.image_url,
      createdAt: car.created_at,
    }));
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении данных с внешнего API' });
  }
});

export default router; 