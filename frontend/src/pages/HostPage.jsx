import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Clock3,
  ImagePlus,
  Mail,
  MapPin,
  MessageSquareMore,
  Pencil,
  Plus,
  ReceiptText,
  Save,
  Square,
  Trash2,
  Upload,
  Users,
  X
} from 'lucide-react';
import { bookingApi, propertyApi, uploadApi } from '../api';
import { getBookingStatusLabel, getPropertyStatusLabel } from '../labels';

const formatter = new Intl.NumberFormat('kk-KZ', {
  style: 'currency',
  currency: 'KZT',
  maximumFractionDigits: 0
});

const bookingStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

const createEmptyForm = (isAdmin) => ({
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
  images: [],
  featured: false,
  status: isAdmin ? 'active' : 'active'
});

export default function HostPage({ notify, user }) {
  const isAdmin = user?.role === 'admin';
  const [properties, setProperties] = useState([]);
  const [hostBookings, setHostBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [bookingSavingId, setBookingSavingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(() => createEmptyForm(isAdmin));

  const loadData = async () => {
    setLoading(true);

    try {
      const [propertyData, bookingData] = await Promise.all([propertyApi.mine(), bookingApi.listHost()]);
      setProperties(propertyData.properties);
      setHostBookings(bookingData.bookings);
    } catch (error) {
      notify('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!modalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modalOpen]);

  const bookingsByProperty = useMemo(() => {
    return hostBookings.reduce((accumulator, booking) => {
      const current = accumulator[booking.propertyId] || [];
      current.push(booking);
      accumulator[booking.propertyId] = current;
      return accumulator;
    }, {});
  }, [hostBookings]);

  const summary = useMemo(() => {
    const totals = {
      properties: properties.length,
      pending: 0,
      confirmed: 0,
      revenue: 0
    };

    hostBookings.forEach((booking) => {
      if (booking.status === 'pending') {
        totals.pending += 1;
      }

      if (booking.status === 'confirmed') {
        totals.confirmed += 1;
      }

      if (booking.status === 'confirmed' || booking.status === 'completed') {
        totals.revenue += booking.totalPrice;
      }
    });

    return totals;
  }, [hostBookings, properties.length]);

  const resetModal = () => {
    setEditingId(null);
    setForm(createEmptyForm(isAdmin));
    setModalOpen(false);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(createEmptyForm(isAdmin));
    setModalOpen(true);
  };

  const openEditModal = (property) => {
    setEditingId(property.id);
    setForm({
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
      images: property.images,
      featured: property.featured,
      status: isAdmin ? property.status : 'active'
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    setUploadingImages(true);

    try {
      const data = await uploadApi.uploadPropertyImages(formData);
      setForm((current) => ({
        ...current,
        images: [...current.images, ...data.files.map((file) => file.url)]
      }));
      notify('success', `${data.files.length} сурет жүктелді`);
    } catch (error) {
      notify('error', error.message);
    } finally {
      setUploadingImages(false);
      event.target.value = '';
    }
  };

  const removeImage = (imageUrl) => {
    setForm((current) => ({
      ...current,
      images: current.images.filter((item) => item !== imageUrl)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      status: isAdmin ? form.status : 'active',
      pricePerNight: Number(form.pricePerNight),
      guests: Number(form.guests),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      area: form.area ? Number(form.area) : null,
      amenities: form.amenities
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      images: form.images
    };

    try {
      if (editingId) {
        await propertyApi.update(editingId, payload);
        notify('success', 'Нысан жаңартылды');
      } else {
        await propertyApi.create(payload);
        notify('success', 'Нысан жарияланды');
      }

      resetModal();
      await loadData();
    } catch (error) {
      notify('error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Осы нысанды өшіргіңіз келе ме?')) {
      return;
    }

    try {
      await propertyApi.remove(propertyId);
      notify('success', 'Нысан өшірілді');

      if (editingId === propertyId) {
        resetModal();
      }

      await loadData();
    } catch (error) {
      notify('error', error.message);
    }
  };

  const handleBookingStatusChange = async (bookingId, status) => {
    setBookingSavingId(bookingId);

    try {
      await bookingApi.updateManagedStatus(bookingId, { status });
      notify('success', 'Бронь мәртебесі жаңартылды');
      await loadData();
    } catch (error) {
      notify('error', error.message);
    } finally {
      setBookingSavingId(null);
    }
  };

  return (
    <section className="section-gap">
      <div className="container host-shell">
        <div className="section-head host-toolbar">
          <div>
            <h1>Жалға беру басқаруы</h1>
            <p>Нысандардың толық ақпараты, фотолары және броньдары осы бетте жиналған.</p>
          </div>
          <button className="button primary" onClick={openCreateModal} type="button">
            <Plus size={18} />
            Жаңа нысан қосу
          </button>
        </div>

        <div className="overview-grid host-overview-grid">
          <div className="metric-card glass-card">
            <span className="soft-text">Нысандар</span>
            <strong>{summary.properties}</strong>
          </div>
          <div className="metric-card glass-card">
            <span className="soft-text">Күтудегі бронь</span>
            <strong>{summary.pending}</strong>
          </div>
          <div className="metric-card glass-card">
            <span className="soft-text">Расталған бронь</span>
            <strong>{summary.confirmed}</strong>
          </div>
          <div className="metric-card glass-card">
            <span className="soft-text">Күтілетін табыс</span>
            <strong>{formatter.format(summary.revenue)}</strong>
          </div>
        </div>

        {loading ? (
          <div className="list-skeleton" />
        ) : properties.length ? (
          <div className="host-property-grid">
            {properties.map((property) => {
              const propertyBookings = bookingsByProperty[property.id] || [];

              return (
                <article className="host-property-card glass-card" key={property.id}>
                  <div className="host-property-main">
                    <div className="host-property-gallery">
                      <img
                        alt={property.title}
                        className="host-property-hero"
                        decoding="async"
                        loading="lazy"
                        sizes="(max-width: 860px) 100vw, 34vw"
                        src={property.images[0]}
                      />
                      {property.images.length > 1 && (
                        <div className="host-property-thumbnails">
                          {property.images.slice(1).map((image, index) => (
                            <img alt={`${property.title} ${index + 2}`} key={`${property.id}-${index + 1}`} loading="lazy" src={image} />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="host-property-content">
                      <div className="booking-item-head host-property-head">
                        <div>
                          <h2>{property.title}</h2>
                          <p>
                            <MapPin size={16} />
                            {property.city}, {property.location}
                          </p>
                        </div>
                        <span className={`status-badge status-${property.status === 'active' ? 'confirmed' : 'pending'}`}>
                          {getPropertyStatusLabel(property.status)}
                        </span>
                      </div>

                      <div className="host-property-meta">
                        <span>
                          <ReceiptText size={16} />
                          {formatter.format(property.pricePerNight)} / түн
                        </span>
                        <span>
                          <Users size={16} />
                          {property.guests} қонақ
                        </span>
                        <span>
                          <BedDouble size={16} />
                          {property.bedrooms} бөлме
                        </span>
                        <span>
                          <Bath size={16} />
                          {property.bathrooms} жуыну бөлмесі
                        </span>
                        {property.area ? (
                          <span>
                            <Square size={16} />
                            {property.area} м²
                          </span>
                        ) : null}
                        <span>
                          <ImagePlus size={16} />
                          {property.images.length} фото
                        </span>
                      </div>

                      <p className="host-property-description">{property.description}</p>

                      <div className="host-property-amenities">
                        {property.amenities.map((item) => (
                          <span className="amenity-chip" key={`${property.id}-${item}`}>
                            {item}
                          </span>
                        ))}
                      </div>

                      <div className="inline-actions stretch host-property-actions">
                        <Link className="button ghost" to={`/properties/${property.id}`}>
                          Толық бетке өту
                        </Link>
                        <button className="button ghost" onClick={() => openEditModal(property)} type="button">
                          <Pencil size={18} />
                          Өзгерту
                        </button>
                        <button className="button ghost" onClick={() => handleDelete(property.id)} type="button">
                          <Trash2 size={18} />
                          Өшіру
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="host-bookings-block">
                    <div className="section-head compact host-bookings-head">
                      <div>
                        <h3>Броньдар</h3>
                        <p>{propertyBookings.length ? `${propertyBookings.length} бронь табылды` : 'Әзірге бронь жоқ'}</p>
                      </div>
                    </div>

                    {propertyBookings.length ? (
                      <div className="host-booking-list">
                        {propertyBookings.map((booking) => (
                          <article className="host-booking-card" key={booking.id}>
                            <div className="booking-item-head">
                              <div>
                                <h4>{booking.user?.fullName || 'Қонақ'}</h4>
                                <p>
                                  <Mail size={16} />
                                  {booking.user?.email || 'Email көрсетілмеген'}
                                </p>
                              </div>
                              <span className={`status-badge status-${booking.status}`}>{getBookingStatusLabel(booking.status)}</span>
                            </div>

                            <div className="booking-data-grid">
                              <span>
                                <CalendarDays size={16} />
                                {booking.checkIn} - {booking.checkOut}
                              </span>
                              <span>
                                <Clock3 size={16} />
                                {booking.nights} түн
                              </span>
                              <span>
                                <Users size={16} />
                                {booking.guests} қонақ
                              </span>
                              <span>
                                <ReceiptText size={16} />
                                {formatter.format(booking.totalPrice)}
                              </span>
                            </div>

                            {booking.note ? <p className="soft-text">{booking.note}</p> : null}

                            <div className="inline-actions stretch host-booking-actions">
                              {bookingStatuses.map((status) => (
                                <button
                                  className={booking.status === status ? 'button tiny primary' : 'button tiny ghost'}
                                  disabled={bookingSavingId === booking.id}
                                  key={`${booking.id}-${status}`}
                                  onClick={() => handleBookingStatusChange(booking.id, status)}
                                  type="button"
                                >
                                  {getBookingStatusLabel(status)}
                                </button>
                              ))}
                              <Link className="button tiny ghost" to={`/messages?bookingId=${booking.id}`}>
                                <MessageSquareMore size={16} />
                                Чат
                              </Link>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state compact-empty">
                        <h3>Бұл нысанға бронь түскен жоқ</h3>
                        <p>Жаңа өтінім түскенде осы жерде растап, статусын өзгерте аласыз.</p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Әзірге нысан жоқ</h3>
            <p>Жаңа нысан қосып, оны осы беттен толық басқара аласыз.</p>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="host-modal-backdrop" onClick={resetModal} role="presentation">
          <div className="host-modal glass-card" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <div className="host-modal-head">
              <div>
                <h2>{editingId ? 'Нысанды өзгерту' : 'Жаңа нысан қосу'}</h2>
                <p>{editingId ? 'Өзгерістерді сақтап, тізімді жаңартыңыз.' : 'Жалға берілетін нысанның толық деректерін енгізіңіз.'}</p>
              </div>
              <button aria-label="Терезені жабу" className="icon-button" onClick={resetModal} type="button">
                <X size={18} />
              </button>
            </div>

            <form className="stack-form host-modal-form" onSubmit={handleSubmit}>
              <div className="form-grid two">
                <label className="input-shell">
                  <span>Нысан атауы</span>
                  <input onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} type="text" value={form.title} />
                </label>
                <label className="input-shell">
                  <span>Қала</span>
                  <input onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} type="text" value={form.city} />
                </label>
              </div>

              <label className="input-shell">
                <span>Мекенжай</span>
                <input onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} type="text" value={form.location} />
              </label>

              <div className="form-grid four">
                <label className="input-shell">
                  <span>Бағасы</span>
                  <input onChange={(event) => setForm((current) => ({ ...current, pricePerNight: event.target.value }))} type="number" value={form.pricePerNight} />
                </label>
                <label className="input-shell">
                  <span>Қонақ саны</span>
                  <input onChange={(event) => setForm((current) => ({ ...current, guests: event.target.value }))} type="number" value={form.guests} />
                </label>
                <label className="input-shell">
                  <span>Жатын бөлме</span>
                  <input onChange={(event) => setForm((current) => ({ ...current, bedrooms: event.target.value }))} type="number" value={form.bedrooms} />
                </label>
                <label className="input-shell">
                  <span>Жуыну бөлмесі</span>
                  <input onChange={(event) => setForm((current) => ({ ...current, bathrooms: event.target.value }))} type="number" value={form.bathrooms} />
                </label>
              </div>

              <div className="form-grid two">
                <label className="input-shell">
                  <span>Ауданы</span>
                  <input onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))} type="number" value={form.area} />
                </label>
                {isAdmin && (
                  <label className="input-shell">
                    <span>Мәртебе</span>
                    <select onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} value={form.status}>
                      <option value="active">Белсенді</option>
                      <option value="draft">Нобай</option>
                    </select>
                  </label>
                )}
              </div>

              <label className="input-shell">
                <span>Сипаттама</span>
                <textarea onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows="5" value={form.description} />
              </label>

              <label className="input-shell">
                <span>Ыңғайлылықтар</span>
                <input
                  onChange={(event) => setForm((current) => ({ ...current, amenities: event.target.value }))}
                  placeholder="Wi-Fi, Асүй, Тұрақ"
                  type="text"
                  value={form.amenities}
                />
              </label>

              <div className="input-shell">
                <span>Фото жүктеу</span>
                <label className="host-upload-shell" htmlFor="property-image-upload">
                  <Upload size={18} />
                  <strong>{uploadingImages ? 'Суреттер жүктелуде...' : 'Компьютерден сурет таңдау'}</strong>
                  <p>JPEG, PNG, WEBP, GIF немесе AVIF. Әр файл 5 МБ дейін.</p>
                </label>
                <input
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="host-file-input"
                  disabled={uploadingImages}
                  id="property-image-upload"
                  multiple
                  onChange={handleImageUpload}
                  type="file"
                />
              </div>

              <div className="host-upload-grid">
                {form.images.map((image, index) => (
                  <div className="host-upload-item" key={`${image}-${index}`}>
                    <img alt={`Жүктелген фото ${index + 1}`} src={image} />
                    <button className="icon-button subtle host-upload-remove" onClick={() => removeImage(image)} type="button">
                      <X size={16} />
                    </button>
                  </div>
                ))}

                {!form.images.length && <div className="host-upload-empty">Әзірге жүктелген фото жоқ</div>}
              </div>

              <label className="checkbox-shell">
                <input checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} type="checkbox" />
                <span>Ұсынылатын нысан ретінде белгілеу</span>
              </label>

              <div className="inline-actions stretch">
                <button className="button primary" disabled={saving || uploadingImages} type="submit">
                  <Save size={18} />
                  {saving ? 'Сақталуда...' : editingId ? 'Өзгерістерді сақтау' : 'Нысанды жариялау'}
                </button>
                <button className="button ghost" onClick={resetModal} type="button">
                  Жабу
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
