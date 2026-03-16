export interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  sponsors: { id: string; name: string; tier: 'Gold' | 'Silver' | 'Community' }[];
  sessions: { id: string; title: string; speaker: string; time: string; cpe: number }[];
  attendees: Attendee[];
  stats: { registered: number; checkedIn: number; enterprise: number; vendor: number };
}

export interface Attendee {
  id: string;
  name: string;
  company: string;
  title: string;
  certs: string[];
  type: 'enterprise' | 'vendor';
  email: string;
  sessions: string[];
  sponsorConsent: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'guest' | 'member' | 'sponsor' | 'admin';
  company: string;
  sponsorId: string | null;
  termsAccepted: boolean;
  avatarUrl?: string;
}

export type Tier = 'Gold' | 'Silver' | 'Community';

export interface ThemeTokens {
  bg: string;
  surface: string;
  card: string;
  cardHover: string;
  border: string;
  accent: string;
  accentDim: string;
  gold: string;
  goldDim: string;
  green: string;
  greenDim: string;
  red: string;
  redDim: string;
  purple: string;
  purpleDim: string;
  amber: string;
  amberDim: string;
  text: string;
  muted: string;
  subtle: string;
  navBg: string;
  shadow: string;
  heroGrad: string;
  inputBg: string;
  mode: 'dark' | 'light';
}
