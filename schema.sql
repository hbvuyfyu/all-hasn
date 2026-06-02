-- HASN Digital Services Platform — PostgreSQL Schema
-- Generated from Drizzle ORM schema files

-- Enums
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE transaction_type AS ENUM ('recharge', 'purchase', 'refund');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'rejected');
CREATE TYPE recharge_status AS ENUM ('pending', 'approved', 'rejected');

-- Users
CREATE TABLE users (
  id               SERIAL PRIMARY KEY,
  phone            TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  password_hash    TEXT NOT NULL,
  role             user_role NOT NULL DEFAULT 'user',
  is_blocked       BOOLEAN NOT NULL DEFAULT FALSE,
  wallet_balance   NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sessions (connect-pg-simple)
CREATE TABLE sessions (
  sid    TEXT PRIMARY KEY,
  sess   JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);
CREATE INDEX idx_sessions_expire ON sessions(expire);

-- Categories
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  image_url   TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_visible  BOOLEAN NOT NULL DEFAULT TRUE,
  parent_id   INTEGER,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Providers
CREATE TABLE providers (
  id                   SERIAL PRIMARY KEY,
  name                 TEXT NOT NULL,
  api_url              TEXT NOT NULL DEFAULT '',
  api_key              TEXT NOT NULL DEFAULT '',
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  default_profit_margin NUMERIC(5, 2),
  default_category_id  INTEGER REFERENCES categories(id),
  last_synced_at       TIMESTAMP,
  created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Services
CREATE TABLE services (
  id                  SERIAL PRIMARY KEY,
  name                TEXT NOT NULL,
  description         TEXT,
  image_url           TEXT,
  price               NUMERIC(12, 2) NOT NULL,
  original_price      NUMERIC(12, 2),
  is_visible          BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
  category_id         INTEGER REFERENCES categories(id),
  provider_id         INTEGER REFERENCES providers(id),
  provider_service_id TEXT,
  profit_margin       NUMERIC(5, 2),
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER NOT NULL REFERENCES users(id),
  service_id        INTEGER NOT NULL REFERENCES services(id),
  service_name      TEXT NOT NULL,
  service_image     TEXT,
  amount            NUMERIC(12, 2) NOT NULL,
  quantity          INTEGER NOT NULL DEFAULT 1,
  status            order_status NOT NULL DEFAULT 'pending',
  target_id         TEXT,
  provider_order_id TEXT,
  created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  type        transaction_type NOT NULL,
  amount      NUMERIC(12, 2) NOT NULL,
  status      transaction_status NOT NULL DEFAULT 'pending',
  description TEXT,
  related_id  INTEGER,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Recharge Requests
CREATE TABLE recharge_requests (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER NOT NULL REFERENCES users(id),
  amount            NUMERIC(12, 2) NOT NULL,
  approved_amount   NUMERIC(12, 2),
  status            recharge_status NOT NULL DEFAULT 'pending',
  payment_method_id INTEGER NOT NULL,
  transaction_ref   TEXT,
  proof_image_url   TEXT,
  notes             TEXT,
  reviewed_by       INTEGER REFERENCES users(id),
  created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Banners
CREATE TABLE banners (
  id           SERIAL PRIMARY KEY,
  image_url    TEXT NOT NULL DEFAULT '',
  images       JSON NOT NULL DEFAULT '[]',
  frame_height INTEGER NOT NULL DEFAULT 400,
  title        TEXT,
  link_url     TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Site Settings
CREATE TABLE site_settings (
  id                    SERIAL PRIMARY KEY,
  site_name             TEXT NOT NULL DEFAULT 'HASN',
  logo_url              TEXT,
  favicon_url           TEXT,
  instagram_url         TEXT,
  whatsapp_url          TEXT,
  facebook_url          TEXT,
  telegram_url          TEXT,
  global_profit_margin  NUMERIC(5, 2),
  maintenance_mode      BOOLEAN NOT NULL DEFAULT FALSE,
  currency              TEXT NOT NULL DEFAULT 'USD',
  updated_at            TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Payment Methods
CREATE TABLE payment_methods (
  id             SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  details        TEXT,
  instructions   TEXT,
  account_number TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id         SERIAL PRIMARY KEY,
  action     TEXT NOT NULL,
  user_id    INTEGER REFERENCES users(id),
  details    TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_services_category_id ON services(category_id);
CREATE INDEX idx_services_provider_id ON services(provider_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_recharge_requests_user_id ON recharge_requests(user_id);
CREATE INDEX idx_recharge_requests_status ON recharge_requests(status);
CREATE INDEX idx_banners_is_active ON banners(is_active);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
