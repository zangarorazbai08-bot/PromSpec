import pool from '../db/pool.js';
import { sendEmail } from '../config/email.js';
import { createError } from '../utils/httpError.js';
import { cleanString, isEmail, isStrongPassword } from '../utils/validators.js';
import { comparePassword, generateResetCode, hashPassword, hashResetCode } from '../utils/password.js';

const mapUser = (row) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone,
  avatarUrl: row.avatar_url,
  role: row.role,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const register = async ({ fullName, email, password, phone, avatarUrl }) => {
  const normalizedName = cleanString(fullName);
  const normalizedEmail = cleanString(email).toLowerCase();

  if (!normalizedName) {
    throw createError(400, 'Аты-жөніңізді енгізіңіз');
  }

  if (!isEmail(normalizedEmail)) {
    throw createError(400, 'Email форматы қате');
  }

  if (!isStrongPassword(password)) {
    throw createError(400, 'Құпиясөз кемінде 8 таңбадан тұруы керек');
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [normalizedEmail]);

  if (existing.rows.length) {
    throw createError(409, 'Бұл email бұрын тіркелген');
  }

  const passwordHash = await hashPassword(password);
  const result = await pool.query(
    `
      INSERT INTO users (full_name, email, password_hash, phone, avatar_url, role)
      VALUES ($1, $2, $3, $4, $5, 'user')
      RETURNING id, full_name, email, phone, avatar_url, role, created_at, updated_at
    `,
    [normalizedName, normalizedEmail, passwordHash, cleanString(phone) || null, cleanString(avatarUrl) || null]
  );

  return mapUser(result.rows[0]);
};

export const login = async ({ email, password }) => {
  const normalizedEmail = cleanString(email).toLowerCase();

  if (!isEmail(normalizedEmail)) {
    throw createError(400, 'Email форматы қате');
  }

  if (!password) {
    throw createError(400, 'Құпиясөз енгізіңіз');
  }

  const result = await pool.query(
    `
      SELECT id, full_name, email, password_hash, phone, avatar_url, role, created_at, updated_at
      FROM users
      WHERE email = $1 AND is_active = true
      LIMIT 1
    `,
    [normalizedEmail]
  );

  if (!result.rows.length) {
    throw createError(401, 'Email немесе құпиясөз қате');
  }

  const user = result.rows[0];
  const passwordMatch = await comparePassword(password, user.password_hash);

  if (!passwordMatch) {
    throw createError(401, 'Email немесе құпиясөз қате');
  }

  return mapUser(user);
};

export const forgotPassword = async (email) => {
  const normalizedEmail = cleanString(email).toLowerCase();

  if (!isEmail(normalizedEmail)) {
    return {
      message: 'Егер email базаға тіркелген болса, код жіберілді'
    };
  }

  const userResult = await pool.query(
    `
      SELECT id, full_name, email
      FROM users
      WHERE email = $1 AND is_active = true
      LIMIT 1
    `,
    [normalizedEmail]
  );

  if (!userResult.rows.length) {
    return {
      message: 'Егер email базаға тіркелген болса, код жіберілді'
    };
  }

  const user = userResult.rows[0];
  const code = generateResetCode();
  const codeHash = hashResetCode(code);

  await pool.query('UPDATE password_reset_codes SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL', [user.id]);
  await pool.query(
    `
      INSERT INTO password_reset_codes (user_id, code_hash, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '10 minutes')
    `,
    [user.id, codeHash]
  );

  await sendEmail({
    to: user.email,
    subject: 'StayNest құпиясөзді қалпына келтіру коды',
    text: `${user.full_name}, сіздің қалпына келтіру кодыңыз: ${code}. Код 10 минутқа жарамды.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; background: #fff8dd; color: #121212;">
        <h2 style="margin: 0 0 16px;">StayNest қауіпсіздік коды</h2>
        <p style="margin: 0 0 16px;">Сәлем, ${user.full_name}.</p>
        <p style="margin: 0 0 12px;">Құпиясөзді қалпына келтіру үшін төмендегі кодты енгізіңіз:</p>
        <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; margin: 16px 0;">${code}</div>
        <p style="margin: 16px 0 0;">Код 10 минутқа жарамды.</p>
      </div>
    `
  });

  return {
    message: 'Егер email базаға тіркелген болса, код жіберілді'
  };
};

export const resetPassword = async ({ email, code, password }) => {
  const normalizedEmail = cleanString(email).toLowerCase();
  const normalizedCode = cleanString(code);

  if (!isEmail(normalizedEmail)) {
    throw createError(400, 'Email форматы қате');
  }

  if (!normalizedCode) {
    throw createError(400, 'Растау кодын енгізіңіз');
  }

  if (!isStrongPassword(password)) {
    throw createError(400, 'Құпиясөз кемінде 8 таңбадан тұруы керек');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userResult = await client.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [normalizedEmail]);

    if (!userResult.rows.length) {
      throw createError(400, 'Код немесе email қате');
    }

    const userId = userResult.rows[0].id;
    const codeHash = hashResetCode(normalizedCode);
    const resetResult = await client.query(
      `
        SELECT id, expires_at, used_at
        FROM password_reset_codes
        WHERE user_id = $1 AND code_hash = $2
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [userId, codeHash]
    );

    if (!resetResult.rows.length) {
      throw createError(400, 'Код немесе email қате');
    }

    const resetRecord = resetResult.rows[0];

    if (resetRecord.used_at) {
      throw createError(400, 'Бұл код бұрын қолданылған');
    }

    if (new Date(resetRecord.expires_at).getTime() < Date.now()) {
      throw createError(400, 'Кодтың мерзімі өтіп кеткен');
    }

    const passwordHash = await hashPassword(password);

    await client.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, userId]);
    await client.query('UPDATE password_reset_codes SET used_at = NOW() WHERE id = $1', [resetRecord.id]);

    await client.query('COMMIT');

    return {
      message: 'Құпиясөз сәтті жаңартылды'
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
