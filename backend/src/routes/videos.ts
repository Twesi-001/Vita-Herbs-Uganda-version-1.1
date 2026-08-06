import { Router } from 'express';
import { query } from '../db';

const router = Router();

// GET /api/videos — public list, active only, optional ?category= filter.
router.get('/', async (req, res, next) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  try {
    const { rows } = category
      ? await query(
          `SELECT id, title, description, category, video_url, created_at
           FROM videos WHERE active = TRUE AND category = $1 ORDER BY created_at DESC`,
          [category],
        )
      : await query(
          `SELECT id, title, description, category, video_url, created_at
           FROM videos WHERE active = TRUE ORDER BY created_at DESC`,
        );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
