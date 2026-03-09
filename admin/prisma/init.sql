-- SmartPost Admin — Crear tablas del panel Next.js
-- Ejecutar una sola vez: bash admin/prisma/init.sh

CREATE TABLE IF NOT EXISTS users (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_id               VARCHAR(50) UNIQUE,
  email               VARCHAR(255) UNIQUE NOT NULL,
  email_verified      TIMESTAMPTZ,
  name                VARCHAR(255),
  image               TEXT,
  password            TEXT,
  subscription_status VARCHAR(50)  NOT NULL DEFAULT 'trialing',
  subscription_id     VARCHAR(255),
  stripe_customer_id  VARCHAR(255),
  plan                VARCHAR(50)  NOT NULL DEFAULT 'basic',
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                VARCHAR(50) NOT NULL,
  provider            VARCHAR(100) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          INT,
  token_type          VARCHAR(50),
  scope               TEXT,
  id_token            TEXT,
  session_state       TEXT,
  UNIQUE (provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires       TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token      VARCHAR(255) UNIQUE NOT NULL,
  expires    TIMESTAMPTZ  NOT NULL,
  UNIQUE (identifier, token)
);

CREATE TABLE IF NOT EXISTS user_social_accounts (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform         VARCHAR(50) NOT NULL,
  access_token     TEXT        NOT NULL,
  refresh_token    TEXT,
  token_expires_at TIMESTAMPTZ,
  platform_user_id VARCHAR(255),
  page_id          VARCHAR(255),
  ig_user_id       VARCHAR(255),
  li_person_id     VARCHAR(255),
  profile_name     VARCHAR(255),
  profile_image    TEXT,
  is_active        BOOLEAN     NOT NULL DEFAULT true,
  connected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, platform)
);

CREATE TABLE IF NOT EXISTS posts (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform         VARCHAR(50) NOT NULL,
  content          TEXT        NOT NULL,
  image_url        TEXT,
  status           VARCHAR(50) NOT NULL DEFAULT 'draft',
  published_at     TIMESTAMPTZ,
  scheduled_for    TIMESTAMPTZ,
  platform_post_id VARCHAR(255),
  reach            INT         DEFAULT 0,
  likes            INT         DEFAULT 0,
  comments         INT         DEFAULT 0,
  shares           INT         DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_user_created  ON posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_platform ON posts(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_posts_user_status   ON posts(user_id, status);
