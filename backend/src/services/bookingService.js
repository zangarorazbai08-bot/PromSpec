import pool from '../db/pool.js';
import { calculateNights, isValidDateInput } from '../utils/date.js';
import { asNumber, cleanString } from '../utils/validators.js';
import { createError } from '../utils/httpError.js';

const activeStatuses = ['pending', 'confirmed'];
const allStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

const mapBooking = (row) => ({
  id: row.id,
  propertyId: row.property_id,
  userId: row.user_id,
  checkIn: row.check_in,
  checkOut: row.check_out,
  nights: Number(row.nights),
  guests: Number(row.guests),
  totalPrice: Number(row.total_price),
  status: row.status,
  note: row.note,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  property: row.property_id
    ? {
        id: row.property_id,
        title: row.property_title,
        city: row.property_city,
        location: row.property_location,
        image: row.property_image
      }
    : null,
  user: row.user_id
    ? {
        id: row.user_id,
        fullName: row.user_full_name,
        email: row.user_email
      }
    : null
});

const validateDates = (checkIn, checkOut) => {
  if (!isValidDateInput(checkIn) || !isValidDateInput(checkOut)) {
    throw createError(400, 'Кіру және шығу күндерін дұрыс енгізіңіз');
  }

  const nights = calculateNights(checkIn, checkOut);

  if (nights <= 0) {
    throw createError(400, 'Шығу күні кіру күнінен кейін болуы керек');
  }

  return nights;
};

const ensureBookingManager = (user, booking) => {
  if (!user) {
    throw createError(401, 'Авторизация қажет');
  }

  if (user.role === 'admin') {
    return;
  }

  if (booking.property_owner_id !== user.id) {
    throw createError(403, 'Бұл броньды басқаруға рұқсат жоқ');
  }
};

const ensureNoOverlap = async (client, propertyId, checkIn, checkOut, bookingId = null) => {
  const values = [propertyId, checkIn, checkOut];
  const excludeClause = bookingId ? `AND id <> $4` : '';

  if (bookingId) {
    values.push(bookingId);
  }

  const overlapCheck = await client.query(
    `
      SELECT id
      FROM bookings
      WHERE property_id = $1
        AND status = ANY($${bookingId ? 5 : 4})
        AND check_in < $3
        AND check_out > $2
        ${excludeClause}
      LIMIT 1
    `,
    bookingId ? [...values, activeStatuses] : [...values, activeStatuses]
  );

  if (overlapCheck.rows.length) {
    throw createError(409, 'Бұл күндер аралығында объект бос емес');
  }
};

export const createBooking = async (userId, payload) => {
  const propertyId = asNumber(payload.propertyId);
  const guests = asNumber(payload.guests);
  const note = cleanString(payload.note);
  const checkIn = cleanString(payload.checkIn);
  const checkOut = cleanString(payload.checkOut);

  if (!propertyId) {
    throw createError(400, 'Объект таңдаңыз');
  }

  if (!guests || guests <= 0) {
    throw createError(400, 'Қонақ санын енгізіңіз');
  }

  const nights = validateDates(checkIn, checkOut);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const propertyResult = await client.query(
      `
        SELECT id, title, city, location, price_per_night, guests, status, created_by
        FROM properties
        WHERE id = $1
        FOR UPDATE
      `,
      [propertyId]
    );

    if (!propertyResult.rows.length) {
      throw createError(404, 'Объект табылмады');
    }

    const property = propertyResult.rows[0];

    if (property.created_by === userId) {
      throw createError(400, 'Өзіңіздің объектіңізді өзіңіз брондай алмайсыз');
    }

    if (property.status !== 'active') {
      throw createError(400, 'Бұл объект қазір брондауға қолжетімсіз');
    }

    if (guests > Number(property.guests)) {
      throw createError(400, 'Қонақ саны объект лимитінен асып кетті');
    }

    await ensureNoOverlap(client, propertyId, checkIn, checkOut);

    const totalPrice = Number(property.price_per_night) * nights;
    const result = await client.query(
      `
        INSERT INTO bookings (user_id, property_id, check_in, check_out, nights, guests, total_price, status, note)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
        RETURNING id, property_id, user_id, check_in, check_out, nights, guests, total_price, status, note, created_at, updated_at
      `,
      [userId, propertyId, checkIn, checkOut, nights, guests, totalPrice, note || null]
    );

    await client.query('COMMIT');

    return {
      ...mapBooking({
        ...result.rows[0],
        property_title: property.title,
        property_city: property.city,
        property_location: property.location,
        property_image: null,
        user_full_name: null,
        user_email: null
      })
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const listMyBookings = async (userId) => {
  const result = await pool.query(
    `
      SELECT
        b.id,
        b.property_id,
        b.user_id,
        b.check_in,
        b.check_out,
        b.nights,
        b.guests,
        b.total_price,
        b.status,
        b.note,
        b.created_at,
        b.updated_at,
        p.title AS property_title,
        p.city AS property_city,
        p.location AS property_location,
        (
          SELECT image_url
          FROM property_images
          WHERE property_id = p.id
          ORDER BY sort_order ASC
          LIMIT 1
        ) AS property_image
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `,
    [userId]
  );

  return result.rows.map(mapBooking);
};

export const listHostBookings = async (userId) => {
  const result = await pool.query(
    `
      SELECT
        b.id,
        b.property_id,
        b.user_id,
        b.check_in,
        b.check_out,
        b.nights,
        b.guests,
        b.total_price,
        b.status,
        b.note,
        b.created_at,
        b.updated_at,
        p.title AS property_title,
        p.city AS property_city,
        p.location AS property_location,
        (
          SELECT image_url
          FROM property_images
          WHERE property_id = p.id
          ORDER BY sort_order ASC
          LIMIT 1
        ) AS property_image,
        u.full_name AS user_full_name,
        u.email AS user_email
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      JOIN users u ON u.id = b.user_id
      WHERE p.created_by = $1
      ORDER BY
        CASE b.status
          WHEN 'pending' THEN 1
          WHEN 'confirmed' THEN 2
          WHEN 'completed' THEN 3
          WHEN 'cancelled' THEN 4
          ELSE 5
        END,
        b.created_at DESC
    `,
    [userId]
  );

  return result.rows.map(mapBooking);
};

export const cancelMyBooking = async (userId, bookingId) => {
  const result = await pool.query(
    `
      UPDATE bookings
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = $1
        AND user_id = $2
        AND status IN ('pending', 'confirmed')
      RETURNING id
    `,
    [bookingId, userId]
  );

  if (!result.rows.length) {
    throw createError(404, 'Бронь табылмады немесе оны тоқтатуға болмайды');
  }

  return {
    message: 'Бронь тоқтатылды'
  };
};

export const listAllBookings = async (status) => {
  const values = [];
  const conditions = [];

  if (status && allStatuses.includes(status)) {
    values.push(status);
    conditions.push(`b.status = $${values.length}`);
  }

  const result = await pool.query(
    `
      SELECT
        b.id,
        b.property_id,
        b.user_id,
        b.check_in,
        b.check_out,
        b.nights,
        b.guests,
        b.total_price,
        b.status,
        b.note,
        b.created_at,
        b.updated_at,
        p.title AS property_title,
        p.city AS property_city,
        p.location AS property_location,
        (
          SELECT image_url
          FROM property_images
          WHERE property_id = p.id
          ORDER BY sort_order ASC
          LIMIT 1
        ) AS property_image,
        u.full_name AS user_full_name,
        u.email AS user_email
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      JOIN users u ON u.id = b.user_id
      ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
      ORDER BY b.created_at DESC
    `,
    values
  );

  return result.rows.map(mapBooking);
};

export const updateBookingStatus = async (bookingId, status) => {
  return updateManagedBookingStatus({ id: null, role: 'admin' }, bookingId, status);
};

export const updateManagedBookingStatus = async (user, bookingId, status) => {
  if (!allStatuses.includes(status)) {
    throw createError(400, 'Мәртебе қате');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const bookingResult = await client.query(
      `
        SELECT b.id, b.property_id, b.check_in, b.check_out, p.created_by AS property_owner_id
        FROM bookings b
        JOIN properties p ON p.id = b.property_id
        WHERE b.id = $1
        FOR UPDATE OF b, p
      `,
      [bookingId]
    );

    if (!bookingResult.rows.length) {
      throw createError(404, 'Бронь табылмады');
    }

    const booking = bookingResult.rows[0];
    ensureBookingManager(user, booking);

    if (activeStatuses.includes(status)) {
      await ensureNoOverlap(client, booking.property_id, booking.check_in, booking.check_out, booking.id);
    }

    const result = await client.query(
      `
        UPDATE bookings
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id
      `,
      [status, bookingId]
    );

    await client.query('COMMIT');

    return {
      message: 'Бронь мәртебесі жаңартылды',
      bookingId: result.rows[0].id,
      status
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
