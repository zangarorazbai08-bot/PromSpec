import pool from './pool.js';
import env from '../config/env.js';
import { hashPassword } from '../utils/password.js';

const demoProperties = [
  {
    title: 'Almaty Panorama Residence',
    location: 'Dostyk Avenue 128',
    city: 'Almaty',
    pricePerNight: 42000,
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    area: 86,
    description:
      'Қаланың орталығына жақын, панорамалық терезелері бар премиум пәтер. Жылдам Wi-Fi, толық жабдықталған ас үй және тыныш демалыс аймағы бар.',
    amenities: ['Wi-Fi', 'Kitchen', 'Air conditioning', 'Parking', 'Workspace', 'Washer'],
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    title: 'Astana Skyline Loft',
    location: 'Turan Avenue 32',
    city: 'Astana',
    pricePerNight: 36000,
    guests: 3,
    bedrooms: 1,
    bathrooms: 1,
    area: 64,
    description:
      'Заманауи лофт стиліндегі пәтер. Іскерлік сапар мен қысқа демалысқа ыңғайлы, smart TV және кофе аймағы бар.',
    amenities: ['Wi-Fi', 'Smart TV', 'Coffee machine', 'Elevator', 'Heating'],
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    title: 'Shymkent Garden House',
    location: 'Tauke Khan 55',
    city: 'Shymkent',
    pricePerNight: 52000,
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    area: 140,
    description:
      'Отбасылық демалысқа арналған кең үй. Жасыл ауласы, барбекю аймағы және балаларға қауіпсіз ортасы бар.',
    amenities: ['Garden', 'Barbecue', 'Wi-Fi', 'Parking', 'Kitchen', 'Family friendly'],
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1430285561322-7808604715df?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    title: 'Aktau Sea Breeze Apartment',
    location: 'Microdistrict 15, 9',
    city: 'Aktau',
    pricePerNight: 47000,
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    area: 78,
    description:
      'Теңізге жақын жайлы апартамент. Кешкі серуенге және демалыс күндеріне қолайлы, балконы теңізге қарайды.',
    amenities: ['Sea view', 'Balcony', 'Wi-Fi', 'Kitchen', 'Air conditioning'],
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    title: 'Turkistan Courtyard Villa',
    location: 'Sattarkhanov 18',
    city: 'Turkistan',
    pricePerNight: 68000,
    guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    area: 210,
    description:
      'Үлкен компанияға арналған вилла. Ішкі ауласы, кең қонақ бөлмесі және бірнеше жеке жатын бөлмелері бар.',
    amenities: ['Courtyard', 'Parking', 'Wi-Fi', 'Kitchen', 'Workspace', 'Washer'],
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    title: 'Karaganda Urban Studio',
    location: 'Bukhar Zhyrau 74',
    city: 'Karaganda',
    pricePerNight: 25000,
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    area: 42,
    description:
      'Минималистік стильдегі ықшам студия. Қысқа мерзімді тұруға ыңғайлы, орталық ауданда орналасқан.',
    amenities: ['Wi-Fi', 'Kitchenette', 'Smart lock', 'Heating'],
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
    ]
  }
];

const createTables = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      phone VARCHAR(40),
      avatar_url TEXT,
      role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS password_reset_codes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS properties (
      id SERIAL PRIMARY KEY,
      title VARCHAR(180) NOT NULL,
      location VARCHAR(180) NOT NULL,
      city VARCHAR(120) NOT NULL,
      price_per_night NUMERIC(12, 2) NOT NULL,
      rating_avg NUMERIC(3, 2) NOT NULL DEFAULT 0,
      review_count INTEGER NOT NULL DEFAULT 0,
      guests INTEGER NOT NULL,
      bedrooms INTEGER NOT NULL,
      bathrooms INTEGER NOT NULL,
      area INTEGER,
      description TEXT NOT NULL,
      amenities TEXT[] NOT NULL DEFAULT '{}',
      featured BOOLEAN NOT NULL DEFAULT false,
      status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft')),
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS property_images (
      id SERIAL PRIMARY KEY,
      property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS favorites (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, property_id)
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, property_id)
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      nights INTEGER NOT NULL,
      guests INTEGER NOT NULL,
      total_price NUMERIC(12, 2) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (check_out > check_in)
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS booking_messages (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await client.query(`CREATE INDEX IF NOT EXISTS idx_password_reset_codes_user_id ON password_reset_codes(user_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_property_active_dates ON bookings(property_id, status, check_in, check_out)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON reviews(property_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_booking_messages_booking_id ON booking_messages(booking_id, created_at)`);
};

const ensureAdmin = async (client) => {
  const adminEmail = env.admin.email.toLowerCase();
  const existingAdmin = await client.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [adminEmail]);

  if (existingAdmin.rows.length) {
    return existingAdmin.rows[0].id;
  }

  const passwordHash = await hashPassword(env.admin.password);
  const result = await client.query(
    `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES ($1, $2, $3, 'admin')
      RETURNING id
    `,
    [env.admin.name, adminEmail, passwordHash]
  );

  return result.rows[0].id;
};

const seedProperties = async (client, adminId) => {
  const propertyCount = await client.query('SELECT COUNT(*)::int AS total FROM properties');

  if (propertyCount.rows[0].total > 0) {
    return;
  }

  for (const property of demoProperties) {
    const created = await client.query(
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
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active', $12)
        RETURNING id
      `,
      [
        property.title,
        property.location,
        property.city,
        property.pricePerNight,
        property.guests,
        property.bedrooms,
        property.bathrooms,
        property.area,
        property.description,
        property.amenities,
        property.featured,
        adminId
      ]
    );

    for (const [index, image] of property.images.entries()) {
      await client.query(
        `
          INSERT INTO property_images (property_id, image_url, sort_order)
          VALUES ($1, $2, $3)
        `,
        [created.rows[0].id, image, index]
      );
    }
  }
};

const publishUserDraftProperties = async (client) => {
  await client.query(`
    UPDATE properties p
    SET status = 'active',
        updated_at = NOW()
    FROM users u
    WHERE p.created_by = u.id
      AND u.role = 'user'
      AND p.status = 'draft'
  `);
};

export const initializeDatabase = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await createTables(client);
    const adminId = await ensureAdmin(client);
    await seedProperties(client, adminId);
    await publishUserDraftProperties(client);
    await client.query('COMMIT');
    console.log('Database initialization completed');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
