import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
}));

router.post('/speaking', requireAuth, requireRole('member', 'sponsor', 'admin'), (req, res) => {
  const { title, abstract, company, type, coPresenter } = req.body;
  if (!title || !abstract) {
    res.status(400).json({ error: 'Title and abstract required' });
    return;
  }
  // In production, save to DB
  res.json({ success: true, submission: { title, abstract, company, type, coPresenter } });
});

router.post('/sponsor', requireAuth, requireRole('member', 'sponsor', 'admin'), (req, res) => {
  const { companyName, contactEmail, tier, notes } = req.body;
  if (!companyName || !contactEmail) {
    res.status(400).json({ error: 'Company name and email required' });
    return;
  }
  res.json({ success: true, submission: { companyName, contactEmail, tier, notes } });
});

export default router;
