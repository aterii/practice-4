import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get user's comparisons
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('GET /api/comparisons');
    console.log('USER:', req.user);
    const userId = req.user.id;
    const comparisons = await prisma.comparison.findMany({
      where: { userId },
    });
    res.json(comparisons);
  } catch (error) {
    console.error('ERROR in GET /api/comparisons:', error);
    res.status(500).json({ error: 'Failed to fetch comparisons', details: error instanceof Error ? error.message : error });
  }
});

// Add car to comparison
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('POST /api/comparisons');
    console.log('USER:', req.user);
    console.log('BODY:', req.body);
    const userId = req.user.id;
    const { carId, score } = req.body;
    const comparison = await prisma.comparison.create({
      data: { userId, carId, score },
    });
    res.status(201).json(comparison);
  } catch (error) {
    console.error('ERROR in POST /api/comparisons:', error);
    res.status(500).json({ error: 'Failed to add comparison', details: error instanceof Error ? error.message : error });
  }
});

// Update comparison score
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('PUT /api/comparisons/:id');
    console.log('USER:', req.user);
    console.log('BODY:', req.body);
    const userId = req.user.id;
    const { score } = req.body;
    const { id } = req.params;
    const comparison = await prisma.comparison.update({
      where: { id, userId },
      data: { score },
    });
    res.json(comparison);
  } catch (error) {
    console.error('ERROR in PUT /api/comparisons/:id:', error);
    res.status(500).json({ error: 'Failed to update comparison', details: error instanceof Error ? error.message : error });
  }
});

// Remove car from comparison
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('DELETE /api/comparisons/:id');
    console.log('USER:', req.user);
    const userId = req.user.id;
    const { id } = req.params;
    await prisma.comparison.delete({
      where: { id, userId },
    });
    res.status(204).send();
  } catch (error) {
    console.error('ERROR in DELETE /api/comparisons/:id:', error);
    res.status(500).json({ error: 'Failed to delete comparison', details: error instanceof Error ? error.message : error });
  }
});

export default router; 