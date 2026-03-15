import { Router } from 'express';
import { events } from '../data';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/events', requireAuth, requireRole('admin'), (_req, res) => {
  res.json(events.map(({ attendees: _a, ...rest }) => rest));
});

export default router;
