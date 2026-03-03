-- SmartPost - Tabla de publicaciones programadas

CREATE TABLE IF NOT EXISTS scheduled_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wa_id VARCHAR(50) NOT NULL,
    phone_number_id VARCHAR(50) NOT NULL,
    platform VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT, -- Puede ser NULL si es solo texto
    publish_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PUBLISHED', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice parcial para que el CRON busque solo posts pendientes sin escanear toda la tabla
CREATE INDEX IF NOT EXISTS idx_pending_posts ON scheduled_posts (publish_at) WHERE status = 'PENDING';
