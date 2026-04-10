import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { authApi } from '../api';

const initialRegisterForm = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  avatarUrl: ''
};

const initialLoginForm = {
  email: '',
  password: ''
};

export default function AuthPage({ onAuthSuccess, notify }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const data = await authApi.login(loginForm);
      await onAuthSuccess(data.user);
      notify('success', 'Қайта қош келдіңіз');
      navigate('/');
    } catch (error) {
      notify('error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const data = await authApi.register(registerForm);
      await onAuthSuccess(data.user);
      notify('success', 'Тіркелу сәтті аяқталды');
      navigate('/profile');
    } catch (error) {
      notify('error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="container auth-simple">
        <div className="auth-card auth-card-compact reveal">
          <div className="section-head compact auth-head">
            <div>
              <span className="eyebrow">
                <ShieldCheck size={16} />
                Қауіпсіз кіру
              </span>
              <h1>Кіру немесе тіркелу</h1>
              <p>Аккаунт арқылы бронь жасап, нысан жариялап, чатты қолдана аласыз.</p>
            </div>
          </div>

          <div className="tab-row">
            <button className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => setMode('login')} type="button">
              Кіру
            </button>
            <button className={mode === 'register' ? 'tab active' : 'tab'} onClick={() => setMode('register')} type="button">
              Тіркелу
            </button>
          </div>

          {mode === 'login' && (
            <form className="stack-form" onSubmit={handleLogin}>
              <label className="input-shell">
                <span>Email</span>
                <input
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="Поштаңызды енгізіңіз"
                  type="email"
                  value={loginForm.email}
                />
              </label>
              <label className="input-shell">
                <span>Құпиясөз</span>
                <div className="input-icon-row">
                  <LockKeyhole size={18} />
                  <input
                    onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="Құпиясөзіңіз"
                    type="password"
                    value={loginForm.password}
                  />
                </div>
              </label>
              <button className="button primary full-width" disabled={submitting} type="submit">
                {submitting ? 'Күтіңіз...' : 'Кіру'}
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form className="stack-form" onSubmit={handleRegister}>
              <div className="form-grid two">
                <label className="input-shell">
                  <span>Аты-жөні</span>
                  <div className="input-icon-row">
                    <UserRound size={18} />
                    <input
                      onChange={(event) => setRegisterForm((current) => ({ ...current, fullName: event.target.value }))}
                      placeholder="Толық аты-жөніңіз"
                      type="text"
                      value={registerForm.fullName}
                    />
                  </div>
                </label>
                <label className="input-shell">
                  <span>Телефон</span>
                  <input
                    onChange={(event) => setRegisterForm((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="+7 700 000 00 00"
                    type="text"
                    value={registerForm.phone}
                  />
                </label>
              </div>
              <label className="input-shell">
                <span>Email</span>
                <input
                  onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="Поштаңызды енгізіңіз"
                  type="email"
                  value={registerForm.email}
                />
              </label>
              <label className="input-shell">
                <span>Құпиясөз</span>
                <div className="input-icon-row">
                  <LockKeyhole size={18} />
                  <input
                    onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="Қауіпсіз құпиясөз"
                    type="password"
                    value={registerForm.password}
                  />
                </div>
              </label>
              <button className="button primary full-width" disabled={submitting} type="submit">
                {submitting ? 'Күтіңіз...' : 'Тіркелу'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
