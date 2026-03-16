import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { events } from '../data';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
}));

router.get('/events', requireAuth, requireRole('admin'), (_req, res) => {
  res.json(events.map(({ attendees: _a, ...rest }) => rest));
});

export default router;
