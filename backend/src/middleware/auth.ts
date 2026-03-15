import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { events } from '../data';

const JWT_SECRET = process.env.JWT_SECRET || 'atlanta-iam-dev-secret';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    company: string;
    sponsorId: string | null;
    termsAccepted: boolean;
  };
}

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET) as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}

export function requireSponsorAccess(eventIdParam: string) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (req.user.role === 'admin') {
      next();
      return;
    }
    const eventId = req.params[eventIdParam];
    const event = events.find(e => e.id === eventId);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    const hasSponsor = event.sponsors.some(s => s.id === req.user!.sponsorId);
    if (!hasSponsor) {
      res.status(403).json({ error: 'No sponsor access to this event' });
      return;
    }
    next();
  };
}
