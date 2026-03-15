import { useState, useCallback, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/modals/AuthModal';
import { TermsModal } from './components/modals/TermsModal';
import { Toast } from './components/ui/Toast';
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
  const { user, login, loginWithToken, logout, acceptTerms } = useAuth();
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

  const handleLogin = useCallback(async (key: string) => {
    await login(key);
    setShowAuth(false);
  }, [login]);

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
  }, []);

  const showTerms = user && !user.termsAccepted;
  const isMember = user && ['member', 'sponsor', 'admin'].includes(user.role);
  const isSponsor = user && ['sponsor', 'admin'].includes(user.role);
  const isAdmin = user?.role === 'admin';

  const renderPage = () => {
    switch (path) {
      case '/':
        return <HomePage user={user} onNavigate={navigate} onSignIn={() => setShowAuth(true)} onLogin={handleLogin} />;
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
      case '/my-profile':
        return isMember ? <ProfilePage user={user!} onNavigate={navigate} /> : <AccessDenied onNavigate={navigate} />;
      case '/sponsor-portal':
        return isSponsor ? <SponsorPortal user={user!} onToast={showToast} /> : <AccessDenied onNavigate={navigate} />;
      case '/admin':
        return isAdmin ? <AdminView /> : <AccessDenied onNavigate={navigate} />;
      default:
        return <HomePage user={user} onNavigate={navigate} onSignIn={() => setShowAuth(true)} onLogin={handleLogin} />;
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
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>
      <Footer onNavigate={navigate} />

      {showAuth && (
        <AuthModal
          onLogin={handleLogin}
          onPasskeyLogin={(token, u) => { loginWithToken(token, u); setShowAuth(false); }}
          onClose={() => setShowAuth(false)}
        />
      )}
      {showTerms && (
        <TermsModal
          onAccept={acceptTerms}
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
