import pool from '../db/pool.js';
import { createError } from '../utils/httpError.js';

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
  images: row.images || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const listFavorites = async (userId) => {
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
        p.created_at,
        p.updated_at,
        COALESCE(
          (
            SELECT ARRAY_AGG(image_url ORDER BY sort_order)
            FROM property_images
            WHERE property_id = p.id
          ),
          '{}'
        ) AS images
      FROM favorites fav
      JOIN properties p ON p.id = fav.property_id
      WHERE fav.user_id = $1
      ORDER BY fav.created_at DESC
    `,
    [userId]
  );

  return result.rows.map(mapProperty);
};

export const addFavorite = async (userId, propertyId) => {
  const propertyCheck = await pool.query('SELECT id FROM properties WHERE id = $1 AND status = $2 LIMIT 1', [
    propertyId,
    'active'
  ]);

  if (!propertyCheck.rows.length) {
    throw createError(404, 'Объект табылмады');
  }

  await pool.query(
    `
      INSERT INTO favorites (user_id, property_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, property_id) DO NOTHING
    `,
    [userId, propertyId]
  );

  return {
    message: 'Таңдаулыларға қосылды'
  };
};

export const removeFavorite = async (userId, propertyId) => {
  await pool.query('DELETE FROM favorites WHERE user_id = $1 AND property_id = $2', [userId, propertyId]);

  return {
    message: 'Таңдаулылардан өшірілді'
  };
};
