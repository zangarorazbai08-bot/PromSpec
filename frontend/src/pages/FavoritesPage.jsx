import { Link } from 'react-router-dom';
import { Bath, BedDouble, Heart, MapPin, Star, Users } from 'lucide-react';

const formatter = new Intl.NumberFormat('kk-KZ', {
  style: 'currency',
  currency: 'KZT',
  maximumFractionDigits: 0
});

export default function FavoritesPage({ favorites, favoriteIds, onFavoriteToggle }) {
  return (
    <section className="section-gap">
      <div className="container">
        <div className="section-head">
          <div>
            <h1>Таңдаулылар</h1>
            <p>Жеке shortlist ретінде сақталған объектілер.</p>
          </div>
        </div>

        {favorites.length ? (
          <div className="property-grid">
            {favorites.map((property) => (
              <article className="property-card" key={property.id}>
                <div className="property-media">
                  <img
                    alt={property.title}
                    decoding="async"
                    loading="lazy"
                    sizes="(max-width: 860px) 100vw, (max-width: 1120px) 50vw, 33vw"
                    src={property.images[0]}
                  />
                  <button
                    className={`favorite-button ${favoriteIds.has(property.id) ? 'active' : ''}`}
                    onClick={() => onFavoriteToggle(property.id)}
                    type="button"
                  >
                    <Heart size={18} />
                  </button>
                </div>
                <div className="property-body">
                  <div className="property-head">
                    <div>
                      <h3>{property.title}</h3>
                      <p>
                        <MapPin size={16} />
                        {property.city}, {property.location}
                      </p>
                    </div>
                    <div className="rating-chip">
                      <Star size={16} />
                      <span>{property.ratingAvg.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="property-tags">
                    <span>
                      <Users size={16} />
                      {property.guests}
                    </span>
                    <span>
                      <BedDouble size={16} />
                      {property.bedrooms}
                    </span>
                    <span>
                      <Bath size={16} />
                      {property.bathrooms}
                    </span>
                  </div>

                  <div className="property-footer">
                    <div>
                      <strong>{formatter.format(property.pricePerNight)}</strong>
                      <span>түн үшін</span>
                    </div>
                    <Link className="button ghost" to={`/properties/${property.id}`}>
                      Қарау
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Таңдаулы объектілер жоқ</h3>
            <p>Ұнаған нұсқаларды жүрек белгісі арқылы сақтаңыз.</p>
          </div>
        )}
      </div>
    </section>
  );
}
