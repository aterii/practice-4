import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import carsRoutes from './routes/cars';
import externalCarsRoutes from './routes/externalCars';
import preferencesRoutes from './routes/preferences';
import comparisonsRoutes from './routes/comparisons';
import ahpRoutes from './routes/ahp.routes';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/external-cars', externalCarsRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/comparisons', comparisonsRoutes);
app.use('/api/ahp', ahpRoutes);

app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так!' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 