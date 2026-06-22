import pool from './pool.js';
import env from '../config/env.js';
import { hashPassword } from '../utils/password.js';

const demoProjects = [
  { name: 'Тұрғын үй кешені "Асыл Арман", А блок', location: 'Алматы қ., Абай даңғылы' },
  { name: 'Тұрғын үй кешені "Асыл Арман", Б блок', location: 'Алматы қ., Абай даңғылы' },
  { name: 'Бизнес орталығы "Болашақ"', location: 'Астана қ., Мәңгілік ел 10' },
  { name: 'Мектеп құрылысы (1200 орындық)', location: 'Шымкент қ., Нұрсәт мөлтек ауданы' },
  { name: 'Қойма кешені "Логистика"', location: 'Қарағанды қ., Индустриялық аймақ' }
];

const demoMaterials = [
  { name: 'Резиновая краска (75л)', category: 'Бояулар', color: 'Металлик', unit: 'шелек', min_quantity: 10, current_quantity: 52 },
  { name: 'Цемент ПЦ 400 Д20', category: 'Құрғақ қоспалар', color: 'Сұр', unit: 'қап (50кг)', min_quantity: 100, current_quantity: 450 },
  { name: 'Арматура А3 12мм', category: 'Металл прокаты', color: 'Қара', unit: 'тонна', min_quantity: 20, current_quantity: 85 },
  { name: 'Арматура А3 16мм', category: 'Металл прокаты', color: 'Қара', unit: 'тонна', min_quantity: 15, current_quantity: 40 },
  { name: 'Кірпіш М150 (Қызыл)', category: 'Қабырға материалдары', color: 'Қызыл', unit: 'поддон', min_quantity: 50, current_quantity: 320 },
  { name: 'Кірпіш силикатты', category: 'Қабырға материалдары', color: 'Ақ', unit: 'поддон', min_quantity: 30, current_quantity: 150 },
  { name: 'Құм (Жуылған)', category: 'Үйінді материалдар', color: 'Сары', unit: 'тонна', min_quantity: 50, current_quantity: 210 },
  { name: 'Қиыршық тас (Щебень) 5-20мм', category: 'Үйінді материалдар', color: 'Сұр', unit: 'тонна', min_quantity: 50, current_quantity: 180 },
  { name: 'Гипсокартон (Кәдімгі) 12.5мм', category: 'Әрлеу материалдары', color: 'Ақ', unit: 'лист', min_quantity: 200, current_quantity: 850 },
  { name: 'Гипсокартон (Ылғалға төзімді) 12.5мм', category: 'Әрлеу материалдары', color: 'Жасыл', unit: 'лист', min_quantity: 100, current_quantity: 420 },
  { name: 'Сырлауға арналған эмаль ПФ-115', category: 'Бояулар', color: 'Көк', unit: 'банка (3кг)', min_quantity: 20, current_quantity: 65 },
  { name: 'Фасадтық бояу (Акрил)', category: 'Бояулар', color: 'Ақ', unit: 'шелек (15л)', min_quantity: 30, current_quantity: 110 },
  { name: 'Плитка желімі (Кафель)', category: 'Құрғақ қоспалар', color: 'Сұр', unit: 'қап (25кг)', min_quantity: 80, current_quantity: 240 },
  { name: 'Еден тақтайы (Ламинат) 32 класс', category: 'Әрлеу материалдары', color: 'Ашық емен', unit: 'кв.м', min_quantity: 100, current_quantity: 600 },
  { name: 'Кабель ВВГнг-LS 3x2.5', category: 'Электр тауарлары', color: 'Қара', unit: 'метр', min_quantity: 500, current_quantity: 3200 },
  { name: 'Розетка (Екі орындық)', category: 'Электр тауарлары', color: 'Ақ', unit: 'дана', min_quantity: 50, current_quantity: 150 },
  { name: 'Профиль (Бағыттаушы) 27х28', category: 'Металл бұйымдары', color: 'Күміс', unit: 'дана (3м)', min_quantity: 300, current_quantity: 1200 },
  { name: 'Профиль (Тіреуіш) 60х27', category: 'Металл бұйымдары', color: 'Күміс', unit: 'дана (3м)', min_quantity: 300, current_quantity: 1500 },
  { name: 'Монтаждық көбік (Макрофлекс)', category: 'Оқшаулау материалдары', color: 'Сары', unit: 'баллон', min_quantity: 40, current_quantity: 130 },
  { name: 'Минералды мақта (Минвата) 50мм', category: 'Оқшаулау материалдары', color: 'Сары', unit: 'орама', min_quantity: 50, current_quantity: 220 }
];

const createTables = async (client) => {
  // ROLES: admin | director | supplier (жеткізуші) | storekeeper (қоймашы) | foreman (жұмыс жүргізуші)
  await client.query(`CREATE SEQUENCE IF NOT EXISTS request_seq START 1001`);
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      phone VARCHAR(40),
      role VARCHAR(20) NOT NULL DEFAULT 'foreman'
        CHECK (role IN ('admin', 'director', 'supplier', 'storekeeper', 'foreman')),
      is_approved BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      location TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS materials (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(120),
      color VARCHAR(50),
      unit VARCHAR(50) NOT NULL,
      current_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
      min_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // material_requests: foreman creates → supplier (purchase) or storekeeper (issuance)
  await client.query(`
    CREATE TABLE IF NOT EXISTS material_requests (
      id SERIAL PRIMARY KEY,
      request_number VARCHAR(20) UNIQUE NOT NULL DEFAULT 'REQ-' || nextval('request_seq')::text,
      request_type VARCHAR(20) NOT NULL DEFAULT 'purchase'
        CHECK (request_type IN ('purchase', 'issuance')),
      foreman_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      supplier_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      storekeeper_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'approved', 'issued', 'confirmed', 'rejected')),
      foreman_confirmed BOOLEAN NOT NULL DEFAULT false,
      foreman_confirmed_at TIMESTAMPTZ,
      notes TEXT,
      issued_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS material_request_items (
      id SERIAL PRIMARY KEY,
      request_id INTEGER NOT NULL REFERENCES material_requests(id) ON DELETE CASCADE,
      material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
      quantity NUMERIC(12, 2) NOT NULL,
      issued_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS inventory_transactions (
      id SERIAL PRIMARY KEY,
      material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(10) NOT NULL CHECK (type IN ('in', 'out')),
      quantity NUMERIC(12, 2) NOT NULL,
      reference_type VARCHAR(50),
      reference_id INTEGER,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await client.query(`CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_inventory_material_id ON inventory_transactions(material_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_requests_foreman ON material_requests(foreman_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_requests_supplier ON material_requests(supplier_id)`);
};

const ensureInitialUsers = async (client) => {
  // Admin
  const adminEmail = env.admin.email.toLowerCase();
  const existingAdmin = await client.query('SELECT id FROM users WHERE email=$1', [adminEmail]);
  if (!existingAdmin.rows.length) {
    const ph = await hashPassword(env.admin.password);
    await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, is_approved) VALUES ($1,$2,$3,'admin',true)`,
      [env.admin.name, adminEmail, ph]
    );
    console.log(`✓ Әкімші тіркелді: ${adminEmail}`);
  }

  // Director
  const directorEmail = (env.director?.email || 'director@promspec.local').toLowerCase();
  const existingDir = await client.query('SELECT id FROM users WHERE email=$1', [directorEmail]);
  if (!existingDir.rows.length) {
    const ph = await hashPassword(env.director?.password || 'password123');
    await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, is_approved) VALUES ($1,$2,$3,'director',true)`,
      [env.director?.name || 'Бас Директор', directorEmail, ph]
    );
    console.log(`✓ Бас Директор тіркелді: ${directorEmail}`);
  }

  // Demo Supplier (Жеткізуші)
  const supplierEmail = 'supply@promspec.kz';
  const existingSupplier = await client.query('SELECT id FROM users WHERE email=$1', [supplierEmail]);
  if (!existingSupplier.rows.length) {
    const ph = await hashPassword('password123');
    await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, is_approved) VALUES ($1,$2,$3,'supplier',true)`,
      ['Серік Жеткізуші', supplierEmail, ph]
    );
    console.log(`✓ Жеткізуші тіркелді: ${supplierEmail}`);
  }

  // Demo Storekeeper
  const storekeeperEmail = 'sklad@promspec.kz';
  const existingSK = await client.query('SELECT id FROM users WHERE email=$1', [storekeeperEmail]);
  let storekeeperId = existingSK.rows[0]?.id;
  if (!existingSK.rows.length) {
    const ph = await hashPassword('password123');
    const r = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, is_approved) VALUES ($1,$2,$3,'storekeeper',true) RETURNING id`,
      ['Берік Қоймашы', storekeeperEmail, ph]
    );
    storekeeperId = r.rows[0].id;
    console.log(`✓ Қоймашы тіркелді: ${storekeeperEmail}`);
  }

  // Demo Foreman
  const foremanEmail = 'prorab@promspec.kz';
  const existingForeman = await client.query('SELECT id FROM users WHERE email=$1', [foremanEmail]);
  if (!existingForeman.rows.length) {
    const ph = await hashPassword('password123');
    await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, is_approved) VALUES ($1,$2,$3,'foreman',true)`,
      ['Асқар Жұмыс Жүргізуші', foremanEmail, ph]
    );
    console.log(`✓ Жұмыс жүргізуші тіркелді: ${foremanEmail}`);
  }

  return storekeeperId;
};

const seedData = async (client, storekeeperId) => {
  const projectCount = await client.query('SELECT COUNT(*)::int AS total FROM projects');
  if (projectCount.rows[0].total === 0) {
    for (const project of demoProjects) {
      await client.query('INSERT INTO projects (name, location) VALUES ($1, $2)', [project.name, project.location]);
    }
    console.log(`✓ ${demoProjects.length} нысан қосылды`);
  }

  const materialCount = await client.query('SELECT COUNT(*)::int AS total FROM materials');
  if (materialCount.rows[0].total === 0) {
    for (const material of demoMaterials) {
      const res = await client.query(
        `INSERT INTO materials (name, category, color, unit, min_quantity, current_quantity) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [material.name, material.category, material.color, material.unit, material.min_quantity, material.current_quantity]
      );
      if (storekeeperId) {
        await client.query(
          `INSERT INTO inventory_transactions (material_id, user_id, type, quantity, reference_type, notes) VALUES ($1,$2,'in',$3,'initial_stock','Бастапқы қалдық')`,
          [res.rows[0].id, storekeeperId, material.current_quantity]
        );
      }
    }
    console.log(`✓ ${demoMaterials.length} материал қосылды`);
  }
};

export const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Only drop leftover StayNest tables that don't belong to this app
    // These only exist on first migration — safe to drop once
    const legacyTables = ['booking_messages','bookings','reviews','favorites','property_images','properties','password_reset_codes'];
    for (const t of legacyTables) {
      await client.query(`DROP TABLE IF EXISTS ${t} CASCADE`);
    }

    // CREATE tables only if they don't exist — existing data is preserved
    await createTables(client);

    // Add admin/director only if they don't exist yet
    const storekeeperId = await ensureInitialUsers(client);

    // Seed demo data only if tables are empty
    await seedData(client, storekeeperId);

    await client.query('COMMIT');
    console.log('✓ Мәліметтер базасы сәтті іске қосылды (деректер сақталды)');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database init error:', error.message);
    throw error;
  } finally {
    client.release();
  }
};
