import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
}));

router.get('/me', requireAuth, (req, res) => {
  res.json((req as AuthRequest).user);
});

router.put('/me/terms', requireAuth, (req, res) => {
  const { accepted } = req.body;
  if (accepted !== true) {
    res.status(400).json({ error: 'Must accept terms' });
    return;
  }
  // In production, update DB. For demo, just acknowledge.
  res.json({ success: true, termsAccepted: true });
});

export default router;
