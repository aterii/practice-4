import express from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateAHP } from '../utils/ahpService';
import { authenticateToken } from '../middleware/auth';
import { Request, Response } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const prisma = new PrismaClient();
const router = express.Router();

// Сохранить/обновить матрицу парных сравнений
router.post('/comparisons', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { matrix } = req.body;
  if (!Array.isArray(matrix)) {
    return res.status(400).json({ error: 'Matrix is required' });
  }
  const { weights, CR } = calculateAHP(matrix);
  const matrixStr = JSON.stringify(matrix);
  const weightsStr = JSON.stringify(weights);
  const existing = await prisma.criteriaComparison.findFirst({ where: { userId } });
  let result;
  if (existing) {
    result = await prisma.criteriaComparison.update({
      where: { id: existing.id },
      data: { matrix: matrixStr, weights: weightsStr, consistency: CR }
    });
  } else {
    result = await prisma.criteriaComparison.create({
      data: { userId, matrix: matrixStr, weights: weightsStr, consistency: CR }
    });
  }
  res.json({ weights, CR });
});

// Получить матрицу и веса
router.get('/comparisons', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const comparison = await prisma.criteriaComparison.findFirst({ where: { userId } });
  if (!comparison) {
    return res.status(404).json({ error: 'No comparison found' });
  }
  res.json({
    matrix: JSON.parse(comparison.matrix),
    weights: JSON.parse(comparison.weights),
    CR: comparison.consistency
  });
});

export default router; 