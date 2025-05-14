import api from './api';
import { Car } from '../types/car';

export const carsService = {
  async getAll(): Promise<Car[]> {
    const response = await api.get<Car[]>('/cars');
    return response.data;
  },

  async getById(id: string): Promise<Car> {
    const response = await api.get<Car>(`/cars/${id}`);
    return response.data;
  },

  async getExternalCars(): Promise<Car[]> {
    const response = await api.get<Car[]>('/external-cars');
    return response.data;
  },
}; 