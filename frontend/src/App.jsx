import { Suspense, lazy, startTransition, useEffect, useMemo, useRef, useState } from 'react';
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom';
import {
  Bot,
  Building2,
  CalendarDays,
  Heart,
  Home,
  LogOut,
  Menu,
  MessageSquareMore,
  MoonStar,
  Shield,
  SunMedium,
  UserRound,
  X
} from 'lucide-react';
import { authApi, favoriteApi } from './api';
import { getRoleLabel } from './labels';

const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const PropertyPage = lazy(() => import('./pages/PropertyPage.jsx'));
const AuthPage = lazy(() => import('./pages/AuthPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const BookingsPage = lazy(() => import('./pages/BookingsPage.jsx'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage.jsx'));
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));
const HostPage = lazy(() => import('./pages/HostPage.jsx'));
const MessagesPage = lazy(() => import('./pages/MessagesPage.jsx'));
const AssistantPage = lazy(() => import('./pages/AssistantPage.jsx'));

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

const AdminRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

const formatRole = (role) => getRoleLabel(role);

const RouteLoader = () => (
  <section className="container section-gap route-loader-shell">
    <div className="glass-card route-loader" role="status">
      <div className="loader-orb" />
      <p>Бет жүктелуде...</p>
    </div>
  </section>
);

const ToastViewport = ({ toasts, onDismiss }) => {
  if (!toasts.length) {
    return null;
  }

  return (
    <div aria-live="polite" aria-relevant="additions text" className="toast-stack">
      {toasts.map((toast) => (
        <div className={`toast toast-${toast.type}`} key={toast.id} role="status">
          <div className="toast-copy">
            <p>{toast.text}</p>
          </div>
          <button
            aria-label="Хабарламаны жабу"
            className="toast-close"
            onClick={() => onDismiss(toast.id)}
            type="button"
          >
            <X size={16} />
          </button>
          <span className="toast-progress" />
        </div>
      ))}
    </div>
  );
};

const AppShell = ({
  theme,
  toggleTheme,
  session,
  setSession,
  favorites,
  setFavorites,
  notify
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.id)), [favorites]);

  const refreshFavorites = async () => {
    if (!session.user) {
      setFavorites([]);
      return [];
    }

    try {
      const data = await favoriteApi.list();
      setFavorites(data.favorites);
      return data.favorites;
    } catch (error) {
      if (error.status === 401) {
        setFavorites([]);
      }

      return [];
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setSession({ loading: false, user: null });
      setFavorites([]);
      notify('success', 'Сессия аяқталды');
      navigate('/');
    } catch (error) {
      notify('error', error.message);
    }
  };

  const handleToggleFavorite = async (propertyId) => {
    if (!session.user) {
      notify('error', 'Таңдаулылар үшін аккаунтқа кіріңіз');
      navigate('/auth');
      return;
    }

    try {
      if (favoriteIds.has(propertyId)) {
        await favoriteApi.remove(propertyId);
        notify('success', 'Нысан таңдаулылардан алынды');
      } else {
        await favoriteApi.add(propertyId);
        notify('success', 'Нысан таңдаулыларға қосылды');
      }

      await refreshFavorites();
    } catch (error) {
      notify('error', error.message);
    }
  };

  const applyAuthenticatedUser = async (user) => {
    setSession({ loading: false, user });
    await refreshFavorites();
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!session.user) {
      setFavorites([]);
      return;
    }

    refreshFavorites();
  }, [session.user?.id]);

  const navigationItems = [
    { to: '/', label: 'Басты', mobileLabel: 'Басты', icon: Home, show: true },
    { to: '/favorites', label: 'Таңдаулылар', mobileLabel: 'Таңдау', icon: Heart, show: Boolean(session.user) },
    { to: '/bookings', label: 'Броньдар', mobileLabel: 'Бронь', icon: CalendarDays, show: Boolean(session.user) },
    { to: '/messages', label: 'Чат', mobileLabel: 'Чат', icon: MessageSquareMore, show: Boolean(session.user) },
    { to: '/rent-out', label: 'Жалға беру', mobileLabel: 'Жалға', icon: Building2, show: Boolean(session.user) },
    { to: '/assistant', label: 'AI көмекші', mobileLabel: 'AI', icon: Bot, show: true },
    { to: '/profile', label: 'Профиль', mobileLabel: 'Профиль', icon: UserRound, show: Boolean(session.user) },
    { to: '/admin', label: 'Әкімші', mobileLabel: 'Әкімші', icon: Shield, show: session.user?.role === 'admin' }
  ].filter((item) => item.show);

  const mobileNavItems = navigationItems.filter((item) => ['/', '/bookings', '/messages', '/assistant', '/profile'].includes(item.to));

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand" to="/">
            <span className="brand-mark">
              <Home size={20} strokeWidth={2.15} />
            </span>
            <div className="brand-copy">
              <strong>StayNest</strong>
              <span>Тұрғын үй порталы</span>
            </div>
          </Link>

          <nav className="desktop-nav">
            {navigationItems.map((item) => (
              <NavLink key={item.to} className="nav-link" to={item.to}>
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <button aria-label="Тақырыпты ауыстыру" className="icon-button" onClick={toggleTheme} type="button">
              {theme === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
            </button>

            {session.user ? (
              <div className="profile-chip">
                <div className="profile-chip-text">
                  <strong>{session.user.fullName}</strong>
                  <span>{formatRole(session.user.role)}</span>
                </div>
                <button aria-label="Шығу" className="icon-button subtle" onClick={handleLogout} type="button">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link className="button ghost header-auth-link" to="/auth">
                Кіру
              </Link>
            )}

            <button
              aria-label={mobileMenuOpen ? 'Мәзірді жабу' : 'Мәзірді ашу'}
              className="icon-button mobile-menu-button"
              onClick={() => setMobileMenuOpen((value) => !value)}
              type="button"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-drawer">
            <div className="container mobile-drawer-inner">
              {navigationItems.map((item) => (
                <NavLink key={item.to} className="mobile-nav-link" to={item.to}>
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
              {!session.user && (
                <Link className="button primary full-width" to="/auth">
                  Кіру немесе тіркелу
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="page-main">
        <Suspense fallback={<RouteLoader />}>
          <div className="route-stage" key={location.pathname}>
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    favoriteIds={favoriteIds}
                    notify={notify}
                    onFavoriteToggle={handleToggleFavorite}
                    session={session}
                  />
                }
              />
              <Route
                path="/properties/:id"
                element={
                  <PropertyPage
                    favoriteIds={favoriteIds}
                    notify={notify}
                    onFavoriteToggle={handleToggleFavorite}
                    session={session}
                  />
                }
              />
              <Route
                path="/auth"
                element={
                  session.user ? (
                    <Navigate replace to="/" />
                  ) : (
                    <AuthPage notify={notify} onAuthSuccess={applyAuthenticatedUser} />
                  )
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute user={session.user}>
                    <ProfilePage
                      notify={notify}
                      onProfileUpdate={(user) => setSession({ loading: false, user })}
                      session={session}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute user={session.user}>
                    <BookingsPage notify={notify} session={session} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute user={session.user}>
                    <MessagesPage notify={notify} session={session} />
                  </ProtectedRoute>
                }
              />
              <Route path="/assistant" element={<AssistantPage notify={notify} />} />
              <Route
                path="/rent-out"
                element={
                  <ProtectedRoute user={session.user}>
                    <HostPage notify={notify} user={session.user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute user={session.user}>
                    <FavoritesPage favoriteIds={favoriteIds} favorites={favorites} onFavoriteToggle={handleToggleFavorite} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute user={session.user}>
                    <AdminPage notify={notify} />
                  </AdminRoute>
                }
              />
              <Route
                path="*"
                element={
                  <section className="container empty-state section-gap">
                    <h1>Бет табылмады</h1>
                    <p>Сұралған бет жоқ немесе басқа мекенжайға көшірілген.</p>
                    <Link className="button primary" to="/">
                      Басты бетке оралу
                    </Link>
                  </section>
                }
              />
            </Routes>
          </div>
        </Suspense>
      </main>

      <nav className="mobile-bottom-nav">
        {mobileNavItems.map((item) => (
          <NavLink key={item.to} className="bottom-nav-link" to={item.to}>
            <item.icon size={18} />
            <span>{item.mobileLabel || item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('staynest-theme') || 'dark');
  const [session, setSession] = useState({ loading: true, user: null });
  const [favorites, setFavorites] = useState([]);
  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef(new Map());

  const notify = (type, text) => {
    if (!text) {
      return;
    }

    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    startTransition(() => {
      setToasts((current) => [...current.slice(-3), { id, type, text }]);
    });
  };

  const dismissToast = (toastId) => {
    const timer = toastTimers.current.get(toastId);

    if (timer) {
      window.clearTimeout(timer);
      toastTimers.current.delete(toastId);
    }

    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('staynest-theme', theme);
  }, [theme]);

  useEffect(() => {
    let active = true;

    authApi
      .me()
      .then((data) => {
        if (!active) {
          return;
        }

        setSession({ loading: false, user: data.user });
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setSession({ loading: false, user: null });
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    toasts.forEach((toast) => {
      if (toastTimers.current.has(toast.id)) {
        return;
      }

      const timer = window.setTimeout(() => {
        toastTimers.current.delete(toast.id);
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, 3600);

      toastTimers.current.set(toast.id, timer);
    });

    const activeIds = new Set(toasts.map((toast) => toast.id));

    toastTimers.current.forEach((timer, toastId) => {
      if (activeIds.has(toastId)) {
        return;
      }

      window.clearTimeout(timer);
      toastTimers.current.delete(toastId);
    });
  }, [toasts]);

  useEffect(
    () => () => {
      toastTimers.current.forEach((timer) => window.clearTimeout(timer));
      toastTimers.current.clear();
    },
    []
  );

  if (session.loading) {
    return (
      <div className="screen-loader">
        <div className="loader-orb" />
        <p>Портал жүктелуде...</p>
      </div>
    );
  }

  return (
    <BrowserRouter
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true
      }}
    >
      <AppShell
        favorites={favorites}
        notify={notify}
        session={session}
        setFavorites={setFavorites}
        setSession={setSession}
        theme={theme}
        toggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      />
      <ToastViewport onDismiss={dismissToast} toasts={toasts} />
    </BrowserRouter>
  );
}
