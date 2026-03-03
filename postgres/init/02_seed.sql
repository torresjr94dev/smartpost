-- SmartPost Demo Data

INSERT INTO contacts (phone, name, is_business) VALUES
('+1 555 100 0001', 'María García',    false),
('+1 555 100 0002', 'Carlos López',    false),
('+1 555 100 0003', 'Sofía Martínez',  false),
('+1 555 100 0004', 'TechStore MX',    true),
('+1 555 100 0005', 'Ana Rodríguez',   false),
('+1 555 100 0006', 'Luis Hernández',  false),
('+1 555 100 0007', 'Café Central',    true),
('+1 555 100 0008', 'Pedro Sánchez',   false);

INSERT INTO conversations (contact_id, last_message, last_message_at, unread_count, status) VALUES
(1, 'Muchas gracias por su atención!',     NOW() - INTERVAL '5 minutes',  2, 'open'),
(2, 'Quisiera información sobre el producto', NOW() - INTERVAL '1 hour',   0, 'open'),
(3, 'Perfecto, quedamos así entonces.',    NOW() - INTERVAL '3 hours',   0, 'closed'),
(4, 'Su pedido ha sido confirmado ✅',     NOW() - INTERVAL '6 hours',   1, 'open'),
(5, 'Hola, ¿están disponibles hoy?',      NOW() - INTERVAL '1 day',     3, 'pending'),
(6, 'Ok muchas gracias!',                  NOW() - INTERVAL '2 days',    0, 'closed'),
(7, 'Reserva para 4 personas confirmada', NOW() - INTERVAL '3 days',    0, 'closed'),
(8, 'Nos comunicamos pronto.',             NOW() - INTERVAL '5 days',    0, 'open');

-- Conversación 1 - María García
INSERT INTO messages (conversation_id, contact_id, direction, type, content, status, sent_at) VALUES
(1, 1, 'inbound',  'text', 'Hola, buenos días! Tengo una consulta sobre mi pedido.', 'read',      NOW() - INTERVAL '30 minutes'),
(1, 1, 'outbound', 'text', 'Buenos días María! Con gusto te ayudo. ¿Cuál es tu número de pedido?', 'read', NOW() - INTERVAL '28 minutes'),
(1, 1, 'inbound',  'text', 'Es el #ORD-2024-1892', 'read',                                         NOW() - INTERVAL '25 minutes'),
(1, 1, 'outbound', 'text', 'Perfecto, tu pedido está en camino. Llegará hoy entre 2pm y 6pm 📦', 'read', NOW() - INTERVAL '22 minutes'),
(1, 1, 'inbound',  'text', '¡Excelente! ¿Puedo cambiar la dirección de entrega?', 'delivered',   NOW() - INTERVAL '10 minutes'),
(1, 1, 'inbound',  'text', 'Muchas gracias por su atención!', 'delivered',                        NOW() - INTERVAL '5 minutes');

-- Conversación 2 - Carlos López
INSERT INTO messages (conversation_id, contact_id, direction, type, content, status, sent_at) VALUES
(2, 2, 'inbound',  'text', 'Buenas tardes, vi su anuncio en redes sociales.', 'read',     NOW() - INTERVAL '2 hours'),
(2, 2, 'outbound', 'text', 'Hola Carlos! Bienvenido. ¿En qué producto estás interesado?', 'read', NOW() - INTERVAL '1 hour 50 minutes'),
(2, 2, 'inbound',  'text', 'Quisiera información sobre el producto premium que ofrecen.', 'read', NOW() - INTERVAL '1 hour');

-- Conversación 3 - Sofía Martínez
INSERT INTO messages (conversation_id, contact_id, direction, type, content, status, sent_at) VALUES
(3, 3, 'inbound',  'text', 'Hola! Quería confirmar nuestra reunión de mañana.', 'read',           NOW() - INTERVAL '4 hours'),
(3, 3, 'outbound', 'text', 'Claro Sofía, confirmado para mañana a las 10am. Te enviaré el link de videollamada.', 'read', NOW() - INTERVAL '3 hours 30 minutes'),
(3, 3, 'inbound',  'text', 'Perfecto, quedamos así entonces.', 'read',                            NOW() - INTERVAL '3 hours');

-- Conversación 4 - TechStore MX
INSERT INTO messages (conversation_id, contact_id, direction, type, content, status, sent_at) VALUES
(4, 4, 'inbound',  'text', 'Estimados, adjuntamos orden de compra #PO-2024-445', 'read',         NOW() - INTERVAL '7 hours'),
(4, 4, 'outbound', 'text', 'Recibido. Procesaremos su orden en un plazo de 24 horas hábiles.', 'read', NOW() - INTERVAL '6 hours 30 minutes'),
(4, 4, 'inbound',  'text', 'Su pedido ha sido confirmado ✅', 'delivered',                        NOW() - INTERVAL '6 hours');

-- Conversación 5 - Ana Rodríguez
INSERT INTO messages (conversation_id, contact_id, direction, type, content, status, sent_at) VALUES
(5, 5, 'inbound',  'text', 'Hola, ¿están disponibles hoy?', 'delivered', NOW() - INTERVAL '1 day'),
(5, 5, 'inbound',  'text', '¿Me pueden confirmar el horario?', 'delivered', NOW() - INTERVAL '23 hours'),
(5, 5, 'inbound',  'text', 'Es urgente, necesito respuesta pronto 🙏', 'delivered', NOW() - INTERVAL '22 hours');
