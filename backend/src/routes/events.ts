import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { events } from '../data';

const router = Router();

router.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
}));

// Public
router.get('/', (_req, res) => {
  const publicEvents = events.map(({ attendees: _a, ...rest }) => rest);
  res.json(publicEvents);
});

router.get('/:id', (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (!event) { res.status(404).json({ error: 'Not found' }); return; }
  const { attendees: _a, ...rest } = event;
  res.json(rest);
});

export default router;
