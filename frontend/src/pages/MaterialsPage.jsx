import { useEffect, useState, useCallback } from 'react';
import { materialsApi, inventoryApi } from '../api/index.js';
import { Search, Plus, X, Package, ArrowUp, Filter } from 'lucide-react';

const CATEGORIES = ['Бояулар','Құрғақ қоспалар','Металл прокаты','Қабырға материалдары','Үйінді материалдар','Әрлеу материалдары','Электр тауарлары','Металл бұйымдары','Оқшаулау материалдары'];
const COLORS = ['Металлик','Ақ','Қара','Сұр','Қызыл','Сары','Жасыл','Көк','Ашық емен','Күміс'];

const canReceive = role => ['storekeeper','admin'].includes(role);

export default function MaterialsPage({ session, notify }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [color, setColor] = useState('');
  const [category, setCategory] = useState('');
  const [showReceive, setShowReceive] = useState(false);
  const [receiveForm, setReceiveForm] = useState({ material_id: '', quantity: '', notes: '' });
  const [receiving, setReceiving] = useState(false);
  const role = session.user?.role;

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      const data = await materialsApi.list({ search, color, category });
      setMaterials(data.materials || []);
    } catch (e) {
      notify('error', e.message);
    } finally {
      setLoading(false);
    }
  }, [search, color, category]);

  useEffect(() => {
    const timer = setTimeout(fetchMaterials, 300);
    return () => clearTimeout(timer);
  }, [fetchMaterials]);

  const handleReceive = async (e) => {
    e.preventDefault();
    if (!receiveForm.material_id || !receiveForm.quantity) return notify('error', 'Материал мен санын енгізіңіз');
    setReceiving(true);
    try {
      await inventoryApi.addTransaction({
        material_id: parseInt(receiveForm.material_id),
        type: 'in',
        quantity: parseFloat(receiveForm.quantity),
        notes: receiveForm.notes || 'Тауар қабылдау'
      });
      notify('success', 'Тауар сәтті қабылданды! Қалдық жаңартылды.');
      setShowReceive(false);
      setReceiveForm({ material_id: '', quantity: '', notes: '' });
      fetchMaterials();
    } catch (e) {
      notify('error', e.message);
    } finally {
      setReceiving(false);
    }
  };

  const stockLevel = (m) => {
    if (m.min_quantity === 0) return 'ok';
    if (m.current_quantity <= 0) return 'empty';
    if (m.current_quantity <= m.min_quantity) return 'low';
    return 'ok';
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Қойма қалдықтары</h1>
          <p className="page-subtitle">{materials.length} материал көрсетілуде</p>
        </div>
        {canReceive(role) && (
          <button className="btn-primary" onClick={() => setShowReceive(true)}>
            <ArrowUp size={18} /> Тауар қабылдау (Приход)
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} color="var(--text-soft)" />
          <input
            type="text"
            placeholder="Материалды іздеу..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}><X size={14} /></button>}
        </div>
        <select value={color} onChange={e => setColor(e.target.value)} className="filter-select">
          <option value="">Барлық түстер</option>
          {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)} className="filter-select">
          <option value="">Барлық санаттар</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(color || category) && (
          <button className="filter-clear" onClick={() => { setColor(''); setCategory(''); }}>
            <X size={14} /> Тазарту
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Атауы</th>
              <th>Санат</th>
              <th>Түсі</th>
              <th>Өлшем</th>
              <th>Қалдық</th>
              <th>Күй</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j}><div className="skeleton-line" /></td>
                  ))}
                </tr>
              ))
            ) : materials.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-soft)' }}>
                Сүзгілерге сәйкес материалдар табылмады
              </td></tr>
            ) : materials.map(m => {
              const level = stockLevel(m);
              return (
                <tr key={m.id} className="table-row">
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="material-icon">
                        <Package size={18} color="var(--accent)" />
                      </div>
                      <strong>{m.name}</strong>
                    </div>
                  </td>
                  <td><span className="tag">{m.category}</span></td>
                  <td>{m.color || '—'}</td>
                  <td style={{ color: 'var(--text-soft)' }}>{m.unit}</td>
                  <td>
                    <strong style={{ fontSize: '1.1rem' }}>{parseFloat(m.current_quantity).toLocaleString()}</strong>
                  </td>
                  <td>
                    {level === 'empty' && <span className="status-badge danger">Таусылды</span>}
                    {level === 'low' && <span className="status-badge warning">Аз қалды</span>}
                    {level === 'ok' && <span className="status-badge success">Жеткілікті</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Receive Modal */}
      {showReceive && (
        <div className="modal-overlay" onClick={() => setShowReceive(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Тауар қабылдау (Приход)</h2>
              <button onClick={() => setShowReceive(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleReceive} className="modal-body">
              <div className="form-group">
                <label>Материал</label>
                <select
                  required
                  value={receiveForm.material_id}
                  onChange={e => setReceiveForm(p => ({ ...p, material_id: e.target.value }))}
                >
                  <option value="">Материалды таңдаңыз...</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Саны</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="Қанша?"
                  value={receiveForm.quantity}
                  onChange={e => setReceiveForm(p => ({ ...p, quantity: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Ескертпе (міндетті емес)</label>
                <input
                  type="text"
                  placeholder="Жеткізуші, накладной нөмірі..."
                  value={receiveForm.notes}
                  onChange={e => setReceiveForm(p => ({ ...p, notes: e.target.value }))}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowReceive(false)}>Болдырмау</button>
                <button type="submit" className="btn-primary" disabled={receiving}>
                  {receiving ? 'Жіберілуде...' : 'Қабылдау'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
