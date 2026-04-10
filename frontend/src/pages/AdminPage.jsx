import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Building2,
  ClipboardList,
  Pencil,
  ReceiptText,
  Save,
  Trash2,
  Users
} from 'lucide-react';
import { adminApi, propertyApi } from '../api';
import { getBookingStatusLabel, getPropertyStatusLabel, getRoleLabel } from '../labels';

const formatter = new Intl.NumberFormat('kk-KZ', {
  style: 'currency',
  currency: 'KZT',
  maximumFractionDigits: 0
});

const emptyForm = {
  title: '',
  location: '',
  city: '',
  pricePerNight: '',
  guests: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  description: '',
  amenities: '',
  images: '',
  featured: false,
  status: 'active'
};

const tabs = [
  { key: 'overview', label: 'Шолу', icon: BarChart3 },
  { key: 'properties', label: 'Нысандар', icon: Building2 },
  { key: 'bookings', label: 'Броньдар', icon: ReceiptText },
  { key: 'users', label: 'Қолданушылар', icon: Users }
];

export default function AdminPage({ notify }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [propertyForm, setPropertyForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [bookingStatus, setBookingStatus] = useState('all');
  const [saving, setSaving] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const [summaryResponse, propertiesResponse, bookingsResponse, usersResponse] = await Promise.all([
        adminApi.summary(),
        adminApi.properties(),
        adminApi.bookings(),
        adminApi.users()
      ]);

      setSummary(summaryResponse.summary);
      setProperties(propertiesResponse.properties);
      setBookings(bookingsResponse.bookings);
      setUsers(usersResponse.users);
    } catch (error) {
      notify('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const filteredBookings = useMemo(() => {
    if (bookingStatus === 'all') {
      return bookings;
    }

    return bookings.filter((booking) => booking.status === bookingStatus);
  }, [bookings, bookingStatus]);

  const resetEditor = () => {
    setEditingId(null);
    setPropertyForm(emptyForm);
  };

  const handleEditProperty = (property) => {
    setEditingId(property.id);
    setPropertyForm({
      title: property.title,
      location: property.location,
      city: property.city,
      pricePerNight: String(property.pricePerNight),
      guests: String(property.guests),
      bedrooms: String(property.bedrooms),
      bathrooms: String(property.bathrooms),
      area: property.area ? String(property.area) : '',
      description: property.description,
      amenities: property.amenities.join(', '),
      images: property.images.join('\n'),
      featured: property.featured,
      status: property.status
    });
    setActiveTab('properties');
  };

  const handlePropertySubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      ...propertyForm,
      pricePerNight: Number(propertyForm.pricePerNight),
      guests: Number(propertyForm.guests),
      bedrooms: Number(propertyForm.bedrooms),
      bathrooms: Number(propertyForm.bathrooms),
      area: propertyForm.area ? Number(propertyForm.area) : null,
      amenities: propertyForm.amenities
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      images: propertyForm.images
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
    };

    try {
      if (editingId) {
        await propertyApi.update(editingId, payload);
        notify('success', 'Объект жаңартылды');
      } else {
        await propertyApi.create(payload);
        notify('success', 'Объект құрылды');
      }

      resetEditor();
      await loadDashboard();
    } catch (error) {
      notify('error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Объектіні өшіруді растайсыз ба?')) {
      return;
    }

    try {
      await propertyApi.remove(propertyId);
      notify('success', 'Объект өшірілді');
      if (editingId === propertyId) {
        resetEditor();
      }
      await loadDashboard();
    } catch (error) {
      notify('error', error.message);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await adminApi.updateBookingStatus(bookingId, { status });
      notify('success', 'Бронь мәртебесі жаңартылды');
      await loadDashboard();
    } catch (error) {
      notify('error', error.message);
    }
  };

  if (loading && !summary) {
    return (
      <section className="container section-gap">
        <div className="list-skeleton" />
      </section>
    );
  }

  return (
    <section className="section-gap">
      <div className="container admin-layout">
        <div className="section-head">
          <div>
            <h1>Админ панелі</h1>
            <p>Пайдаланушыларды қарау, объектілерді CRUD басқару және броньдарды бақылау.</p>
          </div>
          <div className="tab-row">
            {tabs.map((tab) => (
              <button
                className={activeTab === tab.key ? 'tab active' : 'tab'}
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && summary && (
          <div className="overview-grid">
            <div className="metric-card glass-card">
              <strong>{summary.usersTotal}</strong>
              <span>Қолданушы</span>
            </div>
            <div className="metric-card glass-card">
              <strong>{summary.propertiesTotal}</strong>
              <span>Объект</span>
            </div>
            <div className="metric-card glass-card">
              <strong>{summary.bookingsTotal}</strong>
              <span>Бронь</span>
            </div>
            <div className="metric-card glass-card">
              <strong>{formatter.format(summary.revenue)}</strong>
              <span>Түсім</span>
            </div>
            <div className="status-summary glass-card">
              <h3>Бронь мәртебелері</h3>
              <div className="status-row">
                <span>Күтуде</span>
                <strong>{summary.bookingStatus.pending}</strong>
              </div>
              <div className="status-row">
                <span>Расталды</span>
                <strong>{summary.bookingStatus.confirmed}</strong>
              </div>
              <div className="status-row">
                <span>Бас тартылды</span>
                <strong>{summary.bookingStatus.cancelled}</strong>
              </div>
              <div className="status-row">
                <span>Аяқталды</span>
                <strong>{summary.bookingStatus.completed}</strong>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="admin-split">
            <form className="glass-card stack-form" onSubmit={handlePropertySubmit}>
              <div className="section-head compact">
                <div>
                  <h2>{editingId ? 'Объектіні өңдеу' : 'Жаңа объект қосу'}</h2>
                  <p>Суреттер мен ыңғайлылықтар тізімін толтырыңыз.</p>
                </div>
                {editingId && (
                  <button className="button ghost" onClick={resetEditor} type="button">
                    Жаңа форма
                  </button>
                )}
              </div>

              <div className="form-grid two">
                <label className="input-shell">
                  <span>Атауы</span>
                  <input
                    onChange={(event) => setPropertyForm((current) => ({ ...current, title: event.target.value }))}
                    type="text"
                    value={propertyForm.title}
                  />
                </label>
                <label className="input-shell">
                  <span>Қала</span>
                  <input
                    onChange={(event) => setPropertyForm((current) => ({ ...current, city: event.target.value }))}
                    type="text"
                    value={propertyForm.city}
                  />
                </label>
              </div>

              <label className="input-shell">
                <span>Мекенжай</span>
                <input
                  onChange={(event) => setPropertyForm((current) => ({ ...current, location: event.target.value }))}
                  type="text"
                  value={propertyForm.location}
                />
              </label>

              <div className="form-grid four">
                <label className="input-shell">
                  <span>Баға</span>
                  <input
                    onChange={(event) => setPropertyForm((current) => ({ ...current, pricePerNight: event.target.value }))}
                    type="number"
                    value={propertyForm.pricePerNight}
                  />
                </label>
                <label className="input-shell">
                  <span>Қонақ</span>
                  <input
                    onChange={(event) => setPropertyForm((current) => ({ ...current, guests: event.target.value }))}
                    type="number"
                    value={propertyForm.guests}
                  />
                </label>
                <label className="input-shell">
                  <span>Жатын бөлме</span>
                  <input
                    onChange={(event) => setPropertyForm((current) => ({ ...current, bedrooms: event.target.value }))}
                    type="number"
                    value={propertyForm.bedrooms}
                  />
                </label>
                <label className="input-shell">
                  <span>Жуыну бөлмесі</span>
                  <input
                    onChange={(event) => setPropertyForm((current) => ({ ...current, bathrooms: event.target.value }))}
                    type="number"
                    value={propertyForm.bathrooms}
                  />
                </label>
              </div>

              <div className="form-grid two">
                <label className="input-shell">
                  <span>Ауданы</span>
                  <input
                    onChange={(event) => setPropertyForm((current) => ({ ...current, area: event.target.value }))}
                    type="number"
                    value={propertyForm.area}
                  />
                </label>
                <label className="input-shell">
                  <span>Мәртебе</span>
                  <select
                    onChange={(event) => setPropertyForm((current) => ({ ...current, status: event.target.value }))}
                    value={propertyForm.status}
                  >
                    <option value="active">Белсенді</option>
                    <option value="draft">Нобай</option>
                  </select>
                </label>
              </div>

              <label className="input-shell">
                <span>Сипаттама</span>
                <textarea
                  onChange={(event) => setPropertyForm((current) => ({ ...current, description: event.target.value }))}
                  rows="4"
                  value={propertyForm.description}
                />
              </label>

              <label className="input-shell">
                <span>Ыңғайлылықтар</span>
                <input
                  onChange={(event) => setPropertyForm((current) => ({ ...current, amenities: event.target.value }))}
                  placeholder="Wi-Fi, Kitchen, Parking"
                  type="text"
                  value={propertyForm.amenities}
                />
              </label>

              <label className="input-shell">
                <span>Сурет сілтемелері</span>
                <textarea
                  onChange={(event) => setPropertyForm((current) => ({ ...current, images: event.target.value }))}
                  placeholder="Әр жолға бір URL"
                  rows="5"
                  value={propertyForm.images}
                />
              </label>

              <label className="checkbox-shell">
                <input
                  checked={propertyForm.featured}
                  onChange={(event) => setPropertyForm((current) => ({ ...current, featured: event.target.checked }))}
                  type="checkbox"
                />
                <span>Ұсынылатын нысан</span>
              </label>

              <button className="button primary" disabled={saving} type="submit">
                <Save size={18} />
                {saving ? 'Сақталуда...' : editingId ? 'Өзгерісті сақтау' : 'Объект құру'}
              </button>
            </form>

            <div className="admin-list glass-card">
              <div className="section-head compact">
                <div>
                  <h2>Объектілер</h2>
                  <p>{properties.length} жазба</p>
                </div>
              </div>

              <div className="admin-property-list">
                {properties.map((property) => (
                  <article className="admin-property-item" key={property.id}>
                    <div>
                      <strong>{property.title}</strong>
                      <p>
                        {property.city} • {formatter.format(property.pricePerNight)} • {getPropertyStatusLabel(property.status)}
                      </p>
                    </div>
                    <div className="inline-actions">
                      <button className="icon-button subtle" onClick={() => handleEditProperty(property)} type="button">
                        <Pencil size={18} />
                      </button>
                      <button className="icon-button subtle" onClick={() => handleDeleteProperty(property.id)} type="button">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="glass-card">
            <div className="section-head compact">
              <div>
                <h2>Броньдарды басқару</h2>
                <p>Нақты статус басқару және қақтығыстарды backend деңгейінде тексеру бар.</p>
              </div>
              <div className="tab-row compact">
                {[
                  { value: 'all', label: 'Барлығы' },
                  { value: 'pending', label: 'Күтуде' },
                  { value: 'confirmed', label: 'Расталды' },
                  { value: 'cancelled', label: 'Бас тартылды' },
                  { value: 'completed', label: 'Аяқталды' }
                ].map((item) => (
                  <button
                    className={bookingStatus === item.value ? 'tab active' : 'tab'}
                    key={item.value}
                    onClick={() => setBookingStatus(item.value)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Объект</th>
                    <th>Қолданушы</th>
                    <th>Күндер</th>
                    <th>Сома</th>
                    <th>Мәртебе</th>
                    <th>Әрекет</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.property.title}</td>
                      <td>
                        <strong>{booking.user.fullName}</strong>
                        <span>{booking.user.email}</span>
                      </td>
                      <td>
                        {booking.checkIn} - {booking.checkOut}
                      </td>
                      <td>{formatter.format(booking.totalPrice)}</td>
                      <td>
                        <span className={`status-badge status-${booking.status}`}>{getBookingStatusLabel(booking.status)}</span>
                      </td>
                      <td>
                        <div className="inline-actions stretch">
                          {['pending', 'confirmed', 'cancelled', 'completed'].map((status) => (
                            <button
                              className={booking.status === status ? 'button tiny primary' : 'button tiny ghost'}
                              key={status}
                              onClick={() => handleUpdateBookingStatus(booking.id, status)}
                              type="button"
                            >
                              {getBookingStatusLabel(status)}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="glass-card">
            <div className="section-head compact">
              <div>
                <h2>Қолданушылар тізімі</h2>
                <p>{users.length} аккаунт</p>
              </div>
              <ClipboardList size={20} />
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Аты-жөні</th>
                    <th>Email</th>
                    <th>Телефон</th>
                    <th>Рөл</th>
                    <th>Тіркелген күні</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || '-'}</td>
                      <td>
                        <span className={`status-badge status-${user.role === 'admin' ? 'confirmed' : 'pending'}`}>{getRoleLabel(user.role)}</span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString('kk-KZ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
