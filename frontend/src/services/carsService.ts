import api from './api';
import { Car } from '../types/car';

function mapApiCar(car: any): Car {
  return {
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
    imageUrl: car.image_url,
    description: '', // если появится
    safety: (car.safety_features || '').split(',').reduce((acc: any, key: string) => {
      if (key) acc[key.trim()] = true;
      return acc;
    }, {}),
    comfort: (car.comfort_features || '').split(',').reduce((acc: any, key: string) => {
      if (key) acc[key.trim()] = true;
      return acc;
    }, {}),
  };
}

export const carsService = {
  async getAllCars(): Promise<Car[]> {
    const response = await api.get('/cars');
    return response.data.map(mapApiCar);
  },

  async getCarById(id: string): Promise<Car> {
    const response = await api.get(`/cars/${id}`);
    return mapApiCar(response.data);
  }
}; 