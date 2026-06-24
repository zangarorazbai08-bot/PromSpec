import { useEffect, useState, useCallback, useRef } from 'react';
import { materialsApi, inventoryApi } from '../api/index.js';
import { Search, Plus, X, Package, ArrowUp, Filter, Camera, Sparkles, AlertCircle, RefreshCw, Upload } from 'lucide-react';

const CATEGORIES = ['Бояулар','Құрғақ қоспалар','Металл прокаты','Қабырға материалдары','Үйінді материалдар','Әрлеу материалдары','Электр тауарлары','Металл бұйымдары','Оқшаулау материалдары'];
const COLORS = ['Металлик','Ақ','Қара','Сұр','Қызыл','Сары','Жасыл','Көк','Ашық емен','Күміс'];

const canReceive = role => ['storekeeper','admin'].includes(role);

export default function MaterialsPage({ session, notify }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [color, setColor] = useState('');
  const [category, setCategory] = useState('');
  
  // Custom states for direct receipt
  const [showReceive, setShowReceive] = useState(false);
  const [receiveForm, setReceiveForm] = useState({ material_id: '', quantity: '', notes: '' });
  const [receiving, setReceiving] = useState(false);

  // Custom states for AI Scanning
  const [showScan, setShowScan] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const [addingScanned, setAddingScanned] = useState(false);
  const [scanForm, setScanForm] = useState({ name: '', category: '', color: '', unit: '', quantity: '', notes: '' });
  const [facingMode, setFacingMode] = useState('environment');

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const startCamera = async (mode = facingMode) => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Браузер камераны қолдамайды немесе қауіпсіз байланыс (HTTPS) қажет.');
      }

      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.error('Video play error:', e));
        };
      }
    } catch (err) {
      notify('error', 'Камераны қосу мүмкін болмады: ' + err.message);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const toggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg');
      
      stopCamera();
      setCapturedImage(base64);
      analyzeImage(base64);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setCapturedImage(base64);
      analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64) => {
    setIsScanning(true);
    try {
      const result = await inventoryApi.scan(base64);
      setScannedResult(result);
      setScanForm({
        name: result.name,
        category: result.category || 'Металл бұйымдары',
        color: result.color || '',
        unit: result.unit || 'дана',
        quantity: '',
        notes: 'AI сканер арқылы қабылданды'
      });
    } catch (err) {
      notify('error', 'Суретті талдау сәтсіз аяқталды: ' + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const resetScanState = () => {
    setCapturedImage(null);
    setScannedResult(null);
    setScanForm({ name: '', category: 'Металл бұйымдары', color: '', unit: 'дана', quantity: '', notes: '' });
    setFacingMode('environment');
    stopCamera();
  };

  const closeScanModal = () => {
    setShowScan(false);
    resetScanState();
  };

  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!scanForm.name || !scanForm.quantity || !scanForm.category || !scanForm.unit) {
      return notify('error', 'Барлық міндетті өрістерді толтырыңыз (атауы, санаты, өлшем бірлігі және саны)');
    }
    setAddingScanned(true);
    try {
      await inventoryApi.addScannedProduct({
        name: scanForm.name,
        category: scanForm.category,
        color: scanForm.color,
        unit: scanForm.unit,
        quantity: parseFloat(scanForm.quantity),
        notes: scanForm.notes
      });
      notify('success', 'Тауар сәтті қосылды және қойма қалдығы жаңартылды!');
      setShowScan(false);
      resetScanState();
      fetchMaterials();
    } catch (err) {
      notify('error', err.message);
    } finally {
      setAddingScanned(false);
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
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-primary" onClick={() => setShowScan(true)} style={{ background: '#7c3aed', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} /> AI Сканер (Приход)
            </button>
            <button className="btn-primary" onClick={() => setShowReceive(true)}>
              <ArrowUp size={18} /> Тауар қабылдау (Приход)
            </button>
          </div>
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

      {/* Scan Modal */}
      {showScan && (
        <div className="modal-overlay" onClick={closeScanModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={20} color="#7c3aed" />
                <h2 style={{ margin: 0 }}>AI арқылы тауар қабылдау</h2>
              </div>
              <button onClick={closeScanModal}><X size={20} /></button>
            </div>
            
            <div className="modal-body">
              {/* Step 1: Camera or Upload */}
              {!capturedImage && !isScanning && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {stream ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: '#000', height: '240px' }}>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{ position: 'absolute', inset: '16px', border: '2px dashed rgba(255,255,255,0.4)', borderRadius: '8px', pointerEvents: 'none' }} />
                        <button 
                          type="button" 
                          onClick={toggleCamera}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'rgba(0,0,0,0.6)',
                            border: '1.5px solid rgba(255,255,255,0.3)',
                            borderRadius: '50%',
                            width: '38px',
                            height: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            cursor: 'pointer',
                            backdropFilter: 'blur(4px)',
                            zIndex: 10
                          }}
                          title="Камераны ауыстыру"
                        >
                          <RefreshCw size={16} />
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" className="btn-primary" onClick={capturePhoto} style={{ flex: 1, justifyContent: 'center' }}>
                          <Camera size={18} /> Суретке түсіру
                        </button>
                        <button type="button" className="btn-ghost" onClick={toggleCamera} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <RefreshCw size={16} /> Ауыстыру
                        </button>
                        <button type="button" className="btn-ghost" onClick={stopCamera}>
                          Болдырмау
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <button type="button" className="btn-primary" onClick={startCamera} style={{ justifyContent: 'center', background: '#059669', padding: '12px' }}>
                        <Camera size={18} /> Камераны іске қосу (Тікелей түсіру)
                      </button>
                      
                      <div style={{ textAlign: 'center', color: 'var(--text-soft)', fontSize: '0.85rem', margin: '4px 0' }}>немесе</div>
                      
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          border: '2px dashed var(--border)',
                          borderRadius: '12px',
                          padding: '32px 16px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          background: 'var(--bg)',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 8
                        }}
                      >
                        <Upload size={32} color="var(--text-soft)" />
                        <span style={{ fontWeight: '500', color: 'var(--text)' }}>Сурет файлын таңдаңыз</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>Тауардың (мысалы, алюминий заклёпка) суретін жүктеңіз</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleFileUpload}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Scanning Loading State */}
              {isScanning && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 10px', gap: 16 }}>
                  <div style={{ animation: 'spin 1.5s linear infinite', display: 'inline-block' }}>
                    <Sparkles size={48} color="#7c3aed" />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: '600', marginBottom: 4 }}>AI суретті талдауда...</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>Өнімнің атауы, түсі мен өлшемдері анықталуда</p>
                  </div>
                </div>
              )}

              {/* Step 3: Result Verification Form */}
              {capturedImage && scannedResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 14, background: 'var(--bg)', padding: '12px', borderRadius: '12px', alignItems: 'center', border: '1px solid var(--border)' }}>
                    <img 
                      src={capturedImage} 
                      alt="Scanned product" 
                      style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', background: '#000', border: '1px solid var(--border)' }}
                    />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-soft)', textTransform: 'uppercase', fontWeight: 'bold' }}>Танылған тауар суреті</span>
                      <h4 style={{ margin: '4px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{scannedResult.name}</h4>
                      {scannedResult.description && <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-soft)' }}>{scannedResult.description}</p>}
                    </div>
                  </div>

                  {scannedResult.isMock && (
                    <div style={{ display: 'flex', gap: 10, background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.2)', padding: '10px 14px', borderRadius: '8px', color: '#b45309', fontSize: '0.85rem' }}>
                      <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong style={{ display: 'block', marginBottom: '2px' }}>Демо режим белсенді</strong>
                        <span style={{ lineHeight: '1.4' }}>Gemini API кілті мерзімі өткен немесе қате. Жүйе тауардың сипаттамаларын автоматты түрде модельдеді.</span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleScanSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="form-group">
                      <label>Тауар атауы (AI анықтаған)</label>
                      <input
                        type="text"
                        required
                        value={scanForm.name}
                        onChange={e => setScanForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Мысалы, Алюминий заклёмка"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="form-group">
                        <label>Санаты</label>
                        <select
                          required
                          value={scanForm.category}
                          onChange={e => setScanForm(p => ({ ...p, category: e.target.value }))}
                        >
                          {CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Өлшем бірлігі</label>
                        <input
                          type="text"
                          required
                          value={scanForm.unit}
                          onChange={e => setScanForm(p => ({ ...p, unit: e.target.value }))}
                          placeholder="Мысалы, пачка, дана, қап"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="form-group">
                        <label>Түсі (міндетті емес)</label>
                        <input
                          type="text"
                          value={scanForm.color}
                          onChange={e => setScanForm(p => ({ ...p, color: e.target.value }))}
                          placeholder="Мысалы, Күміс, Ақ, Сұр"
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Қабылданатын Саны *</label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          required
                          value={scanForm.quantity}
                          onChange={e => setScanForm(p => ({ ...p, quantity: e.target.value }))}
                          placeholder="Кіріс санын жазыңыз..."
                          style={{ borderColor: 'var(--accent)', borderWidth: '2px' }}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Ескертпе (міндетті емес)</label>
                      <input
                        type="text"
                        value={scanForm.notes}
                        onChange={e => setScanForm(p => ({ ...p, notes: e.target.value }))}
                        placeholder="Мысалы: Түрік жеткізушісі, накладной №45"
                      />
                    </div>

                    <div className="modal-actions" style={{ marginTop: 8 }}>
                      <button type="button" className="btn-ghost" onClick={resetScanState}>
                        Қайта түсіру
                      </button>
                      <button type="submit" className="btn-primary" style={{ background: '#7c3aed' }} disabled={addingScanned}>
                        {addingScanned ? 'Қосылуда...' : 'Тауарды қосу'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
