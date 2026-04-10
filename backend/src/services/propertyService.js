import pool from '../db/pool.js';
import { createError } from '../utils/httpError.js';
import { asBoolean, asNumber, asTextArray, cleanString } from '../utils/validators.js';

const mapProperty = (row) => ({
  id: row.id,
  title: row.title,
  location: row.location,
  city: row.city,
  pricePerNight: Number(row.price_per_night),
  ratingAvg: Number(row.rating_avg),
  reviewCount: Number(row.review_count),
  guests: Number(row.guests),
  bedrooms: Number(row.bedrooms),
  bathrooms: Number(row.bathrooms),
  area: row.area ? Number(row.area) : null,
  description: row.description,
  amenities: row.amenities || [],
  featured: row.featured,
  status: row.status,
  createdBy: row.created_by || null,
  favoriteCount: row.favorite_count ? Number(row.favorite_count) : 0,
  images: row.images || [],
  owner: row.owner_id
    ? {
        id: row.owner_id,
        fullName: row.owner_full_name,
        email: row.owner_email,
        phone: row.owner_phone,
        avatarUrl: row.owner_avatar_url
      }
    : null,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const ensurePropertyManager = (user, property) => {
  if (!user) {
    throw createError(401, 'Авторизация қажет');
  }

  if (user.role === 'admin') {
    return;
  }

  if (property.createdBy !== user.id) {
    throw createError(403, 'Бұл объектіні басқаруға рұқсат жоқ');
  }
};

const normalizePayload = (payload) => ({
  title: cleanString(payload.title),
  location: cleanString(payload.location),
  city: cleanString(payload.city),
  pricePerNight: asNumber(payload.pricePerNight ?? payload.price_per_night),
  guests: asNumber(payload.guests),
  bedrooms: asNumber(payload.bedrooms),
  bathrooms: asNumber(payload.bathrooms),
  area: asNumber(payload.area, null),
  description: cleanString(payload.description),
  amenities: asTextArray(payload.amenities),
  featured: asBoolean(payload.featured),
  status: ['active', 'draft'].includes(cleanString(payload.status)) ? cleanString(payload.status) : 'active',
  images: asTextArray(payload.images)
});

const resolvePropertyStatus = (requestedStatus, user) => {
  if (user?.role === 'admin') {
    return requestedStatus;
  }

  return 'active';
};

const validateProperty = (payload) => {
  if (!payload.title || !payload.location || !payload.city || !payload.description) {
    throw createError(400, 'Объект туралы негізгі мәліметтерді толтырыңыз');
  }

  if (!payload.pricePerNight || payload.pricePerNight <= 0) {
    throw createError(400, 'Баға дұрыс енгізілмеген');
  }

  if (!payload.guests || !payload.bedrooms || !payload.bathrooms) {
    throw createError(400, 'Қонақтар мен бөлмелер санын енгізіңіз');
  }

  if (!payload.images.length) {
    throw createError(400, 'Кемінде бір сурет қосыңыз');
  }
};

const buildListQuery = (filters, includeInactive = false) => {
  const values = [];
  const conditions = [];

  if (!includeInactive) {
    conditions.push(`p.status = 'active'`);
  } else if (filters.status && ['active', 'draft'].includes(filters.status)) {
    values.push(filters.status);
    conditions.push(`p.status = $${values.length}`);
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    conditions.push(`(p.title ILIKE $${values.length} OR p.location ILIKE $${values.length} OR p.city ILIKE $${values.length} OR p.description ILIKE $${values.length})`);
  }

  if (filters.city) {
    values.push(`%${filters.city}%`);
    conditions.push(`p.city ILIKE $${values.length}`);
  }

  if (filters.guests) {
    values.push(Number(filters.guests));
    conditions.push(`p.guests >= $${values.length}`);
  }

  if (filters.minPrice) {
    values.push(Number(filters.minPrice));
    conditions.push(`p.price_per_night >= $${values.length}`);
  }

  if (filters.maxPrice) {
    values.push(Number(filters.maxPrice));
    conditions.push(`p.price_per_night <= $${values.length}`);
  }

  if (filters.featured === 'true' || filters.featured === true) {
    conditions.push('p.featured = true');
  }

  const sortMap = {
    newest: 'p.created_at DESC',
    price_asc: 'p.price_per_night ASC',
    price_desc: 'p.price_per_night DESC',
    rating: 'p.rating_avg DESC, p.review_count DESC',
    featured: 'p.featured DESC, p.rating_avg DESC, p.created_at DESC'
  };

  return {
    values,
    whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    orderClause: sortMap[filters.sort] || sortMap.featured
  };
};

const replaceImages = async (client, propertyId, images) => {
  await client.query('DELETE FROM property_images WHERE property_id = $1', [propertyId]);

  for (const [index, image] of images.entries()) {
    await client.query(
      `
        INSERT INTO property_images (property_id, image_url, sort_order)
        VALUES ($1, $2, $3)
      `,
      [propertyId, image, index]
    );
  }
};

export const listProperties = async (filters = {}, includeInactive = false) => {
  const normalizedFilters = {
    search: cleanString(filters.search),
    city: cleanString(filters.city),
    guests: filters.guests,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sort: cleanString(filters.sort) || 'featured',
    featured: filters.featured,
    status: cleanString(filters.status)
  };

  const queryParts = buildListQuery(normalizedFilters, includeInactive);
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.title,
        p.location,
        p.city,
        p.price_per_night,
        p.rating_avg,
        p.review_count,
        p.guests,
        p.bedrooms,
        p.bathrooms,
        p.area,
        p.description,
        p.amenities,
        p.featured,
        p.status,
        p.created_by,
        p.created_at,
        p.updated_at,
        owner.id AS owner_id,
        owner.full_name AS owner_full_name,
        owner.email AS owner_email,
        owner.phone AS owner_phone,
        owner.avatar_url AS owner_avatar_url,
        COALESCE(
          (
            SELECT ARRAY_AGG(image_url ORDER BY sort_order)
            FROM property_images
            WHERE property_id = p.id
          ),
          '{}'
        ) AS images,
        COALESCE(
          (
            SELECT COUNT(*)::int
            FROM favorites
            WHERE property_id = p.id
          ),
          0
        ) AS favorite_count
      FROM properties p
      LEFT JOIN users owner ON owner.id = p.created_by
      ${queryParts.whereClause}
      ORDER BY ${queryParts.orderClause}
    `,
    queryParts.values
  );

  return result.rows.map(mapProperty);
};

export const getPropertyById = async (propertyId, includeInactive = false) => {
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.title,
        p.location,
        p.city,
        p.price_per_night,
        p.rating_avg,
        p.review_count,
        p.guests,
        p.bedrooms,
        p.bathrooms,
        p.area,
        p.description,
        p.amenities,
        p.featured,
        p.status,
        p.created_by,
        p.created_at,
        p.updated_at,
        owner.id AS owner_id,
        owner.full_name AS owner_full_name,
        owner.email AS owner_email,
        owner.phone AS owner_phone,
        owner.avatar_url AS owner_avatar_url,
        COALESCE(
          (
            SELECT ARRAY_AGG(image_url ORDER BY sort_order)
            FROM property_images
            WHERE property_id = p.id
          ),
          '{}'
        ) AS images,
        COALESCE(
          (
            SELECT COUNT(*)::int
            FROM favorites
            WHERE property_id = p.id
          ),
          0
        ) AS favorite_count
      FROM properties p
      LEFT JOIN users owner ON owner.id = p.created_by
      WHERE p.id = $1 ${includeInactive ? '' : "AND p.status = 'active'"}
      LIMIT 1
    `,
    [propertyId]
  );

  if (!result.rows.length) {
    throw createError(404, 'Объект табылмады');
  }

  const reviewsResult = await pool.query(
    `
      SELECT
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        u.id AS user_id,
        u.full_name,
        u.avatar_url
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.property_id = $1
      ORDER BY r.created_at DESC
    `,
    [propertyId]
  );

  const bookingsResult = await pool.query(
    `
      SELECT id, check_in, check_out, status
      FROM bookings
      WHERE property_id = $1 AND status IN ('pending', 'confirmed')
      ORDER BY check_in ASC
    `,
    [propertyId]
  );

  return {
    ...mapProperty(result.rows[0]),
    reviews: reviewsResult.rows.map((row) => ({
      id: row.id,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        id: row.user_id,
        fullName: row.full_name,
        avatarUrl: row.avatar_url
      }
    })),
    bookedDates: bookingsResult.rows.map((row) => ({
      id: row.id,
      checkIn: row.check_in,
      checkOut: row.check_out,
      status: row.status
    }))
  };
};

export const createProperty = async (payload, user) => {
  const normalized = normalizePayload(payload);
  normalized.status = resolvePropertyStatus(normalized.status, user);
  validateProperty(normalized);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `
        INSERT INTO properties (
          title,
          location,
          city,
          price_per_night,
          guests,
          bedrooms,
          bathrooms,
          area,
          description,
          amenities,
          featured,
          status,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `,
      [
        normalized.title,
        normalized.location,
        normalized.city,
        normalized.pricePerNight,
        normalized.guests,
        normalized.bedrooms,
        normalized.bathrooms,
        normalized.area,
        normalized.description,
        normalized.amenities,
        normalized.featured,
        normalized.status,
        user.id
      ]
    );

    const propertyId = result.rows[0].id;
    await replaceImages(client, propertyId, normalized.images);
    await client.query('COMMIT');
    return getPropertyById(propertyId, true);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const listMyProperties = async (userId) => {
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.title,
        p.location,
        p.city,
        p.price_per_night,
        p.rating_avg,
        p.review_count,
        p.guests,
        p.bedrooms,
        p.bathrooms,
        p.area,
        p.description,
        p.amenities,
        p.featured,
        p.status,
        p.created_by,
        p.created_at,
        p.updated_at,
        owner.id AS owner_id,
        owner.full_name AS owner_full_name,
        owner.email AS owner_email,
        owner.phone AS owner_phone,
        owner.avatar_url AS owner_avatar_url,
        COALESCE(
          (
            SELECT ARRAY_AGG(image_url ORDER BY sort_order)
            FROM property_images
            WHERE property_id = p.id
          ),
          '{}'
        ) AS images,
        COALESCE(
          (
            SELECT COUNT(*)::int
            FROM favorites
            WHERE property_id = p.id
          ),
          0
        ) AS favorite_count
      FROM properties p
      LEFT JOIN users owner ON owner.id = p.created_by
      WHERE p.created_by = $1
      ORDER BY p.created_at DESC
    `,
    [userId]
  );

  return result.rows.map(mapProperty);
};

export const updateProperty = async (propertyId, payload, user) => {
  const existing = await getPropertyById(propertyId, true);
  ensurePropertyManager(user, existing);
  const normalized = normalizePayload({
    ...existing,
    ...payload,
    images: payload.images ?? existing.images,
    amenities: payload.amenities ?? existing.amenities
  });
  normalized.status = resolvePropertyStatus(normalized.status, user);

  validateProperty(normalized);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(
      `
        UPDATE properties
        SET
          title = $1,
          location = $2,
          city = $3,
          price_per_night = $4,
          guests = $5,
          bedrooms = $6,
          bathrooms = $7,
          area = $8,
          description = $9,
          amenities = $10,
          featured = $11,
          status = $12,
          updated_at = NOW()
        WHERE id = $13
      `,
      [
        normalized.title,
        normalized.location,
        normalized.city,
        normalized.pricePerNight,
        normalized.guests,
        normalized.bedrooms,
        normalized.bathrooms,
        normalized.area,
        normalized.description,
        normalized.amenities,
        normalized.featured,
        normalized.status,
        propertyId
      ]
    );
    await replaceImages(client, propertyId, normalized.images);
    await client.query('COMMIT');
    return getPropertyById(propertyId, true);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const deleteProperty = async (propertyId, user) => {
  const existing = await getPropertyById(propertyId, true);
  ensurePropertyManager(user, existing);
  const result = await pool.query('DELETE FROM properties WHERE id = $1 RETURNING id', [propertyId]);

  if (!result.rows.length) {
    throw createError(404, 'Объект табылмады');
  }

  return {
    message: 'Объект өшірілді'
  };
};
