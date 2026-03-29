import type { Context } from 'hono';

export type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  LINKEDIN_CLIENT_ID: string;
  LINKEDIN_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  KIOSK_SECRET: string;
};

export type UserPayload = {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  termsAccepted: boolean;
  onboardingComplete: boolean;
  avatarUrl: string;
};

export type Variables = {
  user: UserPayload;
};

export type AppContext = Context<{ Bindings: Bindings; Variables: Variables }>;
