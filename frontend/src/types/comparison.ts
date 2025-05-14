import { Car } from './car';

export interface Comparison {
  id: number;
  userId: number;
  carId: number;
  score: number;
  car: Car;
} 