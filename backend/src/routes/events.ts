import { Router } from 'express';
import { events } from '../data';
import { requireAuth, requireRole, requireSponsorAccess, AuthRequest } from '../middleware/auth';

const router = Router();

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

// Sponsor/admin: consent-filtered attendees with tier masking
router.get(
  '/:id/attendees',
  requireAuth,
  requireRole('sponsor', 'admin'),
  requireSponsorAccess('id'),
  (req, res) => {
    const authReq = req as AuthRequest;
    const event = events.find(e => e.id === req.params.id);
    if (!event) { res.status(404).json({ error: 'Not found' }); return; }

    const sponsor = event.sponsors.find(s => s.id === authReq.user!.sponsorId);
    const tier = authReq.user!.role === 'admin' ? 'Gold' : (sponsor?.tier || 'Community');

    // Only consented attendees
    const consented = event.attendees.filter(a => a.sponsorConsent);
    const optedOut = event.attendees.length - consented.length;

    const masked = consented.map(a => {
      const base: Record<string, unknown> = {
        id: a.id,
        name: a.name,
        company: a.company,
        sessions: a.sessions.length,
      };
      if (tier === 'Gold' || tier === 'Silver') {
        base.title = a.title;
        base.certs = a.certs;
      }
      if (tier === 'Gold') {
        base.email = a.email;
      }
      return base;
    });

    res.json({ attendees: masked, optedOut, tier });
  }
);

// Sponsor/admin: session analytics (aggregate only)
router.get(
  '/:id/sessions',
  requireAuth,
  requireRole('sponsor', 'admin'),
  requireSponsorAccess('id'),
  (req, res) => {
    const event = events.find(e => e.id === req.params.id);
    if (!event) { res.status(404).json({ error: 'Not found' }); return; }

    const consented = event.attendees.filter(a => a.sponsorConsent);
    const sessionStats = event.sessions.map(s => ({
      ...s,
      consentedCount: consented.filter(a => a.sessions.includes(s.id)).length,
    }));
    res.json(sessionStats);
  }
);

export default router;
