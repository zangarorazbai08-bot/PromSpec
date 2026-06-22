import { useState } from 'react';
import { Mail, Lock, Phone, User, Package, HardHat, Truck, Eye, EyeOff, X } from 'lucide-react';
import { authApi } from '../api/index.js';
import Logo from '../Logo.jsx';

const ROLES = [
  { value: 'foreman',     label: 'Жұмыс Жүргізуші',  desc: 'Прораб — заявка береді',        icon: HardHat, color: '#b45309' },
  { value: 'storekeeper', label: 'Қоймашы',            desc: 'Складчик — тауар қабылдайды',   icon: Package, color: '#059669' },
  { value: 'supplier',    label: 'Жеткізуші',          desc: 'Снабженец — заявка өңдейді',    icon: Truck,   color: '#0369a1' },
];

function AuthModal({ mode, onClose, onAuthSuccess, notify }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('foreman');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await authApi.login({ email, password });
        onAuthSuccess(data.user);
      } else {
        const data = await authApi.register({ full_name: fullName, email, password, phone, role });
        if (!data.user?.is_approved) {
          setSuccessMsg('Сіз сәтті тіркелдіңіз! Әкімші растағаннан кейін жүйеге кіре аласыз.');
        } else {
          onAuthSuccess(data.user);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button className="auth-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Logo width={44} height={44} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 12 }}>
            {mode === 'login' ? 'Жүйеге кіру' : 'Тіркелу'}
          </h2>
          <p style={{ color: 'var(--text-soft)', fontSize: '0.88rem', marginTop: 4 }}>
            {mode === 'login' ? 'Аккаунтыңызбен кіріңіз' : 'Жаңа аккаунт жасаңыз'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: '0.88rem', marginBottom: 16 }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', color: '#059669', padding: '10px 14px', borderRadius: 10, fontSize: '0.88rem', marginBottom: 16 }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label>Аты-жөніңіз</label>
                <div className="input-wrap">
                  <User size={16} />
                  <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Толық аты-жөні" />
                </div>
              </div>
              <div className="form-group">
                <label>Телефон</label>
                <div className="input-wrap">
                  <Phone size={16} />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 777 000 00 00" />
                </div>
              </div>
              <div className="form-group">
                <label>Рөліңізді таңдаңыз</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ROLES.map(r => (
                    <label key={r.value} className={`role-option ${role === r.value ? 'selected' : ''}`} style={{ '--role-color': r.color }}>
                      <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} />
                      <r.icon size={20} />
                      <div>
                        <span className="role-name">{r.label}</span>
                        <span className="role-desc">{r.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <div className="input-wrap">
              <Mail size={16} />
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="siz@email.com" />
            </div>
          </div>

          <div className="form-group">
            <label>Құпиясөз</label>
            <div className="input-wrap">
              <Lock size={16} />
              <input required type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary full-width" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'Жүктелуде...' : (mode === 'login' ? 'Кіру' : 'Тіркелу')}
          </button>

          {mode === 'login' && (
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-soft)' }}>
              🔒 Әкімші немесе Бас Директор ретінде кіру үшін өз email және құпиясөзіңізді жазыңыз
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default function AuthPage({ onAuthSuccess, notify }) {
  const [modal, setModal] = useState(null); // 'login' | 'register' | null

  return (
    <div className="auth-fullpage">
      {/* Background image */}
      <div className="auth-bg" />
      <div className="auth-bg-overlay" />

      {/* Center hero */}
      <div className="auth-hero">
        <Logo width={90} height={90} style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))' }} />
        <h1 className="auth-hero-title">
          <span>PROM</span>
          <span style={{ color: '#e8a87c' }}>SPEC</span>
          <span>STROY</span>
        </h1>
        <p className="auth-hero-sub">Қазақстанның жетекші құрылыс компаниясының<br />корпоративті қойма басқару жүйесі</p>
        <div className="auth-hero-badges">
          <span>📦 Қойма</span>
          <span>📋 Заявкалар</span>
          <span>📊 Аналитика</span>
          <span>🏗️ Нысандар</span>
        </div>
        <div style={{ marginTop: 36, display: 'flex', gap: 14 }}>
          <button className="btn-hero-primary" onClick={() => setModal('login')}>Жүйеге кіру</button>
          <button className="btn-hero-ghost" onClick={() => setModal('register')}>Тіркелу</button>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <AuthModal
          mode={modal}
          onClose={() => setModal(null)}
          onAuthSuccess={onAuthSuccess}
          notify={notify}
        />
      )}
    </div>
  );
}
