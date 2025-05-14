export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  bodyType: string;
  fuelType: string;
  transmission: string;
  driveType: string;
  power: number;
  fuelConsumption: number;
  imageUrl: string;
  description: string;
  safety: {
    [key: string]: boolean;
  };
  comfort: {
    [key: string]: boolean;
  };
} 