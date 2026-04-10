import pool from '../db/pool.js';

export const getAdminSummary = async () => {
  const [countsResult, statusResult, revenueResult] = await Promise.all([
    pool.query(
      `
        SELECT
          (SELECT COUNT(*)::int FROM users) AS users_total,
          (SELECT COUNT(*)::int FROM properties) AS properties_total,
          (SELECT COUNT(*)::int FROM bookings) AS bookings_total,
          (SELECT COUNT(*)::int FROM favorites) AS favorites_total,
          (SELECT COUNT(*)::int FROM reviews) AS reviews_total
      `
    ),
    pool.query(
      `
        SELECT status, COUNT(*)::int AS total
        FROM bookings
        GROUP BY status
      `
    ),
    pool.query(
      `
        SELECT COALESCE(SUM(total_price), 0)::numeric(12, 2) AS revenue
        FROM bookings
        WHERE status IN ('confirmed', 'completed')
      `
    )
  ]);

  const bookingStatus = statusResult.rows.reduce(
    (accumulator, row) => ({
      ...accumulator,
      [row.status]: Number(row.total)
    }),
    {
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0
    }
  );

  return {
    usersTotal: countsResult.rows[0].users_total,
    propertiesTotal: countsResult.rows[0].properties_total,
    bookingsTotal: countsResult.rows[0].bookings_total,
    favoritesTotal: countsResult.rows[0].favorites_total,
    reviewsTotal: countsResult.rows[0].reviews_total,
    revenue: Number(revenueResult.rows[0].revenue),
    bookingStatus
  };
};
