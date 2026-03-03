-- SmartPost WhatsApp Dashboard - Database Schema

CREATE TABLE IF NOT EXISTS contacts (
    id          SERIAL PRIMARY KEY,
    phone       VARCHAR(20) UNIQUE NOT NULL,
    name        VARCHAR(100),
    avatar_url  TEXT,
    is_business BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
    id            SERIAL PRIMARY KEY,
    contact_id    INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    last_message  TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    unread_count  INTEGER DEFAULT 0,
    status        VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','closed','pending')),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id              SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    contact_id      INTEGER REFERENCES contacts(id),
    direction       VARCHAR(10) NOT NULL CHECK (direction IN ('inbound','outbound')),
    type            VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text','image','audio','video','document','location')),
    content         TEXT,
    media_url       TEXT,
    status          VARCHAR(20) DEFAULT 'delivered' CHECK (status IN ('sent','delivered','read','failed')),
    sent_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX idx_conversations_last_msg ON conversations(last_message_at DESC);
