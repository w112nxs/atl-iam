import { useState, useCallback, useEffect, useRef } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/modals/AuthModal';
import { OnboardingModal } from './components/modals/OnboardingModal';
import { Toast } from './components/ui/Toast';
import { api } from './api/client';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { EventsPage } from './pages/EventsPage';
import { SponsorsPage } from './pages/SponsorsPage';
import { SpeakingForm } from './pages/SpeakingForm';
import { SponsorshipForm } from './pages/SponsorshipForm';
import { ProfilePage } from './pages/ProfilePage';
import { SponsorPortal } from './pages/SponsorPortal';
import { AdminView } from './pages/AdminView';
import { AccessDenied } from './pages/AccessDenied';
import { MemberDirectory } from './pages/MemberDirectory';

function DevBanner() {
  const { T } = useTheme();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div style={{
      background: `linear-gradient(90deg, ${T.gold}, ${T.accent})`,
      color: '#000',
      textAlign: 'center',
      padding: '8px 40px 8px 16px',
      fontFamily: "'Inter', sans-serif",
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: '0.03em',
      position: 'relative',
    }}>
      Under Development — This site is being actively built. All features are available for testing.
      <button
        onClick={() => setDismissed(true)}
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: '#000',
          fontSize: 18,
          cursor: 'pointer',
          fontWeight: 700,
          lineHeight: 1,
          padding: '0 4px',
        }}
        aria-label="Dismiss banner"
      >
        x
      </button>
    </div>
  );
}

function AppInner() {
  const { T } = useTheme();
  const { user, loginWithToken, logout } = useAuth();
  const [path, setPath] = useState(window.location.pathname);
  const [showAuth, setShowAuth] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const navigate = useCallback((p: string) => {
    setPath(p);
    window.history.pushState(null, '', p);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
  }, []);

  // Handle OAuth redirect: #token=... or #auth-error=...
  const oauthHandled = useRef(false);
  useEffect(() => {
    if (oauthHandled.current) return;
    const hash = window.location.hash;
    if (hash.startsWith('#token=')) {
      oauthHandled.current = true;
      const token = hash.slice(7);
      try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        const u = {
          id: payload.id,
          name: payload.name,
          email: payload.email,
          role: payload.role,
          company: payload.company || '',
          sponsorId: payload.sponsorId || null,
          termsAccepted: Boolean(payload.termsAccepted),
          onboardingComplete: Boolean(payload.onboardingComplete),
          avatarUrl: payload.avatarUrl || '',
        };
        loginWithToken(token, u);
        // Fetch full profile from API to get all onboarding fields
        api.getMe().then(fullUser => {
          loginWithToken(token, fullUser);
        }).catch(() => {});
      } catch {
        showToast('OAuth login failed — invalid token', 'error');
      }
      window.history.replaceState(null, '', '/');
    } else if (hash.startsWith('#auth-error=')) {
      oauthHandled.current = true;
      const err = decodeURIComponent(hash.slice(12));
      showToast(`Sign-in failed: ${err}`, 'error');
      window.history.replaceState(null, '', '/');
    }
  }, [loginWithToken, showToast]);

  const needsOnboarding = user && !user.onboardingComplete;
  const isMember = user && ['member', 'sponsor', 'admin'].includes(user.role);
  const isSponsor = user && ['sponsor', 'admin'].includes(user.role);
  const isAdmin = user?.role === 'admin';

  // Profile staleness check — prompt if older than 1 year
  const [staleConfirming, setStaleConfirming] = useState(false);
  const [staleDismissed, setStaleDismissed] = useState(false);
  const profileIsStale = (() => {
    if (!user?.onboardingComplete || !user.profileUpdatedAt || staleDismissed) return false;
    const updated = new Date(user.profileUpdatedAt + 'Z').getTime();
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    return Date.now() - updated > oneYear;
  })();

  const handleConfirmProfile = async () => {
    setStaleConfirming(true);
    try {
      const result = await api.confirmProfile();
      loginWithToken(localStorage.getItem('atlanta-iam-token') || '', result.user);
      setStaleDismissed(true);
      showToast('Profile confirmed', 'success');
    } catch {
      showToast('Failed to confirm profile', 'error');
    }
    setStaleConfirming(false);
  };

  const renderPage = () => {
    switch (path) {
      case '/':
        return <HomePage user={user} onNavigate={navigate} onSignIn={() => setShowAuth(true)} onLogin={() => {}} />;
      case '/about':
        return <AboutPage />;
      case '/events':
        return <EventsPage user={user} onNavigate={navigate} />;
      case '/sponsors':
        return <SponsorsPage />;
      case '/submit-speaking':
        return isMember ? <SpeakingForm user={user!} onToast={showToast} /> : <AccessDenied onNavigate={navigate} />;
      case '/submit-sponsor':
        return isMember ? <SponsorshipForm user={user!} onToast={showToast} /> : <AccessDenied onNavigate={navigate} />;
      case '/members':
        return isMember ? <MemberDirectory user={user!} /> : <AccessDenied onNavigate={navigate} />;
      case '/my-profile':
        return isMember ? <ProfilePage user={user!} onNavigate={navigate} onUserUpdate={(u) => loginWithToken(localStorage.getItem('atlanta-iam-token') || '', u)} /> : <AccessDenied onNavigate={navigate} />;
      case '/sponsor-portal':
        return isSponsor ? <SponsorPortal user={user!} onToast={showToast} /> : <AccessDenied onNavigate={navigate} />;
      case '/admin':
        return isAdmin ? <AdminView /> : <AccessDenied onNavigate={navigate} />;
      default:
        return <HomePage user={user} onNavigate={navigate} onSignIn={() => setShowAuth(true)} onLogin={() => {}} />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: T.bg,
      color: T.text,
      fontFamily: "'Inter', sans-serif",
      transition: 'background 0.25s, color 0.25s',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Navbar
        user={user}
        currentPath={path}
        onNavigate={navigate}
        onSignIn={() => setShowAuth(true)}
        onSignOut={() => { logout(); navigate('/'); }}
      />
      <DevBanner />
      {profileIsStale && (
        <div style={{
          background: T.amberDim,
          border: `1px solid ${T.amber}44`,
          padding: '10px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 12, flexWrap: 'wrap',
        }}>
          <span style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: T.text,
          }}>
            Your profile hasn't been updated in over a year. Please confirm your information is still accurate.
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleConfirmProfile}
              disabled={staleConfirming}
              style={{
                background: T.green, color: '#fff', border: 'none', borderRadius: 6,
                padding: '6px 14px', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700,
                letterSpacing: '0.06em',
              }}
            >
              {staleConfirming ? 'CONFIRMING...' : 'MY INFO IS CORRECT'}
            </button>
            <button
              onClick={() => { setStaleDismissed(true); navigate('/my-profile'); }}
              style={{
                background: 'transparent', color: T.accent, border: `1px solid ${T.accent}44`,
                borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700,
                letterSpacing: '0.06em',
              }}
            >
              UPDATE PROFILE
            </button>
          </div>
        </div>
      )}
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>
      <Footer onNavigate={navigate} />

      {showAuth && (
        <AuthModal
          onPasskeyLogin={(token, u) => { loginWithToken(token, u); setShowAuth(false); }}
          onClose={() => setShowAuth(false)}
        />
      )}
      {needsOnboarding && (
        <OnboardingModal
          user={user!}
          onComplete={(updatedUser) => { loginWithToken(localStorage.getItem('atlanta-iam-token') || '', updatedUser); }}
          onDecline={() => { logout(); navigate('/'); }}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
