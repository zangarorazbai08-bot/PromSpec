import { Suspense, lazy, useEffect, useState, startTransition } from 'react';
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PackageSearch, ClipboardList, Users,
  LogOut, ChevronRight, Moon, Sun, AlertTriangle, Menu, X
} from 'lucide-react';
import { authApi } from './api';
import Logo from './Logo';

const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const MaterialsPage = lazy(() => import('./pages/MaterialsPage.jsx'));
const RequestsPage = lazy(() => import('./pages/RequestsPage.jsx'));
const UsersPage = lazy(() => import('./pages/UsersPage.jsx'));
const AuthPage = lazy(() => import('./pages/AuthPage.jsx'));

// ─── Role helpers ──────────────────────────────────────────────────────────────
export const ROLE_LABELS = {
  admin: 'Әкімші',
  director: 'Бас Директор',
  supplier: 'Жеткізуші',
  storekeeper: 'Қоймашы',
  foreman: 'Жұмыс Жүргізуші'
};

export const ROLE_COLORS = {
  admin:       '#7c3aed',
  director:    '#913831',
  supplier:    '#0369a1',
  storekeeper: '#059669',
  foreman:     '#b45309'
};

// ─── Toast system ──────────────────────────────────────────────────────────────
function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === 'error' ? '#dc2626' : '#059669',
          color: '#fff', padding: '12px 18px', borderRadius: 10,
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          animation: 'slideIn 0.2s ease'
        }}>
          <span style={{ flex: 1 }}>{t.text}</span>
          <button onClick={() => onDismiss(t.id)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ user, onLogout, theme, toggleTheme, collapsed, setCollapsed }) {
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Басты бет', icon: LayoutDashboard, roles: ['admin','director','supplier','storekeeper','foreman'] },
    { to: '/materials', label: 'Қойма', icon: PackageSearch, roles: ['admin','director','supplier','storekeeper','foreman'] },
    { to: '/requests', label: 'Заявкалар', icon: ClipboardList, roles: ['admin','supplier','storekeeper','foreman'] },
    { to: '/users', label: 'Қызметкерлер', icon: Users, roles: ['admin'] }
  ].filter(item => item.roles.includes(user?.role));

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <Logo width={collapsed ? 32 : 42} height={collapsed ? 32 : 42} />
        {!collapsed && (
          <div className="brand-text">
            <strong>Prom Spec Stroy</strong>
            <span>ERP Жүйесі</span>
          </div>
        )}
        <button className="collapse-btn" onClick={() => setCollapsed(c => !c)}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link theme-btn" onClick={toggleTheme} title="Тема">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span>{theme === 'dark' ? 'Жарық тема' : 'Күңгірт тема'}</span>}
        </button>

        {user && (
          <div className="sidebar-user">
            <div className="user-avatar" style={{ background: ROLE_COLORS[user.role] || '#913831' }}>
              {(user.fullName || user.full_name || 'U')[0].toUpperCase()}
            </div>
            {!collapsed && (
              <div className="user-info">
                <strong>{user.fullName || user.full_name}</strong>
                <span style={{ color: ROLE_COLORS[user.role] }}>{ROLE_LABELS[user.role]}</span>
              </div>
            )}
            <button className="logout-btn" onClick={onLogout} title="Шығу">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── App Shell ─────────────────────────────────────────────────────────────────
function AppShell({ theme, toggleTheme, session, setSession, notify }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (_) {}
    setSession({ loading: false, user: null });
    navigate('/auth');
    notify('success', 'Жүйеден сәтті шықтыңыз');
  };

  if (!session.user) {
    return (
      <Suspense fallback={<div className="page-loader">Жүктелуде...</div>}>
        <Routes>
          <Route path="*" element={<AuthPage onAuthSuccess={u => setSession({ loading: false, user: u })} notify={notify} />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar
        user={session.user}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <main className={`main-content ${collapsed ? 'expanded' : ''}`}>
        <Suspense fallback={<div className="page-loader">Жүктелуде...</div>}>
          <Routes>
            <Route path="/" element={<DashboardPage session={session} notify={notify} />} />
            <Route path="/materials" element={<MaterialsPage session={session} notify={notify} />} />
            <Route path="/requests" element={<RequestsPage session={session} notify={notify} />} />
            <Route path="/users" element={
              session.user?.role === 'admin'
                ? <UsersPage session={session} notify={notify} />
                : <Navigate to="/" replace />
            } />
            <Route path="/auth" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('pss-theme') || 'light');
  const [session, setSession] = useState({ loading: true, user: null });
  const [toasts, setToasts] = useState([]);

  const notify = (type, text) => {
    if (!text) return;
    const id = Date.now().toString();
    startTransition(() => setToasts(prev => [...prev.slice(-2), { id, type, text }]));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('pss-theme', theme);
  }, [theme]);

  useEffect(() => {
    authApi.me()
      .then(d => setSession({ loading: false, user: d.user }))
      .catch(() => setSession({ loading: false, user: null }));
  }, []);

  if (session.loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: 'var(--bg)' }}>
        <Logo width={60} height={60} />
        <p style={{ color: 'var(--text-soft)' }}>Жүктелуде...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppShell
        theme={theme}
        toggleTheme={() => setTheme(c => c === 'dark' ? 'light' : 'dark')}
        session={session}
        setSession={setSession}
        notify={notify}
      />
      <ToastStack toasts={toasts} onDismiss={id => setToasts(p => p.filter(t => t.id !== id))} />
    </BrowserRouter>
  );
}
