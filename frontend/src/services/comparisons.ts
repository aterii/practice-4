import api from './api';
import { Car } from '../types/car';

export interface Comparison {
  id: string;
  userId: string;
  carId: number;
  score: number;
  car: Car;
}

export const comparisonsService = {
  async getAll(): Promise<Comparison[]> {
    const response = await api.get<Comparison[]>('/comparisons');
    return response.data;
  },

  async add(carId: number, score: number): Promise<Comparison> {
    const response = await api.post<Comparison>('/comparisons', { carId, score });
    return response.data;
  },

  async updateScore(id: string, score: number): Promise<Comparison> {
    const response = await api.put<Comparison>(`/comparisons/${id}`, { score });
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/comparisons/${id}`);
  },
}; 