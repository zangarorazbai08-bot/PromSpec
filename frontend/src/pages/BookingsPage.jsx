import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock3, MapPin, ReceiptText } from 'lucide-react';
import { bookingApi } from '../api';
import { getBookingStatusLabel } from '../labels';

const formatter = new Intl.NumberFormat('kk-KZ', {
  style: 'currency',
  currency: 'KZT',
  maximumFractionDigits: 0
});

export default function BookingsPage({ notify }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');

  const loadBookings = async () => {
    setLoading(true);

    try {
      const data = await bookingApi.listMine();
      setBookings(data.bookings);
    } catch (error) {
      notify('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    if (status === 'all') {
      return bookings;
    }

    return bookings.filter((item) => item.status === status);
  }, [bookings, status]);

  const cancelBooking = async (bookingId) => {
    try {
      await bookingApi.cancel(bookingId);
      notify('success', 'Бронь тоқтатылды');
      await loadBookings();
    } catch (error) {
      notify('error', error.message);
    }
  };

  return (
    <section className="section-gap">
      <div className="container">
        <div className="section-head">
          <div>
            <h1>Менің броньдарым</h1>
            <p>Барлық pending, confirmed, cancelled және completed жазбалар бір жерде.</p>
          </div>
          <div className="tab-row compact">
            {[
              { value: 'all', label: 'Барлығы' },
              { value: 'pending', label: 'Күтуде' },
              { value: 'confirmed', label: 'Расталды' },
              { value: 'cancelled', label: 'Бас тартылды' },
              { value: 'completed', label: 'Аяқталды' }
            ].map((item) => (
              <button className={status === item.value ? 'tab active' : 'tab'} key={item.value} onClick={() => setStatus(item.value)} type="button">
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="list-skeleton" />
        ) : filteredBookings.length ? (
          <div className="booking-list">
            {filteredBookings.map((booking) => (
              <article className="booking-item glass-card reveal" key={booking.id}>
                <div className="booking-item-media">
                  <img
                    alt={booking.property.title}
                    decoding="async"
                    loading="lazy"
                    sizes="(max-width: 860px) 100vw, 220px"
                    src={booking.property.image}
                  />
                </div>
                <div className="booking-item-body">
                  <div className="booking-item-head">
                    <div>
                      <h3>{booking.property.title}</h3>
                      <p>
                        <MapPin size={16} />
                        {booking.property.city}, {booking.property.location}
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
                      <ReceiptText size={16} />
                      {formatter.format(booking.totalPrice)}
                    </span>
                  </div>

                  {booking.note && <p className="soft-text">{booking.note}</p>}

                  <div className="inline-actions stretch">
                    <Link className="button ghost" to={`/messages?bookingId=${booking.id}`}>
                      Чат ашу
                    </Link>
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button className="button ghost" onClick={() => cancelBooking(booking.id)} type="button">
                        Броньды тоқтату
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Әзірге бронь жоқ</h3>
            <p>Каталогтан объект таңдап, алғашқы броньды жасаңыз.</p>
          </div>
        )}
      </div>
    </section>
  );
}
