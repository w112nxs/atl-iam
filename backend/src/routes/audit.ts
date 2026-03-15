import { Router } from 'express';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/export', requireAuth, requireRole('sponsor', 'admin'), (req, res) => {
  const authReq = req as AuthRequest;
  const { eventId, attendeeCount, tier, timestamp } = req.body;
  // In production, log to audit table
  console.log(`[AUDIT] Export by ${authReq.user!.email}: event=${eventId}, count=${attendeeCount}, tier=${tier}, at=${timestamp}`);
  res.json({ success: true });
});

export default router;
