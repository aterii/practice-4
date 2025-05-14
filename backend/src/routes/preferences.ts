import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

interface UserPreferences {
  usagePurpose: string[];
  maxBudget: number;
  bodyType: string;
  fuelType: string;
  transmission: string;
  driveType: string;
  minPower: number;
  maxFuelConsumption: number;
  safetyFeatures: { [key: string]: boolean };
  comfortFeatures: { [key: string]: boolean };
}

// Валидация данных
const validatePreferences = (data: Partial<UserPreferences>): Partial<UserPreferences> => {
  const validated: Partial<UserPreferences> = {};

  if (Array.isArray(data.usagePurpose)) {
    validated.usagePurpose = data.usagePurpose;
  }

  if (typeof data.maxBudget === 'number') {
    validated.maxBudget = Math.max(0, data.maxBudget);
  }

  if (typeof data.bodyType === 'string') {
    validated.bodyType = data.bodyType.trim();
  }

  if (typeof data.fuelType === 'string') {
    validated.fuelType = data.fuelType.trim();
  }

  if (typeof data.transmission === 'string') {
    validated.transmission = data.transmission.trim();
  }

  if (typeof data.driveType === 'string') {
    validated.driveType = data.driveType.trim();
  }

  if (typeof data.minPower === 'number') {
    validated.minPower = Math.max(0, data.minPower);
  }

  if (typeof data.maxFuelConsumption === 'number') {
    validated.maxFuelConsumption = Math.max(0, data.maxFuelConsumption);
  }

  if (data.safetyFeatures && typeof data.safetyFeatures === 'object') {
    validated.safetyFeatures = data.safetyFeatures;
  }

  if (data.comfortFeatures && typeof data.comfortFeatures === 'object') {
    validated.comfortFeatures = data.comfortFeatures;
  }

  return validated;
};

// Get user preferences
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: authReq.user.id },
    });
    if (!preferences) {
      return res.json(null);
    }
    // Parse JSON strings back to arrays
    const parsedPreferences = {
      ...preferences,
      usagePurpose: JSON.parse(preferences.usagePurpose),
      bodyType: JSON.parse(preferences.bodyType),
      fuelType: JSON.parse(preferences.fuelType),
      transmission: JSON.parse(preferences.transmission),
      driveType: JSON.parse(preferences.driveType),
      safetyFeatures: JSON.parse(preferences.safetyFeatures),
      comfortFeatures: JSON.parse(preferences.comfortFeatures),
      criteriaWeights: preferences.criteriaWeights ? JSON.parse(preferences.criteriaWeights) : null
    };
    res.json(parsedPreferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Create or update user preferences
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const validatedData = validatePreferences(req.body);

    // Получаем текущие preferences
    let current = await prisma.userPreferences.findUnique({
      where: { userId: authReq.user.id },
    });

    // Если нет — создаём пустой объект (или дефолтные значения)
    if (!current) {
      current = {
        userId: authReq.user.id,
        usagePurpose: JSON.stringify([]),
        maxBudget: 0,
        bodyType: JSON.stringify(''),
        fuelType: JSON.stringify(''),
        transmission: JSON.stringify(''),
        driveType: JSON.stringify(''),
        minPower: 0,
        maxFuelConsumption: 0,
        safetyFeatures: JSON.stringify({}),
        comfortFeatures: JSON.stringify({}),
        criteriaWeights: null,
      } as any;
    } else {
      // Исправить типы для minPower и maxFuelConsumption
      if (current.minPower === null || current.minPower === undefined) current.minPower = 0;
      if (current.maxFuelConsumption === null || current.maxFuelConsumption === undefined) current.maxFuelConsumption = 0;
    }

    // Формируем updateData только из пришедших полей
    const updateData: any = {};
    if ('usagePurpose' in validatedData) updateData.usagePurpose = JSON.stringify(validatedData.usagePurpose);
    if ('maxBudget' in validatedData) updateData.maxBudget = validatedData.maxBudget;
    if ('bodyType' in validatedData) updateData.bodyType = JSON.stringify(validatedData.bodyType);
    if ('fuelType' in validatedData) updateData.fuelType = JSON.stringify(validatedData.fuelType);
    if ('transmission' in validatedData) updateData.transmission = JSON.stringify(validatedData.transmission);
    if ('driveType' in validatedData) updateData.driveType = JSON.stringify(validatedData.driveType);
    if ('minPower' in validatedData) updateData.minPower = validatedData.minPower;
    if ('maxFuelConsumption' in validatedData) updateData.maxFuelConsumption = validatedData.maxFuelConsumption;
    if ('safetyFeatures' in validatedData) updateData.safetyFeatures = JSON.stringify(validatedData.safetyFeatures);
    if ('comfortFeatures' in validatedData) updateData.comfortFeatures = JSON.stringify(validatedData.comfortFeatures);
    if ('criteriaWeights' in validatedData) updateData.criteriaWeights = validatedData.criteriaWeights ? JSON.stringify(validatedData.criteriaWeights) : null;

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: authReq.user.id },
      update: updateData,
      create: {
        user: { connect: { id: authReq.user.id } },
        usagePurpose: 'usagePurpose' in validatedData ? JSON.stringify(validatedData.usagePurpose) : JSON.stringify([]),
        maxBudget: 'maxBudget' in validatedData ? validatedData.maxBudget : 0,
        bodyType: 'bodyType' in validatedData ? JSON.stringify(validatedData.bodyType) : JSON.stringify(''),
        fuelType: 'fuelType' in validatedData ? JSON.stringify(validatedData.fuelType) : JSON.stringify(''),
        transmission: 'transmission' in validatedData ? JSON.stringify(validatedData.transmission) : JSON.stringify(''),
        driveType: 'driveType' in validatedData ? JSON.stringify(validatedData.driveType) : JSON.stringify(''),
        minPower: 'minPower' in validatedData && validatedData.minPower !== undefined && validatedData.minPower !== null ? validatedData.minPower : 0,
        maxFuelConsumption: 'maxFuelConsumption' in validatedData && validatedData.maxFuelConsumption !== undefined && validatedData.maxFuelConsumption !== null ? validatedData.maxFuelConsumption : 0,
        safetyFeatures: 'safetyFeatures' in validatedData ? JSON.stringify(validatedData.safetyFeatures) : JSON.stringify({}),
        comfortFeatures: 'comfortFeatures' in validatedData ? JSON.stringify(validatedData.comfortFeatures) : JSON.stringify({}),
        criteriaWeights: 'criteriaWeights' in validatedData && validatedData.criteriaWeights ? JSON.stringify(validatedData.criteriaWeights) : null,
      }
    });

    // Parse JSON strings back to arrays for response
    const parsedPreferences = {
      ...preferences,
      usagePurpose: JSON.parse(preferences.usagePurpose),
      bodyType: JSON.parse(preferences.bodyType),
      fuelType: JSON.parse(preferences.fuelType),
      transmission: JSON.parse(preferences.transmission),
      driveType: JSON.parse(preferences.driveType),
      safetyFeatures: JSON.parse(preferences.safetyFeatures),
      comfortFeatures: JSON.parse(preferences.comfortFeatures),
      criteriaWeights: preferences.criteriaWeights ? JSON.parse(preferences.criteriaWeights) : null
    };

    res.json(parsedPreferences);
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

// PUT /api/preferences
router.put('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    console.log('userId from token:', authReq.user?.id);
    if (!authReq.user?.id) {
      return res.status(401).json({ error: 'User ID not found in token' });
    }
    // Получаем текущие preferences
    let current = await prisma.userPreferences.findUnique({
      where: { userId: authReq.user.id },
    });

    // Если нет — создаём пустой объект (или дефолтные значения)
    if (!current) {
      current = {
        userId: authReq.user.id,
        usagePurpose: JSON.stringify([]),
        maxBudget: null,
        bodyType: JSON.stringify([]),
        fuelType: JSON.stringify([]),
        transmission: JSON.stringify([]),
        driveType: JSON.stringify([]),
        minPower: null,
        maxFuelConsumption: null,
        safetyFeatures: JSON.stringify({}),
        comfortFeatures: JSON.stringify({}),
        criteriaWeights: null,
      };
    }

    // Объединяем старое и новое
    const merged = {
      ...current,
      ...req.body,
      minPower: Number(current.minPower),
      maxFuelConsumption: Number(current.maxFuelConsumption),
    };

    // Дефолты для обязательных полей и санитизация значений
    const safe = {
      usagePurpose: Array.isArray(merged.usagePurpose) ? merged.usagePurpose : [],
      maxBudget: Number(merged.maxBudget) || 0,
      bodyType: typeof merged.bodyType === 'string' ? merged.bodyType.trim() : '',
      fuelType: typeof merged.fuelType === 'string' ? merged.fuelType.trim() : '',
      transmission: typeof merged.transmission === 'string' ? merged.transmission.trim() : '',
      driveType: typeof merged.driveType === 'string' ? merged.driveType.trim() : '',
      minPower: Number(merged.minPower) || 0,
      maxFuelConsumption: Number(merged.maxFuelConsumption) || 0,
      safetyFeatures: typeof merged.safetyFeatures === 'object' ? merged.safetyFeatures : {},
      comfortFeatures: typeof merged.comfortFeatures === 'object' ? merged.comfortFeatures : {},
      criteriaWeights: merged.criteriaWeights || null,
    };

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: authReq.user.id },
      update: {
        usagePurpose: JSON.stringify(safe.usagePurpose),
        maxBudget: safe.maxBudget,
        bodyType: JSON.stringify(safe.bodyType),
        fuelType: JSON.stringify(safe.fuelType),
        transmission: JSON.stringify(safe.transmission),
        driveType: JSON.stringify(safe.driveType),
        minPower: safe.minPower,
        maxFuelConsumption: safe.maxFuelConsumption,
        safetyFeatures: JSON.stringify(safe.safetyFeatures),
        comfortFeatures: JSON.stringify(safe.comfortFeatures),
        criteriaWeights: safe.criteriaWeights ? JSON.stringify(safe.criteriaWeights) : null
      },
      create: {
        user: { connect: { id: authReq.user.id } },
        usagePurpose: JSON.stringify(safe.usagePurpose),
        maxBudget: safe.maxBudget,
        bodyType: JSON.stringify(safe.bodyType),
        fuelType: JSON.stringify(safe.fuelType),
        transmission: JSON.stringify(safe.transmission),
        driveType: JSON.stringify(safe.driveType),
        minPower: safe.minPower,
        maxFuelConsumption: safe.maxFuelConsumption,
        safetyFeatures: JSON.stringify(safe.safetyFeatures),
        comfortFeatures: JSON.stringify(safe.comfortFeatures),
        criteriaWeights: safe.criteriaWeights ? JSON.stringify(safe.criteriaWeights) : null
      }
    });

    // Parse JSON strings back to arrays for response
    const parsedPreferences = {
      ...preferences,
      usagePurpose: JSON.parse(preferences.usagePurpose),
      bodyType: JSON.parse(preferences.bodyType),
      fuelType: JSON.parse(preferences.fuelType),
      transmission: JSON.parse(preferences.transmission),
      driveType: JSON.parse(preferences.driveType),
      safetyFeatures: JSON.parse(preferences.safetyFeatures),
      comfortFeatures: JSON.parse(preferences.comfortFeatures),
      criteriaWeights: preferences.criteriaWeights ? JSON.parse(preferences.criteriaWeights) : null
    };

    res.json(parsedPreferences);
  } catch (error) {
    console.error('Error saving preferences (PUT):', error);
    res.status(500).json({ error: 'Failed to save preferences (PUT)' });
  }
});

// Update criteria weights
router.put('/weights', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { criteriaWeights } = req.body;

    if (!criteriaWeights || typeof criteriaWeights !== 'object') {
      return res.status(400).json({ error: 'Invalid criteria weights format' });
    }

    const preferences = await prisma.userPreferences.update({
      where: { userId: authReq.user.id },
      data: {
        criteriaWeights: JSON.stringify(criteriaWeights),
      },
    });

    // Parse JSON strings back to arrays for response
    const parsedPreferences = {
      ...preferences,
      usagePurpose: JSON.parse(preferences.usagePurpose),
      bodyType: JSON.parse(preferences.bodyType),
      fuelType: JSON.parse(preferences.fuelType),
      transmission: JSON.parse(preferences.transmission),
      driveType: JSON.parse(preferences.driveType),
      safetyFeatures: JSON.parse(preferences.safetyFeatures),
      comfortFeatures: JSON.parse(preferences.comfortFeatures),
      criteriaWeights: preferences.criteriaWeights ? JSON.parse(preferences.criteriaWeights) : null
    };

    res.json(parsedPreferences);
  } catch (error) {
    console.error('Error updating criteria weights:', error);
    res.status(500).json({ error: 'Failed to update criteria weights' });
  }
});

export default router; 