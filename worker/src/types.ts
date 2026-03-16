import type { Context } from 'hono';

export type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  FRONTEND_URL: string;
};

export type UserPayload = {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  sponsorId: string | null;
  termsAccepted: boolean;
};

export type Variables = {
  user: UserPayload;
};

export type AppContext = Context<{ Bindings: Bindings; Variables: Variables }>;
