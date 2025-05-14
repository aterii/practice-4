export interface PreferencesState {
  usagePurpose: string[];
  budget: number;
  bodyType: string;
  fuelType: string;
  transmission: string;
  driveType: string;
  minPower: number;
  maxFuelConsumption: number;
  safetyFeatures: string[];
  comfortFeatures: string[];
  criteriaWeights: {
    price: number;
    fuelConsumption: number;
    power: number;
    safety: number;
    comfort: number;
  };
}

export interface UserPreferences {
  id: number;
  userId: number;
  usagePurpose: string;
  maxBudget: number;
  bodyType: string;
  fuelType: string;
  transmission: string;
  driveType: string;
  minPower?: number;
  maxFuelConsumption?: number;
  safety: { [key: string]: boolean };
  comfort: { [key: string]: boolean };
  criteriaWeights?: { [key: string]: number };
} 