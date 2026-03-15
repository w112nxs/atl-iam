import type { Event, User } from '../types';

export const events: Event[] = [
  {
    id: 'e1',
    name: 'Atlanta IAM Forum — Spring 2026',
    date: 'April 15, 2026',
    venue: 'Atlanta Tech Village',
    sponsors: [
      { id: 'sp1', name: 'Saviynt', tier: 'Gold' },
      { id: 'sp2', name: 'Ping Identity', tier: 'Silver' },
      { id: 'sp3', name: 'CyberArk', tier: 'Gold' },
    ],
    sessions: [
      { id: 's1', title: 'Zero Trust IAM at Scale', speaker: 'Marcus Webb', time: '9:00 AM', cpe: 1 },
      { id: 's2', title: 'CIAM Modernization', speaker: 'Samira Hassan', time: '10:00 AM', cpe: 1 },
      { id: 's3', title: 'PAM in the Cloud Era', speaker: 'Devon Price', time: '11:00 AM', cpe: 1 },
      { id: 's4', title: 'Passwordless Reality Check', speaker: 'Priya Nair', time: '1:00 PM', cpe: 1 },
    ],
    attendees: [
      { id: 'a1', name: 'Nishad Sankaranarayanan', company: 'Genuine Parts Company', title: 'Global Dir. Cybersecurity', certs: ['CISM', 'CISSP'], type: 'enterprise', email: 'nishad@gpc.com', sessions: ['s1', 's2', 's3'], sponsorConsent: true },
      { id: 'a2', name: 'Marcus Webb', company: 'Delta Air Lines', title: 'Sr. IAM Architect', certs: ['CISSP', 'CISA'], type: 'enterprise', email: 'marcus@delta.com', sessions: ['s1', 's4'], sponsorConsent: true },
      { id: 'a3', name: 'Priya Nair', company: 'UPS', title: 'Director of Identity Security', certs: ['CISM'], type: 'enterprise', email: 'priya@ups.com', sessions: ['s2', 's3', 's4'], sponsorConsent: false },
      { id: 'a4', name: 'Jordan Kim', company: 'Chick-fil-A', title: 'IAM Engineer III', certs: ['Security+'], type: 'enterprise', email: 'jordan@cfa.com', sessions: ['s1'], sponsorConsent: true },
      { id: 'a5', name: 'Samira Hassan', company: 'The Home Depot', title: 'CIAM Lead', certs: ['CISM', 'CRISC'], type: 'enterprise', email: 'samira@homedepot.com', sessions: ['s2'], sponsorConsent: true },
      { id: 'a6', name: 'Quinn Adams', company: 'Wells Fargo', title: 'Identity Governance Lead', certs: ['CISA', 'CRISC'], type: 'enterprise', email: 'quinn@wf.com', sessions: ['s1', 's2', 's3', 's4'], sponsorConsent: false },
      { id: 'a7', name: 'Devon Price', company: 'NCR Voyix', title: 'Principal Architect', certs: ['CISSP'], type: 'enterprise', email: 'devon@ncr.com', sessions: ['s3'], sponsorConsent: true },
      { id: 'a8', name: 'Reese Patel', company: 'Equifax', title: 'IAM Program Manager', certs: ['PMP', 'CISM'], type: 'enterprise', email: 'reese@equifax.com', sessions: ['s1', 's4'], sponsorConsent: true },
    ],
    stats: { registered: 94, checkedIn: 81, enterprise: 71, vendor: 10 },
  },
  {
    id: 'e2',
    name: 'Atlanta IAM Forum — Fall 2025',
    date: 'Nov 12, 2025',
    venue: 'Coda Building',
    sponsors: [
      { id: 'sp1', name: 'Saviynt', tier: 'Gold' },
      { id: 'sp4', name: 'SailPoint', tier: 'Silver' },
    ],
    sessions: [
      { id: 's5', title: 'Passwordless Myths vs Reality', speaker: 'Devon Price', time: '9:00 AM', cpe: 1 },
      { id: 's6', title: 'IGA in Financial Services', speaker: 'Quinn Adams', time: '10:30 AM', cpe: 1 },
    ],
    attendees: [
      { id: 'b1', name: 'Alex Chen', company: 'Home Depot', title: 'IAM Director', certs: ['CISSP'], type: 'enterprise', email: 'alex.c@homedepot.com', sessions: ['s5', 's6'], sponsorConsent: true },
      { id: 'b2', name: 'Sam Rivera', company: 'Delta', title: 'Security Analyst', certs: ['Security+'], type: 'enterprise', email: 'sam@delta.com', sessions: ['s5'], sponsorConsent: true },
      { id: 'b3', name: 'Morgan Lee', company: 'UPS', title: 'IAM Architect', certs: ['CISM'], type: 'enterprise', email: 'morgan@ups.com', sessions: ['s6'], sponsorConsent: false },
    ],
    stats: { registered: 87, checkedIn: 80, enterprise: 68, vendor: 12 },
  },
];

export const demoUsers: Record<string, User> = {
  admin: {
    id: 'u1',
    name: 'Nishad Sankaranarayanan',
    email: 'nishad@atliam.org',
    role: 'admin',
    company: 'ATL IAM',
    sponsorId: null,
    termsAccepted: true,
  },
  member: {
    id: 'u2',
    name: 'Marcus Webb',
    email: 'marcus@delta.com',
    role: 'member',
    company: 'Delta Air Lines',
    sponsorId: null,
    termsAccepted: false,
  },
  saviynt: {
    id: 'u3',
    name: 'Alex Morgan',
    email: 'alex@saviynt.com',
    role: 'sponsor',
    company: 'Saviynt',
    sponsorId: 'sp1',
    termsAccepted: true,
  },
  cyberark: {
    id: 'u4',
    name: 'Taylor Brooks',
    email: 'taylor@cyberark.com',
    role: 'sponsor',
    company: 'CyberArk',
    sponsorId: 'sp3',
    termsAccepted: false,
  },
};
