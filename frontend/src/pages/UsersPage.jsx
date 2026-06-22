import { useEffect, useState } from 'react';
import { usersApi } from '../api/index.js';
import { ROLE_LABELS, ROLE_COLORS } from '../App.jsx';
import { UserCheck, ShieldAlert, RefreshCw } from 'lucide-react';

export default function UsersPage({ session, notify }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.list();
      const staff = (data.users || []).filter(u => !['admin','director'].includes(u.role));
      setUsers(staff);
    } catch (e) {
      notify('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleApprove = async (id, name) => {
    setApprovingId(id);
    try {
      await usersApi.approve(id);
      notify('success', `${name} — жүйеге рұқсат берілді!`);
      fetchUsers();
    } catch (e) {
      notify('error', e.message);
    } finally {
      setApprovingId(null);
    }
  };

  const pending = users.filter(u => !u.is_approved);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Қызметкерлер</h1>
          <p className="page-subtitle">Жаңа тіркелген қызметкерлерді растау</p>
        </div>
        <button className="btn-ghost" onClick={fetchUsers} disabled={loading}>
          <RefreshCw size={16} /> Жаңарту
        </button>
      </div>

      {pending.length > 0 && (
        <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldAlert size={20} color="#dc2626" />
          <span><strong>{pending.length} қызметкер</strong> растауыңызды күтіп тұр</span>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-soft)' }}>Жүктелуде...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-soft)' }}>Тіркелген қызметкерлер жоқ</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Аты-жөні / Email</th>
                <th>Рөлі</th>
                <th>Тіркелді</th>
                <th>Статус</th>
                <th style={{ textAlign: 'right' }}>Әрекет</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="table-row">
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: ROLE_COLORS[u.role], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                        {u.full_name[0].toUpperCase()}
                      </div>
                      <div>
                        <strong style={{ display: 'block' }}>{u.full_name}</strong>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="tag" style={{ color: ROLE_COLORS[u.role], fontWeight: 600 }}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-soft)', fontSize: '0.85rem' }}>
                    {new Date(u.created_at).toLocaleDateString('kk-KZ', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td>
                    {u.is_approved
                      ? <span className="status-badge success">✓ Расталған</span>
                      : <span className="status-badge warning"><ShieldAlert size={12} /> Күтуде</span>
                    }
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {!u.is_approved && (
                      <button
                        className="btn-primary"
                        style={{ fontSize: '0.82rem', padding: '7px 14px' }}
                        disabled={approvingId === u.id}
                        onClick={() => handleApprove(u.id, u.full_name)}
                      >
                        <UserCheck size={14} />
                        {approvingId === u.id ? '...' : 'Рұқсат беру'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
