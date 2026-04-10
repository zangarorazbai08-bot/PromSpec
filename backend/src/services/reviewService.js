import pool from '../db/pool.js';
import { createError } from '../utils/httpError.js';
import { asNumber, cleanString } from '../utils/validators.js';

const mapReview = (row) => ({
  id: row.id,
  rating: Number(row.rating),
  comment: row.comment,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  user: {
    id: row.user_id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url
  }
});

const refreshPropertyRating = async (client, propertyId) => {
  await client.query(
    `
      UPDATE properties
      SET
        rating_avg = stats.avg_rating,
        review_count = stats.review_total,
        updated_at = NOW()
      FROM (
        SELECT
          property_id,
          COALESCE(ROUND(AVG(rating)::numeric, 2), 0) AS avg_rating,
          COUNT(*)::int AS review_total
        FROM reviews
        WHERE property_id = $1
        GROUP BY property_id
      ) stats
      WHERE properties.id = stats.property_id
    `,
    [propertyId]
  );
};

export const listPropertyReviews = async (propertyId) => {
  const result = await pool.query(
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

  return result.rows.map(mapReview);
};

export const upsertReview = async ({ userId, propertyId, rating, comment }) => {
  const normalizedRating = asNumber(rating);
  const normalizedComment = cleanString(comment);

  if (!normalizedRating || normalizedRating < 1 || normalizedRating > 5) {
    throw createError(400, 'Рейтинг 1 мен 5 аралығында болуы керек');
  }

  if (!normalizedComment) {
    throw createError(400, 'Пікір мәтінін енгізіңіз');
  }

  const propertyCheck = await pool.query('SELECT id FROM properties WHERE id = $1 LIMIT 1', [propertyId]);

  if (!propertyCheck.rows.length) {
    throw createError(404, 'Объект табылмады');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await client.query(
      `
        INSERT INTO reviews (user_id, property_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, property_id)
        DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, updated_at = NOW()
        RETURNING id, rating, comment, created_at, updated_at
      `,
      [userId, propertyId, normalizedRating, normalizedComment]
    );

    await refreshPropertyRating(client, propertyId);

    const userResult = await client.query('SELECT id, full_name, avatar_url FROM users WHERE id = $1 LIMIT 1', [userId]);
    await client.query('COMMIT');

    return {
      ...mapReview({
        ...result.rows[0],
        user_id: userResult.rows[0].id,
        full_name: userResult.rows[0].full_name,
        avatar_url: userResult.rows[0].avatar_url
      })
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
