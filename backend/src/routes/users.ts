import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

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
