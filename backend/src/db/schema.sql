CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('guest', 'member', 'sponsor', 'admin')),
  company VARCHAR(255),
  sponsor_id VARCHAR(50),
  terms_accepted BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAuth linked accounts (one user can have multiple providers)
CREATE TABLE user_oauth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('google', 'facebook', 'linkedin')),
  provider_user_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (provider, provider_user_id)
);

-- WebAuthn passkey credentials
CREATE TABLE user_passkeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  device_type VARCHAR(50),
  backed_up BOOLEAN DEFAULT FALSE,
  transports TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge store for WebAuthn (short-lived)
CREATE TABLE webauthn_challenges (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id)
);

CREATE TABLE events (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  venue VARCHAR(255),
  stats_registered INT DEFAULT 0,
  stats_checked_in INT DEFAULT 0,
  stats_enterprise INT DEFAULT 0,
  stats_vendor INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_sponsors (
  event_id VARCHAR(50) REFERENCES events(id),
  sponsor_id VARCHAR(50) NOT NULL,
  sponsor_name VARCHAR(255) NOT NULL,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('Gold', 'Silver', 'Community')),
  PRIMARY KEY (event_id, sponsor_id)
);

CREATE TABLE sessions (
  id VARCHAR(50) PRIMARY KEY,
  event_id VARCHAR(50) REFERENCES events(id),
  title VARCHAR(255) NOT NULL,
  speaker VARCHAR(255),
  session_time VARCHAR(20),
  cpe INT DEFAULT 1
);

CREATE TABLE attendees (
  id VARCHAR(50) PRIMARY KEY,
  event_id VARCHAR(50) REFERENCES events(id),
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  title VARCHAR(255),
  certs TEXT[],
  type VARCHAR(20) CHECK (type IN ('enterprise', 'vendor')),
  email VARCHAR(255),
  sessions TEXT[],
  sponsor_consent BOOLEAN DEFAULT FALSE
);

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  event_id VARCHAR(50),
  attendee_count INT,
  tier VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE submissions_speaking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  presenter_type VARCHAR(20),
  company VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  abstract TEXT,
  co_presenter VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE submissions_sponsor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  tier VARCHAR(20),
  company_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
