import { useEffect, useState } from 'react';
import { CheckCircle2, Mail, Phone, UserRound } from 'lucide-react';
import { userApi } from '../api';
import { getRoleLabel } from '../labels';

export default function ProfilePage({ session, notify, onProfileUpdate }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatarUrl: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session.user) {
      return;
    }

    setForm({
      fullName: session.user.fullName || '',
      email: session.user.email || '',
      phone: session.user.phone || '',
      avatarUrl: session.user.avatarUrl || ''
    });
  }, [session.user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const data = await userApi.updateProfile(form);
      onProfileUpdate(data.user);
      notify('success', 'Профиль жаңартылды');
    } catch (error) {
      notify('error', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section-gap">
      <div className="container profile-layout">
        <div className="profile-summary glass-card reveal">
          <div className="avatar-shell">
            {form.avatarUrl ? <img alt={form.fullName} decoding="async" loading="lazy" src={form.avatarUrl} /> : <UserRound size={48} />}
          </div>
          <h1>{session.user.fullName}</h1>
          <p>{session.user.email}</p>
          <div className="profile-badges">
            <span className="pill accent">{getRoleLabel(session.user.role)}</span>
            <span className="pill">{new Date(session.user.createdAt).toLocaleDateString('kk-KZ')}</span>
          </div>
          <div className="profile-points">
            <div className="feature-line">
              <CheckCircle2 size={18} />
              <span>Сессия белсенді</span>
            </div>
            <div className="feature-line">
              <Mail size={18} />
              <span>{session.user.email}</span>
            </div>
            <div className="feature-line">
              <Phone size={18} />
              <span>{session.user.phone || 'Телефон қосылмаған'}</span>
            </div>
          </div>
        </div>

        <form className="glass-card stack-form reveal delay-1" onSubmit={handleSubmit}>
          <div className="section-head compact">
            <div>
              <h2>Профильді жаңарту</h2>
              <p>Толық аты-жөні, email, телефон және avatar URL өзгертуге болады.</p>
            </div>
          </div>

          <div className="form-grid two">
            <label className="input-shell">
              <span>Аты-жөні</span>
              <input
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                type="text"
                value={form.fullName}
              />
            </label>
            <label className="input-shell">
              <span>Телефон</span>
              <input
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                type="text"
                value={form.phone}
              />
            </label>
          </div>

          <label className="input-shell">
            <span>Email</span>
            <input
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              type="email"
              value={form.email}
            />
          </label>

          <label className="input-shell">
            <span>Аватар сілтемесі</span>
            <input
              onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
              type="url"
              value={form.avatarUrl}
            />
          </label>

          <button className="button primary" disabled={saving} type="submit">
            {saving ? 'Сақталуда...' : 'Сақтау'}
          </button>
        </form>
      </div>
    </section>
  );
}
