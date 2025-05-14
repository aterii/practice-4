// Константы для проверки согласованности
const RI = {
  1: 0,
  2: 0,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
};

// Функция для вычисления собственного вектора матрицы
function calculateEigenvector(matrix: number[][]): number[] {
  const n = matrix.length;
  const vector = new Array(n).fill(1 / n);
  const maxIterations = 100;
  const tolerance = 1e-6;

  for (let iter = 0; iter < maxIterations; iter++) {
    const newVector = new Array(n).fill(0);
    
    // Умножение матрицы на вектор
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        newVector[i] += matrix[i][j] * vector[j];
      }
    }

    // Нормализация вектора
    const sum = newVector.reduce((a, b) => a + b, 0);
    for (let i = 0; i < n; i++) {
      newVector[i] /= sum;
    }

    // Проверка сходимости
    let maxDiff = 0;
    for (let i = 0; i < n; i++) {
      maxDiff = Math.max(maxDiff, Math.abs(newVector[i] - vector[i]));
    }
    if (maxDiff < tolerance) {
      return newVector;
    }

    // Обновление вектора
    for (let i = 0; i < n; i++) {
      vector[i] = newVector[i];
    }
  }

  return vector;
}

// Функция для вычисления индекса согласованности
function calculateConsistencyIndex(matrix: number[][], eigenvector: number[]): number {
  const n = matrix.length;
  let lambdaMax = 0;

  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += matrix[i][j] * eigenvector[j];
    }
    lambdaMax += sum / eigenvector[i];
  }
  lambdaMax /= n;

  return (lambdaMax - n) / (n - 1);
}

// Функция для проверки согласованности матрицы
export function checkConsistency(matrix: number[][]): { 
  isConsistent: boolean; 
  consistencyRatio: number;
  eigenvector: number[];
} {
  const n = matrix.length;
  const eigenvector = calculateEigenvector(matrix);
  const CI = calculateConsistencyIndex(matrix, eigenvector);
  const CR = CI / RI[n as keyof typeof RI];

  return {
    isConsistent: CR < 0.1,
    consistencyRatio: CR,
    eigenvector,
  };
}

// Функция для вычисления весов критериев
export function calculateCriteriaWeights(comparisonMatrix: number[][]): {
  weights: number[];
  isConsistent: boolean;
  consistencyRatio: number;
} {
  const { isConsistent, consistencyRatio, eigenvector } = checkConsistency(comparisonMatrix);

  return {
    weights: eigenvector,
    isConsistent,
    consistencyRatio,
  };
}

// Функция для вычисления итоговой оценки автомобиля
export function calculateCarScore(
  car: any,
  criteriaWeights: { [key: string]: number },
  preferences: any
): number {
  let score = 0;

  // Оценка по цене (меньше - лучше)
  if (criteriaWeights.price) {
    const priceScore = 1 - (car.price / preferences.maxBudget);
    score += priceScore * criteriaWeights.price;
  }

  // Оценка по мощности (больше - лучше)
  if (criteriaWeights.power && preferences.minPower) {
    const powerScore = car.power / preferences.minPower;
    score += powerScore * criteriaWeights.power;
  }

  // Оценка по расходу топлива (меньше - лучше)
  if (criteriaWeights.fuelConsumption && preferences.maxFuelConsumption) {
    const consumptionScore = 1 - (car.fuelConsumption / preferences.maxFuelConsumption);
    score += consumptionScore * criteriaWeights.fuelConsumption;
  }

  // Оценка по безопасности
  if (criteriaWeights.safety) {
    const safetyScore = preferences.safetyFeatures.reduce((acc: number, feature: string) => {
      return acc + (car.safetyFeatures.includes(feature) ? 1 : 0);
    }, 0) / preferences.safetyFeatures.length;
    score += safetyScore * criteriaWeights.safety;
  }

  // Оценка по комфорту
  if (criteriaWeights.comfort) {
    const comfortScore = preferences.comfortFeatures.reduce((acc: number, feature: string) => {
      return acc + (car.comfortFeatures.includes(feature) ? 1 : 0);
    }, 0) / preferences.comfortFeatures.length;
    score += comfortScore * criteriaWeights.comfort;
  }

  return score;
} 