import { Router } from 'express';
import axios from 'axios';

const router = Router();

// Get all cars from remote server
router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://db-auto-production.up.railway.app/api/cars');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching cars from remote:', error);
    res.status(500).json({ error: 'Failed to fetch cars from remote server' });
  }
});

// Get car by ID from remote server
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`https://db-auto-production.up.railway.app/api/cars/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching car from remote:', error);
    res.status(500).json({ error: 'Failed to fetch car from remote server' });
  }
});

// The following routes are not needed since cars are not stored locally
// router.post('/', ...)
// router.put('/:id', ...)
// router.delete('/:id', ...)

export default router; 