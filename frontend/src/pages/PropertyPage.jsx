import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Bath,
  BedDouble,
  CalendarDays,
  Heart,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Users
} from 'lucide-react';
import { bookingApi, propertyApi, reviewApi } from '../api';

const formatter = new Intl.NumberFormat('kk-KZ', {
  style: 'currency',
  currency: 'KZT',
  maximumFractionDigits: 0
});

const daysBetween = (start, end) => {
  if (!start || !end) {
    return 0;
  }

  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  return Math.round((endDate.getTime() - startDate.getTime()) / 86400000);
};

export default function PropertyPage({ session, favoriteIds, onFavoriteToggle, notify }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    checkIn: '',
    checkOut: '',
    guests: '1',
    note: ''
  });
  const [reviewForm, setReviewForm] = useState({
    rating: '5',
    comment: ''
  });

  const fetchProperty = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await propertyApi.getById(id);
      setProperty(data.property);
      setSelectedImage(data.property.images[0] || '');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const bookingPreview = useMemo(() => {
    const nights = daysBetween(bookingForm.checkIn, bookingForm.checkOut);

    return {
      nights,
      total: nights > 0 && property ? nights * property.pricePerNight : 0
    };
  }, [bookingForm.checkIn, bookingForm.checkOut, property]);

  const isOwner = Boolean(session.user && property?.owner && session.user.id === property.owner.id);

  const handleBookingSubmit = async (event) => {
    event.preventDefault();

    if (!session.user) {
      notify('error', 'Бронь жасау үшін аккаунтқа кіріңіз');
      navigate('/auth');
      return;
    }

    setSubmittingBooking(true);

    try {
      await bookingApi.create({
        propertyId: Number(id),
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        guests: Number(bookingForm.guests),
        note: bookingForm.note
      });
      notify('success', 'Бронь жіберілді');
      setBookingForm({ checkIn: '', checkOut: '', guests: '1', note: '' });
      await fetchProperty();
      navigate('/bookings');
    } catch (requestError) {
      notify('error', requestError.message);
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!session.user) {
      notify('error', 'Пікір жазу үшін аккаунтқа кіріңіз');
      navigate('/auth');
      return;
    }

    setSubmittingReview(true);

    try {
      await reviewApi.upsert(id, {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment
      });
      notify('success', 'Пікір сақталды');
      setReviewForm({ rating: '5', comment: '' });
      await fetchProperty();
    } catch (requestError) {
      notify('error', requestError.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <section className="container section-gap">
        <div className="detail-skeleton" />
      </section>
    );
  }

  if (error || !property) {
    return (
      <section className="container section-gap empty-state">
        <h1>Нысан жүктелмеді</h1>
        <p>{error || 'Мәлімет табылмады'}</p>
        <Link className="button primary" to="/">
          Каталогқа қайту
        </Link>
      </section>
    );
  }

  return (
    <div className="section-gap">
      <div className="container detail-layout">
        <section className="detail-content">
          <div className="detail-media reveal">
            <img
              alt={property.title}
              className="detail-main-image"
              decoding="async"
              fetchpriority="high"
              loading="eager"
              sizes="(max-width: 1120px) 100vw, 64vw"
              src={selectedImage || property.images[0]}
            />
            <div className="thumbnail-row">
              {property.images.map((image) => (
                <button
                  className={`thumbnail-button ${selectedImage === image ? 'active' : ''}`}
                  key={image}
                  onClick={() => setSelectedImage(image)}
                  type="button"
                >
                  <img alt={property.title} decoding="async" loading="lazy" sizes="(max-width: 640px) 50vw, 160px" src={image} />
                </button>
              ))}
            </div>
          </div>

          <div className="detail-header reveal delay-1">
            <div>
              <span className="eyebrow">
                <Sparkles size={16} />
                Толық ақпарат
              </span>
              <h1>{property.title}</h1>
              <p className="detail-location">
                <MapPin size={18} />
                {property.city}, {property.location}
              </p>
            </div>
            <button
              className={`button ${favoriteIds.has(property.id) ? 'primary' : 'ghost'}`}
              onClick={() => onFavoriteToggle(property.id)}
              type="button"
            >
              <Heart size={18} />
              {favoriteIds.has(property.id) ? 'Таңдаулыда' : 'Таңдаулыға қосу'}
            </button>
          </div>

          <div className="glass-card reveal">
            <h2>Сипаттама</h2>
            <p>{property.description}</p>
          </div>

          <div className="glass-card reveal">
            <h2>Ыңғайлылықтар</h2>
            <div className="amenity-grid">
              {property.amenities.map((item) => (
                <span className="amenity-chip" key={item}>
                  <ShieldCheck size={16} />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-card reveal">
            <div className="section-head compact">
              <div>
                <h2>Пікірлер</h2>
                <p>{property.reviewCount} пікір жарияланған</p>
              </div>
            </div>

            {property.reviews.length ? (
              <div className="review-list">
                {property.reviews.map((review) => (
                  <article className="review-card" key={review.id}>
                    <div className="review-top">
                      <div>
                        <strong>{review.user.fullName}</strong>
                        <span>{new Date(review.createdAt).toLocaleDateString('kk-KZ')}</span>
                      </div>
                      <div className="rating-chip">
                        <Star size={16} />
                        <span>{review.rating}</span>
                      </div>
                    </div>
                    <p>{review.comment}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p>Әзірге пікір жоқ.</p>
            )}

            <form className="stack-form" onSubmit={handleReviewSubmit}>
              <div className="form-grid two">
                <label className="input-shell">
                  <span>Рейтинг</span>
                  <select onChange={(event) => setReviewForm((current) => ({ ...current, rating: event.target.value }))} value={reviewForm.rating}>
                    <option value="5">5</option>
                    <option value="4">4</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                  </select>
                </label>
              </div>
              <label className="input-shell">
                <span>Пікір</span>
                <textarea
                  onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
                  placeholder="Тұру тәжірибеңізді сипаттаңыз"
                  rows="4"
                  value={reviewForm.comment}
                />
              </label>
              <button className="button primary" disabled={submittingReview} type="submit">
                {submittingReview ? 'Сақталуда...' : 'Пікірді сақтау'}
              </button>
            </form>
          </div>
        </section>

        <aside className="detail-sidebar reveal delay-1">
          <div className="booking-card">
            <div className="booking-price">
              <strong>{formatter.format(property.pricePerNight)}</strong>
              <span>түн үшін</span>
            </div>

            <form className="stack-form" onSubmit={handleBookingSubmit}>
              <div className="form-grid two">
                <label className="input-shell">
                  <span>Кіру күні</span>
                  <input
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(event) => setBookingForm((current) => ({ ...current, checkIn: event.target.value }))}
                    type="date"
                    value={bookingForm.checkIn}
                  />
                </label>
                <label className="input-shell">
                  <span>Шығу күні</span>
                  <input
                    min={bookingForm.checkIn || new Date().toISOString().slice(0, 10)}
                    onChange={(event) => setBookingForm((current) => ({ ...current, checkOut: event.target.value }))}
                    type="date"
                    value={bookingForm.checkOut}
                  />
                </label>
              </div>

              <label className="input-shell">
                <span>Қонақ саны</span>
                <input
                  max={property.guests}
                  min="1"
                  onChange={(event) => setBookingForm((current) => ({ ...current, guests: event.target.value }))}
                  type="number"
                  value={bookingForm.guests}
                />
              </label>

              <label className="input-shell">
                <span>Ескерту</span>
                <textarea
                  onChange={(event) => setBookingForm((current) => ({ ...current, note: event.target.value }))}
                  placeholder="Қосымша сұраныс немесе ақпарат"
                  rows="3"
                  value={bookingForm.note}
                />
              </label>

              <div className="booking-summary">
                <div>
                  <span>Түн саны</span>
                  <strong>{bookingPreview.nights || 0}</strong>
                </div>
                <div>
                  <span>Жалпы сома</span>
                  <strong>{formatter.format(bookingPreview.total || 0)}</strong>
                </div>
              </div>

              <button className="button primary full-width" disabled={submittingBooking || isOwner} type="submit">
                {isOwner ? 'Бұл сіздің нысаныңыз' : submittingBooking ? 'Жіберілуде...' : 'Брондау'}
              </button>
            </form>
          </div>

          <div className="glass-card sidebar-card reveal delay-2">
            <h2>Негізгі ақпарат</h2>
            <div className="detail-meta-grid sidebar-meta-grid">
              <div className="meta-card">
                <Users size={18} />
                <strong>{property.guests}</strong>
                <span>Қонақ</span>
              </div>
              <div className="meta-card">
                <BedDouble size={18} />
                <strong>{property.bedrooms}</strong>
                <span>Жатын бөлме</span>
              </div>
              <div className="meta-card">
                <Bath size={18} />
                <strong>{property.bathrooms}</strong>
                <span>Ванна</span>
              </div>
              <div className="meta-card">
                <Star size={18} />
                <strong>{property.ratingAvg.toFixed(1)}</strong>
                <span>{property.reviewCount} пікір</span>
              </div>
            </div>
          </div>

          {property.owner && (
            <div className="glass-card sidebar-card reveal delay-2">
              <h2>Жалға беруші</h2>
              <div className="owner-card">
                <div>
                  <strong>{property.owner.fullName}</strong>
                  <p>{property.owner.email}</p>
                  <p>{property.owner.phone || 'Телефон көрсетілмеген'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="glass-card sidebar-card reveal delay-2">
            <h2>Бос емес күндер</h2>
            {property.bookedDates.length ? (
              <div className="date-chip-grid sidebar-date-grid">
                {property.bookedDates.map((range) => (
                  <span className="date-chip" key={range.id}>
                    <CalendarDays size={16} />
                    {range.checkIn} - {range.checkOut}
                  </span>
                ))}
              </div>
            ) : (
              <p>Қазір белсенді броньдар жоқ.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
