import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { pool } from './db';
import productsRouter from './routes/products';
import subscribersRouter from './routes/subscribers';
import inquiriesRouter from './routes/inquiries';
import adminRouter from './routes/admin';
import contentRouter from './routes/content';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { message: 'Too many login attempts, try again later' } });
const publicWriteLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: { message: 'Too many requests, try again later' } });

// Health check — also reports whether the DB is reachable.
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'ok', database: 'unreachable' });
  }
});

app.use('/api/products', productsRouter);
app.use('/api/subscribers', publicWriteLimiter, subscribersRouter);
app.use('/api/inquiries', publicWriteLimiter, inquiriesRouter);
app.use('/api/admin/login', loginLimiter);
app.use('/api/admin', adminRouter);
app.use('/api/content', contentRouter);

// 404 for unknown API routes.
app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Centralized error handler.
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error('[error]', err);
    res.status(500).json({ message: 'Internal server error' });
  },
);

app.listen(PORT, () => {
  console.log(`KarOrganicsAPI listening on http://localhost:${PORT}`);
});
