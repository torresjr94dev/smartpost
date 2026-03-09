-- SmartPost Backend — Seed SQL
-- Crea las tablas del panel y agrega datos de ejemplo
-- Ejecutar: psql $DATABASE_URL -f seed.sql

-- ─── Tablas ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contacts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(255) NOT NULL,
  phone      VARCHAR(50)  UNIQUE NOT NULL,
  is_business BOOLEAN     DEFAULT false,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      UUID        NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  last_message    TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  unread_count    INT         DEFAULT 0,
  status          VARCHAR(50) DEFAULT 'open',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction       VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  type            VARCHAR(50) DEFAULT 'text',
  content         TEXT,
  media_url       TEXT,
  status          VARCHAR(50) DEFAULT 'sent',
  sent_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS n8n_chat_histories (
  id         SERIAL       PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  message    JSONB        NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conversations_contact ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_n8n_session           ON n8n_chat_histories(session_id);

-- ─── Datos de ejemplo ────────────────────────────────────────────────────────

INSERT INTO contacts (name, phone, is_business) VALUES
  ('Maria Garcia',    '521234567890', false),
  ('Carlos Lopez',    '529876543210', false),
  ('Empresa Ejemplo', '525550001234', true)
ON CONFLICT (phone) DO NOTHING;

WITH c1 AS (SELECT id FROM contacts WHERE phone = '521234567890'),
     c2 AS (SELECT id FROM contacts WHERE phone = '529876543210'),
     c3 AS (SELECT id FROM contacts WHERE phone = '525550001234')
INSERT INTO conversations (contact_id, last_message, last_message_at, unread_count, status)
SELECT id, 'Hola, quiero informacion sobre sus servicios', NOW() - INTERVAL '10 minutes', 2, 'open'   FROM c1
UNION ALL
SELECT id, 'Gracias por la atencion',                    NOW() - INTERVAL '2 hours',    0, 'closed' FROM c2
UNION ALL
SELECT id, 'Necesito publicar en Instagram',             NOW() - INTERVAL '5 minutes',  1, 'pending' FROM c3
ON CONFLICT DO NOTHING;

INSERT INTO n8n_chat_histories (session_id, message) VALUES
  ('521234567890', '{"type":"human","content":"Hola"}'),
  ('521234567890', '{"type":"ai","content":{"conversational_response":"Hola! Soy el asistente de SmartPost. Como puedo ayudarte?","action":null,"whatsapp_message_type":"text"}}'),
  ('521234567890', '{"type":"human","content":"Quiero publicar en Facebook"}'),
  ('521234567890', '{"type":"ai","content":{"conversational_response":"Perfecto! Dime el contenido que deseas publicar.","action":"request_content","whatsapp_message_type":"text"}}')
ON CONFLICT DO NOTHING;
