import { useEffect, useState } from 'react';
import { dashboardApi, projectsApi, materialsApi, usersApi } from '../api/index.js';
import { ROLE_LABELS, ROLE_COLORS } from '../App.jsx';
import {
  Package, ClipboardList, Building2, AlertTriangle,
  Users, ArrowUpRight, ArrowDownRight, TrendingUp,
  TrendingDown, BarChart2, Layers, ShieldCheck
} from 'lucide-react';

// ── Mini bar chart ─────────────────────────────────────────────────
function MiniBar({ value, max, color = 'var(--accent)' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ background: 'var(--bg)', borderRadius: 6, height: 8, overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 6, transition: 'width 0.6s ease' }} />
    </div>
  );
}

// ── Director-specific full dashboard ──────────────────────────────
export default function DashboardPage({ session, notify }) {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [staffByRole, setStaffByRole] = useState({});
  const [loading, setLoading] = useState(true);
  const user = session.user;
  const isDirector = user?.role === 'director';
  const isAdmin   = user?.role === 'admin';

  useEffect(() => {
    const fetches = [dashboardApi.stats()];
    if (isDirector || isAdmin) {
      fetches.push(projectsApi.list());
      fetches.push(materialsApi.list());
      fetches.push(usersApi.list().catch(() => ({ users: [] })));
    }

    Promise.all(fetches)
      .then(([s, p, m, u]) => {
        setStats(s);
        if (p) setProjects(p.projects || []);
        if (m) setMaterials(m.materials || []);
        if (u) {
          const byRole = {};
          (u.users || []).forEach(usr => {
            byRole[usr.role] = (byRole[usr.role] || 0) + 1;
          });
          setStaffByRole(byRole);
        }
      })
      .catch(e => notify('error', e.message))
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Қайырлы таң';
    if (h < 17) return 'Қайырлы күн';
    return 'Қайырлы кеш';
  };

  // Top 5 materials by quantity
  const topMaterials = [...materials].sort((a, b) => b.current_quantity - a.current_quantity).slice(0, 5);
  const maxQty = topMaterials[0]?.current_quantity || 1;

  // Low stock = current_quantity <= min_quantity (only if min_quantity > 0)
  const lowStock = materials.filter(m => parseFloat(m.min_quantity) > 0 && parseFloat(m.current_quantity) <= parseFloat(m.min_quantity));
  const lowStockCount = lowStock.length;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting()}, {(user?.fullName || '').split(' ')[0]}!</h1>
          <p className="page-subtitle">
            {isDirector ? 'Бас Директор — Жалпы аналитика мен есептер' : 'Prom Spec Stroy — Қойма басқару жүйесі'}
          </p>
        </div>
        <div className="role-badge" style={{ background: ROLE_COLORS[user?.role] }}>
          {ROLE_LABELS[user?.role]}
        </div>
      </div>

      {loading ? (
        <div className="skeleton-grid">{[1,2,3,4].map(i => <div key={i} className="skeleton-card" style={{ height: 110 }} />)}</div>
      ) : stats && (
        <>
          {/* ── KPI Row ── */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(145,56,49,0.1)', color: '#913831' }}><Package size={24} /></div>
              <div className="kpi-body">
                <span className="kpi-label">Материал түрлері</span>
                <strong className="kpi-value">{stats.materialsCount}</strong>
                <span className="kpi-sub">Қоймада</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(3,105,161,0.1)', color: '#0369a1' }}><ClipboardList size={24} /></div>
              <div className="kpi-body">
                <span className="kpi-label">Күтіп тұрған заявкалар</span>
                <strong className="kpi-value" style={{ color: stats.pendingRequests > 0 ? '#dc2626' : 'inherit' }}>{stats.pendingRequests}</strong>
                <span className="kpi-sub">Өңделмеген</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}><Building2 size={24} /></div>
              <div className="kpi-body">
                <span className="kpi-label">Активті нысандар</span>
                <strong className="kpi-value">{stats.activeProjects}</strong>
                <span className="kpi-sub">Жұмыс жүреді</span>
              </div>
            </div>
            {/* Use the locally computed lowStockCount for accuracy */}
            {lowStockCount > 0 ? (
              <div className="kpi-card warning">
                <div className="kpi-icon" style={{ background: 'rgba(180,83,9,0.1)', color: '#b45309' }}><AlertTriangle size={24} /></div>
                <div className="kpi-body">
                  <span className="kpi-label">Аз қалған материалдар</span>
                  <strong className="kpi-value" style={{ color: '#b45309' }}>{lowStockCount}</strong>
                  <span className="kpi-sub">Минимум шектен төмен</span>
                </div>
              </div>
            ) : (
              <div className="kpi-card">
                <div className="kpi-icon" style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}><ShieldCheck size={24} /></div>
                <div className="kpi-body">
                  <span className="kpi-label">Қойма күйі</span>
                  <strong className="kpi-value" style={{ color: '#059669' }}>Жақсы</strong>
                  <span className="kpi-sub">Барлық материалдар жеткілікті</span>
                </div>
              </div>
            )}
            {(isAdmin || isDirector) && Object.keys(staffByRole).length > 0 && (
              <div className="kpi-card">
                <div className="kpi-icon" style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}><Users size={24} /></div>
                <div className="kpi-body">
                  <span className="kpi-label">Жалпы қызметкерлер</span>
                  <strong className="kpi-value">{Object.values(staffByRole).reduce((a, b) => a + b, 0)}</strong>
                  <span className="kpi-sub">Жүйеде тіркелген</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Director-only sections ── */}
          {(isDirector || isAdmin) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>

              {/* Projects Status */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title"><Building2 size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />Нысандар статусы</h2>
                </div>
                {projects.length === 0 ? (
                  <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>Нысандар жоқ</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {projects.slice(0, 5).map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.status === 'active' ? '#059669' : p.status === 'paused' ? '#d97706' : '#6b7280', flexShrink: 0 }} />
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>{p.location}</div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: p.status === 'active' ? '#059669' : '#d97706', background: p.status === 'active' ? 'rgba(5,150,105,0.1)' : 'rgba(217,119,6,0.1)', padding: '2px 8px', borderRadius: 8, whiteSpace: 'nowrap' }}>
                          {p.status === 'active' ? '● Белсенді' : p.status === 'paused' ? '⏸ Тоқтатылды' : '✓ Аяқталды'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Staff by Role */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title"><ShieldCheck size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />Қызметкерлер бөлінісі</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {['supplier','storekeeper','foreman'].map(role => {
                    const count = staffByRole[role] || 0;
                    const total = Object.values(staffByRole).reduce((a,b) => a+b, 0) || 1;
                    return (
                      <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: ROLE_COLORS[role], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                          {count}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.85rem', fontWeight: 600 }}>
                            <span>{ROLE_LABELS[role]}</span>
                            <span style={{ color: 'var(--text-soft)' }}>{Math.round(count/total*100)}%</span>
                          </div>
                          <MiniBar value={count} max={total} color={ROLE_COLORS[role]} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top materials */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title"><BarChart2 size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />Ең көп материалдар</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {topMaterials.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <MiniBar value={parseFloat(m.current_quantity)} max={maxQty} color="var(--accent)" />
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', whiteSpace: 'nowrap', minWidth: 60, textAlign: 'right' }}>
                            {parseFloat(m.current_quantity).toLocaleString()} {m.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low stock alerts */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title"><AlertTriangle size={18} style={{ verticalAlign: 'middle', marginRight: 8, color: '#d97706' }} />Аз қалған материалдар</h2>
                </div>
                {lowStock.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#059669' }}>
                    <ShieldCheck size={32} style={{ marginBottom: 8 }} />
                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Барлық материалдар жеткілікті ✓</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {lowStock.slice(0, 5).map(m => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 10 }}>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{m.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#dc2626' }}>Мин: {m.min_quantity} {m.unit}</div>
                        </div>
                        <span style={{ fontWeight: 800, color: '#dc2626', fontSize: '1rem' }}>
                          {parseFloat(m.current_quantity).toLocaleString()} {m.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Transactions (for non-director roles) */}
          {!isDirector && stats.recentTransactions?.length > 0 && (
            <div className="card" style={{ marginTop: 24 }}>
              <div className="card-header">
                <h2 className="card-title">Соңғы қозғалыстар</h2>
                <TrendingUp size={20} color="var(--text-soft)" />
              </div>
              <div className="tx-list">
                {stats.recentTransactions.map((tx, i) => (
                  <div key={i} className="tx-row">
                    <div className={`tx-type-badge ${tx.type}`}>
                      {tx.type === 'in' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {tx.type === 'in' ? 'Кіріс' : 'Шығыс'}
                    </div>
                    <div className="tx-info">
                      <strong>{tx.material_name}</strong>
                      <span>{tx.user_name}</span>
                    </div>
                    <div className="tx-qty">
                      <strong style={{ color: tx.type === 'in' ? '#059669' : '#dc2626' }}>
                        {tx.type === 'in' ? '+' : '-'}{parseFloat(tx.quantity).toLocaleString()}
                      </strong>
                      <span>{tx.unit}</span>
                    </div>
                    <span className="tx-date">
                      {new Date(tx.created_at).toLocaleDateString('kk-KZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Director: recent transactions as well */}
          {isDirector && stats.recentTransactions?.length > 0 && (
            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-header">
                <h2 className="card-title"><TrendingUp size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />Соңғы қозғалыстар</h2>
              </div>
              <div className="tx-list">
                {stats.recentTransactions.map((tx, i) => (
                  <div key={i} className="tx-row">
                    <div className={`tx-type-badge ${tx.type}`}>
                      {tx.type === 'in' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {tx.type === 'in' ? 'Кіріс' : 'Шығыс'}
                    </div>
                    <div className="tx-info">
                      <strong>{tx.material_name}</strong>
                      <span>{tx.user_name}</span>
                    </div>
                    <div className="tx-qty">
                      <strong style={{ color: tx.type === 'in' ? '#059669' : '#dc2626' }}>
                        {tx.type === 'in' ? '+' : '-'}{parseFloat(tx.quantity).toLocaleString()}
                      </strong>
                      <span>{tx.unit}</span>
                    </div>
                    <span className="tx-date">
                      {new Date(tx.created_at).toLocaleDateString('kk-KZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
