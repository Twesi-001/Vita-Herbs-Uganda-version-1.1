import { Router } from 'express';
import { query } from '../db';

const router = Router();

// GET /api/content — returns all content keys as { key: value }
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT key, value FROM site_content ORDER BY key');
    const map: Record<string, string> = {};
    rows.forEach((r) => { map[r.key] = r.value; });
    res.json(map);
  } catch (err) {
    next(err);
  }
});

export default router;
