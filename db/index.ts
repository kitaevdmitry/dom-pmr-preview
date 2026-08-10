import { Pool, type QueryResultRow } from "pg";

export type DbProperty = {
  id: number;
  title: string;
  location: string;
  district: string;
  address: string;
  deal: string;
  type: string;
  price: number;
  area: number;
  rooms: number;
  floor: string;
  image: string;
  gallery: string;
  description: string;
  features: string;
  badge: string;
  publicationStatus: string;
  condition: string;
  houseMaterial: string;
  heating: string;
  balcony: string;
  bathroom: string;
  furniture: string;
  documents: string;
  lotArea: number;
  negotiable: boolean;
  active: boolean;
  x: number;
  y: number;
  createdAt: string;
  updatedAt: string;
  verifiedAt: string;
};

export type SellerLead = {
  id: number;
  name: string;
  phone: string;
  city: string;
  propertyType: string;
  note: string;
  status: string;
  createdAt: string;
};

const globalDb = globalThis as typeof globalThis & {
  __dinastiyaPool?: Pool;
  __dinastiyaReady?: Promise<void>;
};

function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  if (!globalDb.__dinastiyaPool) {
    globalDb.__dinastiyaPool = new Pool({ connectionString, max: 10 });
  }
  return globalDb.__dinastiyaPool;
}

async function initialize() {
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS properties (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      district TEXT NOT NULL DEFAULT 'Центр',
      address TEXT NOT NULL,
      deal TEXT NOT NULL DEFAULT 'Продажа',
      type TEXT NOT NULL,
      price INTEGER NOT NULL,
      area DOUBLE PRECISION NOT NULL,
      rooms INTEGER NOT NULL DEFAULT 0,
      floor TEXT NOT NULL DEFAULT '—',
      image TEXT NOT NULL DEFAULT '',
      gallery TEXT NOT NULL DEFAULT '[]',
      description TEXT NOT NULL DEFAULT '',
      features TEXT NOT NULL DEFAULT '[]',
      badge TEXT NOT NULL DEFAULT 'Новинка',
      publication_status TEXT NOT NULL DEFAULT 'Опубликован',
      condition TEXT NOT NULL DEFAULT 'Уточняется',
      house_material TEXT NOT NULL DEFAULT 'Уточняется',
      heating TEXT NOT NULL DEFAULT 'Уточняется',
      balcony TEXT NOT NULL DEFAULT 'Уточняется',
      bathroom TEXT NOT NULL DEFAULT 'Уточняется',
      furniture TEXT NOT NULL DEFAULT 'Уточняется',
      documents TEXT NOT NULL DEFAULT 'Уточняется',
      lot_area DOUBLE PRECISION NOT NULL DEFAULT 0,
      negotiable BOOLEAN NOT NULL DEFAULT FALSE,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      x DOUBLE PRECISION NOT NULL,
      y DOUBLE PRECISION NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS properties_visibility_idx
      ON properties (active, publication_status, id DESC);
    CREATE TABLE IF NOT EXISTS seller_leads (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      property_type TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Новая',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function getDb() {
  if (!globalDb.__dinastiyaReady) globalDb.__dinastiyaReady = initialize();
  await globalDb.__dinastiyaReady;
  return getPool();
}

export function propertyFromRow(row: QueryResultRow): DbProperty {
  return {
    id: Number(row.id), title: row.title, location: row.location,
    district: row.district, address: row.address, deal: row.deal, type: row.type,
    price: Number(row.price), area: Number(row.area), rooms: Number(row.rooms),
    floor: row.floor, image: row.image, gallery: row.gallery,
    description: row.description, features: row.features, badge: row.badge,
    publicationStatus: row.publication_status, condition: row.condition,
    houseMaterial: row.house_material, heating: row.heating, balcony: row.balcony,
    bathroom: row.bathroom, furniture: row.furniture, documents: row.documents,
    lotArea: Number(row.lot_area), negotiable: Boolean(row.negotiable),
    active: Boolean(row.active), x: Number(row.x), y: Number(row.y),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    verifiedAt: new Date(row.verified_at).toISOString(),
  };
}

export function leadFromRow(row: QueryResultRow): SellerLead {
  return {
    id: Number(row.id), name: row.name, phone: row.phone, city: row.city,
    propertyType: row.property_type, note: row.note, status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
  };
}
