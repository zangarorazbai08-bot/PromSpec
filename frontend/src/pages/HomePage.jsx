import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Bath, BedDouble, Heart, MapPin, Search, SlidersHorizontal, Sparkles, Star, Users } from 'lucide-react';
import { propertyApi } from '../api';

const formatter = new Intl.NumberFormat('kk-KZ', {
  style: 'currency',
  currency: 'KZT',
  maximumFractionDigits: 0
});

const createInitialFilters = (searchParams) => ({
  search: searchParams.get('search') || '',
  city: searchParams.get('city') || '',
  guests: searchParams.get('guests') || '',
  minPrice: searchParams.get('minPrice') || '',
  maxPrice: searchParams.get('maxPrice') || '',
  sort: searchParams.get('sort') || 'featured',
  featured: searchParams.get('featured') === 'true'
});

export default function HomePage({ session, favoriteIds, onFavoriteToggle }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => createInitialFilters(searchParams));
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value === '' || value === false) {
        return;
      }

      params.set(key, String(value));
    });

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    propertyApi
      .list({
        ...filters,
        search: deferredSearch
      })
      .then((data) => {
        if (!active) {
          return;
        }

        startTransition(() => {
          setProperties(data.properties);
        });
      })
      .catch((requestError) => {
        if (!active) {
          return;
        }

        setError(requestError.message);
      })
      .finally(() => {
        if (!active) {
          return;
        }

        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [deferredSearch, filters.city, filters.guests, filters.minPrice, filters.maxPrice, filters.sort, filters.featured]);

  const stats = useMemo(() => {
    const cities = new Set(properties.map((item) => item.city));
    const averagePrice =
      properties.reduce((total, item) => total + item.pricePerNight, 0) / (properties.length || 1);

    return {
      total: properties.length,
      cities: cities.size,
      averagePrice: formatter.format(averagePrice)
    };
  }, [properties]);

  const featuredProperty = useMemo(
    () => properties.find((item) => item.featured) || properties[0] || null,
    [properties]
  );

  const cities = useMemo(() => Array.from(new Set(properties.map((item) => item.city))).slice(0, 8), [properties]);

  const updateFilter = (key, value) => {
    startTransition(() => {
      setFilters((current) => ({
        ...current,
        [key]: value
      }));
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      guests: '',
      minPrice: '',
      maxPrice: '',
      sort: 'featured',
      featured: false
    });
  };

  return (
    <div className="page-stack">
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy reveal">
            <span className="eyebrow">
              <Sparkles size={16} />
              Заманауи брондау платформасы
            </span>
            <h1>Тұрғын үйді тез табыңыз, қауіпсіз брондаңыз, кәсіби түрде басқарыңыз.</h1>
            <p>
              StayNest тұрғын үйлерді іздеу, салыстыру, брондау және әкімші ретінде басқару процесін бір
              порталда біріктіреді.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#catalog">
                Қазір қарау
              </a>
              <Link className="button ghost" to={session.user ? '/bookings' : '/auth'}>
                {session.user ? 'Менің броньдарым' : 'Аккаунт ашу'}
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat-card">
                <strong>{stats.total}</strong>
                <span>Қолжетімді объект</span>
              </div>
              <div className="stat-card">
                <strong>{stats.cities}</strong>
                <span>Қала</span>
              </div>
              <div className="stat-card">
                <strong>{stats.averagePrice}</strong>
                <span>Орташа баға</span>
              </div>
            </div>
          </div>

          <div className="hero-panel reveal delay-1">
            {featuredProperty ? (
              <article className="feature-card">
                <img
                  alt={featuredProperty.title}
                  decoding="async"
                  fetchpriority="high"
                  loading="eager"
                  sizes="(max-width: 1120px) 100vw, 38vw"
                  src={featuredProperty.images[0]}
                />
                <div className="feature-overlay">
                  <span className="pill accent">Ұсынылатын объект</span>
                  <h2>{featuredProperty.title}</h2>
                  <p>{featuredProperty.description}</p>
                  <div className="feature-meta">
                    <span>
                      <MapPin size={16} />
                      {featuredProperty.city}
                    </span>
                    <span>
                      <Star size={16} />
                      {featuredProperty.ratingAvg.toFixed(1)}
                    </span>
                  </div>
                  <Link className="button secondary" to={`/properties/${featuredProperty.id}`}>
                    Толық ақпарат
                  </Link>
                </div>
              </article>
            ) : (
              <div className="feature-card empty-feature">
                <h2>Объектілер жүктелуде</h2>
                <p>Бірнеше секунд күтіңіз немесе backend байланысын тексеріңіз.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section-gap" id="catalog">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">
                <SlidersHorizontal size={16} />
                Іздеу және фильтр
              </span>
              <h2>Қажет нұсқаны дәл таңдаңыз</h2>
            </div>
            <button className="button ghost" onClick={clearFilters} type="button">
              Фильтрді тазалау
            </button>
          </div>

          <div className="filter-panel">
            <label className="input-shell search-shell">
              <Search size={18} />
              <input
                onChange={(event) => updateFilter('search', event.target.value)}
                placeholder="Қала, объект атауы немесе сипаттама"
                type="text"
                value={filters.search}
              />
            </label>

            <label className="input-shell">
              <span>Қала</span>
              <select onChange={(event) => updateFilter('city', event.target.value)} value={filters.city}>
                <option value="">Барлығы</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>

            <label className="input-shell">
              <span>Қонақ саны</span>
              <input
                min="1"
                onChange={(event) => updateFilter('guests', event.target.value)}
                type="number"
                value={filters.guests}
              />
            </label>

            <label className="input-shell">
              <span>Мин баға</span>
              <input
                min="0"
                onChange={(event) => updateFilter('minPrice', event.target.value)}
                type="number"
                value={filters.minPrice}
              />
            </label>

            <label className="input-shell">
              <span>Макс баға</span>
              <input
                min="0"
                onChange={(event) => updateFilter('maxPrice', event.target.value)}
                type="number"
                value={filters.maxPrice}
              />
            </label>

            <label className="input-shell">
              <span>Сұрыптау</span>
              <select onChange={(event) => updateFilter('sort', event.target.value)} value={filters.sort}>
                <option value="featured">Ұсынылатындар</option>
                <option value="newest">Жаңалары</option>
                <option value="price_asc">Баға өсуі бойынша</option>
                <option value="price_desc">Баға кемуі бойынша</option>
                <option value="rating">Рейтинг бойынша</option>
              </select>
            </label>

            <label className="checkbox-shell">
              <input
                checked={filters.featured}
                onChange={(event) => updateFilter('featured', event.target.checked)}
                type="checkbox"
              />
              <span>Тек ұсынылатын объектілер</span>
            </label>
          </div>

          {error && <div className="alert error">{error}</div>}

          {loading ? (
            <div className="property-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="property-card skeleton-card" key={index} />
              ))}
            </div>
          ) : properties.length ? (
            <div className="property-grid">
              {properties.map((property, index) => (
                <article className="property-card reveal" key={property.id} style={{ animationDelay: `${index * 80}ms` }}>
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
                    {property.featured && <span className="pill accent floating-pill">Ұсынылатын</span>}
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
                        {property.guests} қонақ
                      </span>
                      <span>
                        <BedDouble size={16} />
                        {property.bedrooms} бөлме
                      </span>
                      <span>
                        <Bath size={16} />
                        {property.bathrooms} ванна
                      </span>
                    </div>

                    <p className="property-description">{property.description}</p>

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
              <h3>Іздеу бойынша объект табылмады</h3>
              <p>Фильтрлерді өзгертіп көріңіз немесе іздеу мәтінін қысқартыңыз.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
