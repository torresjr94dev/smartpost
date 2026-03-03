const express = require('express');
const cors    = require('cors');
const { Pool } = require('pg');
const crypto  = require('crypto');

const app  = express();
const port = 4000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://smartpost:smartpost_pass@postgres:5432/smartpost',
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const ADMIN_USER   = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS   = process.env.ADMIN_PASS || 'smartpost2024';
const SECRET_TOKEN = crypto
  .createHash('sha256')
  .update(`${ADMIN_USER}:${ADMIN_PASS}:smartpost-secret-v1`)
  .digest('hex');

// Health check — sin auth
app.get('/health', (_, res) => res.json({ ok: true }));

// Login — sin auth
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({
      token: SECRET_TOKEN,
      user: { username, name: 'Administrador' },
    });
  }
  res.status(401).json({ error: 'Credenciales incorrectas' });
});

// Auth middleware — aplica a todas las rutas /api registradas DESPUÉS
app.use('/api', (req, res, next) => {
  const auth  = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== SECRET_TOKEN) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
});

// GET /api/conversations
app.get('/api/conversations', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        c.id,
        c.last_message,
        c.last_message_at,
        c.unread_count,
        c.status,
        ct.name       AS contact_name,
        ct.phone      AS contact_phone,
        ct.is_business,
        ct.created_at AS contact_since
      FROM conversations c
      JOIN contacts ct ON ct.id = c.contact_id
      ORDER BY c.last_message_at DESC
    `);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/conversations/:id/messages
app.get('/api/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(`
      SELECT
        m.id,
        m.direction,
        m.type,
        m.content,
        m.media_url,
        m.status,
        m.sent_at,
        ct.name  AS contact_name,
        ct.phone AS contact_phone
      FROM messages m
      JOIN conversations cv ON cv.id = m.conversation_id
      JOIN contacts ct ON ct.id = cv.contact_id
      WHERE m.conversation_id = $1
      ORDER BY m.sent_at ASC
    `, [id]);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/stats
app.get('/api/stats', async (req, res) => {
  try {
    const { rows: [stats] } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM conversations)                           AS total_conversations,
        (SELECT COUNT(*) FROM conversations WHERE status = 'open')    AS open_conversations,
        (SELECT COUNT(*) FROM conversations WHERE status = 'pending') AS pending_conversations,
        (SELECT COUNT(*) FROM conversations WHERE status = 'closed')  AS closed_conversations,
        (SELECT COUNT(*) FROM messages WHERE direction = 'inbound')   AS total_inbound,
        (SELECT COUNT(*) FROM messages WHERE direction = 'outbound')  AS total_outbound,
        (SELECT COUNT(*) FROM contacts)                               AS total_contacts
    `);
    res.json(stats);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        c.*,
        (SELECT COUNT(*) FROM conversations WHERE contact_id = c.id) AS conversation_count,
        (SELECT MAX(last_message_at) FROM conversations WHERE contact_id = c.id) AS last_seen
      FROM contacts c
      ORDER BY c.name ASC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/bot-sessions — lista de sesiones del bot
app.get('/api/bot-sessions', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        session_id,
        COUNT(*)                                                            AS total_msgs,
        SUM(CASE WHEN message->>'type' = 'human' THEN 1 ELSE 0 END)       AS human_msgs,
        SUM(CASE WHEN message->>'type' = 'ai'    THEN 1 ELSE 0 END)       AS ai_msgs,
        SUM(CASE WHEN message->>'type' = 'ai'
              AND (message->>'content')::jsonb->>'action' = 'execute_post'
              THEN 1 ELSE 0 END) AS posts_ejecutados,
        MIN(id) AS first_id,
        MAX(id) AS last_id,
        (SELECT (message->>'content')::jsonb->>'conversational_response'
           FROM n8n_chat_histories h2
          WHERE h2.session_id = h.session_id
            AND h2.message->>'type' = 'ai'
            AND (h2.message->>'content')::jsonb->>'conversational_response' IS NOT NULL
          ORDER BY h2.id DESC LIMIT 1
        ) AS last_ai_response
      FROM n8n_chat_histories h
      GROUP BY session_id
      ORDER BY last_id DESC
    `);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/bot-sessions/:sessionId — mensajes de una sesión
app.get('/api/bot-sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { rows } = await pool.query(`
      SELECT
        id,
        session_id,
        message->>'type'                                    AS type,
        message->>'content'                                 AS raw_content,
        CASE
          WHEN message->>'type' = 'ai'
          THEN (message->>'content')::jsonb->>'conversational_response'
          ELSE NULL
        END AS conversational_response,
        CASE
          WHEN message->>'type' = 'ai'
          THEN (message->>'content')::jsonb->>'action'
          ELSE NULL
        END AS action,
        CASE
          WHEN message->>'type' = 'ai'
          THEN (message->>'content')::jsonb->>'whatsapp_message_type'
          ELSE NULL
        END AS whatsapp_message_type
      FROM n8n_chat_histories
      WHERE session_id = $1
      ORDER BY id ASC
    `, [sessionId]);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => console.log(`SmartPost API running on :${port}`));
