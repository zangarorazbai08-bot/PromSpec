import { useEffect, useState } from 'react';
import { requestsApi, projectsApi, materialsApi } from '../api/index.js';
import { printWaybill } from '../utils/waybill.js';
import {
  Plus, Clock, CheckCircle2, XCircle, PackageCheck,
  X, FileDown, ShoppingCart, Warehouse, CheckCheck
} from 'lucide-react';

const STATUS_CONFIG = {
  pending:    { label: 'Күтуде',         color: '#b45309', bg: 'rgba(180,83,9,0.1)',    icon: Clock },
  processing: { label: 'Қарастырылуда', color: '#0369a1', bg: 'rgba(3,105,161,0.1)',   icon: Clock },
  approved:   { label: 'Расталды',      color: '#059669', bg: 'rgba(5,150,105,0.1)',    icon: CheckCircle2 },
  issued:     { label: 'Берілді',       color: '#7c3aed', bg: 'rgba(124,58,237,0.1)',   icon: PackageCheck },
  confirmed:  { label: '✓ Алдым',       color: '#059669', bg: 'rgba(5,150,105,0.15)',   icon: CheckCheck },
  rejected:   { label: 'Қабылданбады', color: '#dc2626', bg: 'rgba(220,38,38,0.1)',    icon: XCircle }
};

function RequestCard({ req, user, onAction, notify }) {
  const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  const role = user?.role;
  const isMyRequest = req.foreman_id === user?.id;

  return (
    <div className="card" style={{ borderLeft: `4px solid ${cfg.color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ background: req.request_type === 'issuance' ? 'rgba(5,150,105,0.1)' : 'rgba(3,105,161,0.1)', color: req.request_type === 'issuance' ? '#059669' : '#0369a1', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {req.request_type === 'issuance' ? <Warehouse size={12} /> : <ShoppingCart size={12} />}
              {req.request_type === 'issuance' ? 'Қоймадан алу' : 'Закуп'}
            </span>
            <span style={{ background: cfg.bg, color: cfg.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon size={13} /> {cfg.label}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-soft)' }}>
              №{req.request_number}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '4px 20px', color: 'var(--text-soft)', fontSize: '0.87rem' }}>
            <span>🏗️ <strong style={{ color: 'var(--text)' }}>{req.project_name}</strong></span>
            <span>👷 {req.foreman_name}</span>
            {req.storekeeper_name && <span>📦 Қоймашы: {req.storekeeper_name}</span>}
            <span>📅 {new Date(req.created_at).toLocaleDateString('kk-KZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {/* Supplier: approve/reject purchase requests */}
          {role === 'supplier' && req.request_type === 'purchase' && req.status === 'pending' && (
            <>
              <button className="btn-success" onClick={() => onAction('updateStatus', req.id, 'approved')}>✓ Растау</button>
              <button className="btn-danger-ghost" onClick={() => onAction('updateStatus', req.id, 'rejected')}>✕ Бас тарту</button>
            </>
          )}

          {/* Storekeeper: issue from warehouse */}
          {role === 'storekeeper' && req.request_type === 'issuance' && req.status === 'pending' && (
            <button className="btn-primary" onClick={() => onAction('issue', req.id)}>
              <PackageCheck size={16} /> Беру (материал шығару)
            </button>
          )}

          {/* Foreman: confirm receipt */}
          {role === 'foreman' && isMyRequest && req.status === 'issued' && !req.foreman_confirmed && (
            <button className="btn-success" onClick={() => onAction('confirm', req.id)}>
              <CheckCheck size={16} /> Алдым (растаймын)
            </button>
          )}

          {/* Download waybill after confirmed */}
          {(req.status === 'confirmed' || (req.status === 'issued' && req.foreman_confirmed)) && (
            <button
              className="btn-ghost"
              style={{ color: '#7c3aed', borderColor: '#7c3aed' }}
              onClick={() => printWaybill(req)}
            >
              <FileDown size={16} /> Жүк құжаты
            </button>
          )}
        </div>
      </div>

      {/* Items list */}
      {req.items?.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {req.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: '0.85rem' }}>
                <span>{item.material_name}</span>
                <strong style={{ color: 'var(--accent)', background: 'rgba(145,56,49,0.08)', padding: '1px 8px', borderRadius: 6 }}>
                  {item.quantity} {item.unit}
                </strong>
              </div>
            ))}
          </div>
          {req.notes && <p style={{ margin: '10px 0 0', fontSize: '0.85rem', color: 'var(--text-soft)', fontStyle: 'italic' }}>💬 {req.notes}</p>}
        </div>
      )}
    </div>
  );
}

function CreateModal({ onClose, onCreated, notify, type }) {
  const [projects, setProjects] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [form, setForm] = useState({ project_id: '', notes: '', items: [{ material_id: '', quantity: '' }] });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([projectsApi.list(), materialsApi.list()])
      .then(([p, m]) => { setProjects(p.projects || []); setAllMaterials(m.materials || []); })
      .catch(e => notify('error', e.message));
  }, []);

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { material_id: '', quantity: '' }] }));
  const removeItem = i => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, k, v) => setForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, [k]: v } : it) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validItems = form.items.filter(i => i.material_id && parseFloat(i.quantity) > 0);
    if (!form.project_id || validItems.length === 0) return notify('error', 'Нысан мен материалды таңдаңыз');
    setSubmitting(true);
    try {
      const data = await requestsApi.create({
        project_id: parseInt(form.project_id),
        notes: form.notes,
        request_type: type,
        items: validItems.map(i => ({ material_id: parseInt(i.material_id), quantity: parseFloat(i.quantity) }))
      });
      notify('success', type === 'issuance' ? 'Алу заявкасы жіберілді! Қоймашы растайды.' : 'Закуп заявкасы жіберілді! Жеткізуші қарайды.');
      onCreated(data.request);
      onClose();
    } catch (e) {
      notify('error', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selected = allMaterials.find(m => m.id === parseInt(form.items[0]?.material_id));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {type === 'issuance' ? <Warehouse size={22} color="#059669" /> : <ShoppingCart size={22} color="#0369a1" />}
            {type === 'issuance' ? 'Қоймадан алу заявкасы' : 'Закуп заявкасы (Сатып алу)'}
          </h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Нысан (Объект)</label>
            <select required value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}>
              <option value="">Нысанды таңдаңыз...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Материалдар ({type === 'issuance' ? 'қоймадан алынады' : 'сатып алынады'})</label>
            {form.items.map((item, i) => {
              const mat = allMaterials.find(m => m.id === parseInt(item.material_id));
              return (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select
                      required
                      value={item.material_id}
                      onChange={e => updateItem(i, 'material_id', e.target.value)}
                      style={{ flex: 2 }}
                    >
                      <option value="">Материал таңдаңыз...</option>
                      {allMaterials.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} [{m.unit}]{type === 'issuance' ? ` — ${parseFloat(m.current_quantity).toLocaleString()} бар` : ''}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number" min="0.01" step="any" required
                      placeholder="Саны"
                      value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '0 10px', cursor: 'pointer' }}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {mat && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginTop: 3, paddingLeft: 2 }}>
                      Қоймада: <strong>{parseFloat(mat.current_quantity).toLocaleString()}</strong> {mat.unit}
                      {type === 'issuance' && item.quantity && parseFloat(item.quantity) > parseFloat(mat.current_quantity) && (
                        <span style={{ color: '#dc2626', marginLeft: 8 }}>⚠ Жеткіліксіз!</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <button type="button" onClick={addItem}
              style={{ background: 'none', border: '1px dashed var(--accent)', color: 'var(--accent)', padding: '8px', borderRadius: 8, cursor: 'pointer', width: '100%', fontSize: '0.85rem' }}>
              + Материал қосу
            </button>
          </div>

          <div className="form-group">
            <label>Ескертпе (міндетті емес)</label>
            <textarea rows={2} placeholder="Қосымша ақпарат, жеткізу мерзімі..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Болдырмау</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Жіберілуде...' : 'Заявка жіберу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RequestsPage({ session, notify }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('issuance');
  const [showCreate, setShowCreate] = useState(null); // 'issuance' | 'purchase' | null
  const role = session.user?.role;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await requestsApi.list({ request_type: activeTab });
      setRequests(data.requests || []);
    } catch (e) {
      notify('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [activeTab]);

  const handleAction = async (action, id, extra) => {
    try {
      if (action === 'updateStatus') await requestsApi.updateStatus(id, extra);
      else if (action === 'issue') await requestsApi.issue(id);
      else if (action === 'confirm') await requestsApi.confirm(id);

      const labels = { updateStatus: 'Статус жаңартылды', issue: 'Материал берілді! Прораб растауы күтілуде.', confirm: 'Алдыңыз расталды! Жүк құжатын жүктей аласыз.' };
      notify('success', labels[action] || 'Жаңартылды');
      fetchRequests();
    } catch (e) {
      notify('error', e.message);
    }
  };

  const counts = { issuance: requests.filter(r => r.request_type === 'issuance').length, purchase: requests.filter(r => r.request_type === 'purchase').length };
  const canCreate = role === 'foreman';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Заявкалар</h1>
          <p className="page-subtitle">Материал сұраныстары мен қойма берулері</p>
        </div>
        {canCreate && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary" onClick={() => setShowCreate('issuance')}>
              <Warehouse size={18} /> Қоймадан алу
            </button>
            <button className="btn-ghost" onClick={() => setShowCreate('purchase')}>
              <ShoppingCart size={18} /> Закуп заявкасы
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, marginBottom: 20, width: 'fit-content' }}>
        {[
          { key: 'issuance', label: 'Қоймадан алу', icon: Warehouse },
          { key: 'purchase', label: 'Закуп заявкалары', icon: ShoppingCart }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              background: activeTab === tab.key ? 'var(--accent)' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'var(--text-soft)',
              fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.15s'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests list */}
      {loading ? (
        <div style={{ display: 'grid', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton-card" style={{ height: 130 }} />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <PackageCheck size={48} color="var(--text-soft)" />
          <p>{activeTab === 'issuance' ? 'Қоймадан алу заявкалары жоқ' : 'Закуп заявкалары жоқ'}</p>
          {canCreate && <button className="btn-primary" onClick={() => setShowCreate(activeTab)}><Plus size={16} /> Жасау</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {requests.map(req => (
            <RequestCard
              key={req.id}
              req={req}
              user={session.user}
              onAction={handleAction}
              notify={notify}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateModal
          type={showCreate}
          onClose={() => setShowCreate(null)}
          onCreated={() => fetchRequests()}
          notify={notify}
        />
      )}
    </div>
  );
}
