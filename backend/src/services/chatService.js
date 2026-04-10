import pool from '../db/pool.js';
import { cleanString } from '../utils/validators.js';
import { createError } from '../utils/httpError.js';

const mapConversation = (row, currentUserId) => {
  const peer =
    row.booker_id === currentUserId
      ? {
          id: row.owner_id,
          fullName: row.owner_full_name,
          email: row.owner_email,
          avatarUrl: row.owner_avatar_url,
          role: 'owner'
        }
      : {
          id: row.booker_id,
          fullName: row.booker_full_name,
          email: row.booker_email,
          avatarUrl: row.booker_avatar_url,
          role: 'booker'
        };

  return {
    bookingId: row.booking_id,
    bookingStatus: row.booking_status,
    checkIn: row.check_in,
    checkOut: row.check_out,
    createdAt: row.booking_created_at,
    lastMessage: row.last_message,
    lastMessageAt: row.last_message_at,
    property: {
      id: row.property_id,
      title: row.property_title,
      city: row.property_city,
      location: row.property_location,
      image: row.property_image
    },
    owner: {
      id: row.owner_id,
      fullName: row.owner_full_name,
      email: row.owner_email,
      avatarUrl: row.owner_avatar_url
    },
    booker: {
      id: row.booker_id,
      fullName: row.booker_full_name,
      email: row.booker_email,
      avatarUrl: row.booker_avatar_url
    },
    peer
  };
};

const mapMessage = (row) => ({
  id: row.id,
  bookingId: row.booking_id,
  senderId: row.sender_id,
  message: row.message,
  createdAt: row.created_at,
  sender: {
    id: row.sender_id,
    fullName: row.full_name,
    email: row.email,
    avatarUrl: row.avatar_url
  }
});

const getConversationAccess = async (userId, role, bookingId) => {
  const result = await pool.query(
    `
      SELECT
        b.id AS booking_id,
        b.status AS booking_status,
        b.check_in,
        b.check_out,
        b.created_at AS booking_created_at,
        p.id AS property_id,
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
        owner.id AS owner_id,
        owner.full_name AS owner_full_name,
        owner.email AS owner_email,
        owner.avatar_url AS owner_avatar_url,
        booker.id AS booker_id,
        booker.full_name AS booker_full_name,
        booker.email AS booker_email,
        booker.avatar_url AS booker_avatar_url
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      LEFT JOIN users owner ON owner.id = p.created_by
      JOIN users booker ON booker.id = b.user_id
      WHERE b.id = $1
      LIMIT 1
    `,
    [bookingId]
  );

  if (!result.rows.length) {
    throw createError(404, 'Чат табылмады');
  }

  const conversation = result.rows[0];
  const isParticipant = conversation.booker_id === userId || conversation.owner_id === userId;

  if (role !== 'admin' && !isParticipant) {
    throw createError(403, 'Бұл чатқа рұқсат жоқ');
  }

  return conversation;
};

export const listConversations = async (userId, role) => {
  const values = [];
  const conditions = [];

  if (role !== 'admin') {
    values.push(userId);
    conditions.push(`(b.user_id = $${values.length} OR p.created_by = $${values.length})`);
  }

  const result = await pool.query(
    `
      SELECT
        b.id AS booking_id,
        b.status AS booking_status,
        b.check_in,
        b.check_out,
        b.created_at AS booking_created_at,
        p.id AS property_id,
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
        owner.id AS owner_id,
        owner.full_name AS owner_full_name,
        owner.email AS owner_email,
        owner.avatar_url AS owner_avatar_url,
        booker.id AS booker_id,
        booker.full_name AS booker_full_name,
        booker.email AS booker_email,
        booker.avatar_url AS booker_avatar_url,
        (
          SELECT message
          FROM booking_messages
          WHERE booking_id = b.id
          ORDER BY created_at DESC
          LIMIT 1
        ) AS last_message,
        (
          SELECT created_at
          FROM booking_messages
          WHERE booking_id = b.id
          ORDER BY created_at DESC
          LIMIT 1
        ) AS last_message_at
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      LEFT JOIN users owner ON owner.id = p.created_by
      JOIN users booker ON booker.id = b.user_id
      ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
      ORDER BY COALESCE(
        (
          SELECT created_at
          FROM booking_messages
          WHERE booking_id = b.id
          ORDER BY created_at DESC
          LIMIT 1
        ),
        b.created_at
      ) DESC
    `,
    values
  );

  return result.rows.map((row) => mapConversation(row, userId));
};

export const listMessages = async (userId, role, bookingId) => {
  const conversation = await getConversationAccess(userId, role, bookingId);
  const result = await pool.query(
    `
      SELECT
        m.id,
        m.booking_id,
        m.sender_id,
        m.message,
        m.created_at,
        u.full_name,
        u.email,
        u.avatar_url
      FROM booking_messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.booking_id = $1
      ORDER BY m.created_at ASC
    `,
    [bookingId]
  );

  return {
    conversation: mapConversation(
      {
        ...conversation,
        last_message: result.rows[result.rows.length - 1]?.message || null,
        last_message_at: result.rows[result.rows.length - 1]?.created_at || null
      },
      userId
    ),
    messages: result.rows.map(mapMessage)
  };
};

export const sendMessage = async (userId, role, bookingId, message) => {
  await getConversationAccess(userId, role, bookingId);
  const normalizedMessage = cleanString(message);

  if (!normalizedMessage) {
    throw createError(400, 'Хабарлама бос болмауы керек');
  }

  const result = await pool.query(
    `
      INSERT INTO booking_messages (booking_id, sender_id, message)
      VALUES ($1, $2, $3)
      RETURNING id, booking_id, sender_id, message, created_at
    `,
    [bookingId, userId, normalizedMessage]
  );

  const sender = await pool.query('SELECT id, full_name, email, avatar_url FROM users WHERE id = $1 LIMIT 1', [userId]);

  return mapMessage({
    ...result.rows[0],
    full_name: sender.rows[0].full_name,
    email: sender.rows[0].email,
    avatar_url: sender.rows[0].avatar_url
  });
};
