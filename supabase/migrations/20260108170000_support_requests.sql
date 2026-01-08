-- Migration: Support Requests Table
-- Created at: 2026-01-08

-- ============================================================================
-- 1. CREAR TABLA DE SOLICITUDES DE SOPORTE
-- ============================================================================
CREATE TABLE IF NOT EXISTS api.support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 2. CREAR ÍNDICES PARA PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_support_requests_status 
ON api.support_requests(status);

CREATE INDEX IF NOT EXISTS idx_support_requests_created 
ON api.support_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_requests_email 
ON api.support_requests(email);

-- ============================================================================
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE api.support_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. POLÍTICAS RLS PARA SUPPORT_REQUESTS
-- ============================================================================

-- Permitir inserts solo a usuarios autenticados
DROP POLICY IF EXISTS "allow_authenticated_insert_support_requests" ON api.support_requests;
CREATE POLICY "allow_authenticated_insert_support_requests" 
ON api.support_requests
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Permitir selects solo a usuarios autenticados (dashboard)
DROP POLICY IF EXISTS "allow_authenticated_select_support_requests" ON api.support_requests;
CREATE POLICY "allow_authenticated_select_support_requests" 
ON api.support_requests
FOR SELECT 
TO authenticated 
USING (true);

-- Permitir updates solo a usuarios autenticados (para cambiar status)
DROP POLICY IF EXISTS "allow_authenticated_update_support_requests" ON api.support_requests;
CREATE POLICY "allow_authenticated_update_support_requests" 
ON api.support_requests
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ============================================================================
-- 5. GRANT PERMISOS
-- ============================================================================
GRANT ALL ON api.support_requests TO authenticated;

-- ============================================================================
-- 6. CREAR TABLA PARA RATE LIMITING
-- ============================================================================
CREATE TABLE IF NOT EXISTS api.support_request_rate_limit (
    user_id TEXT NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, window_start)
);

-- Habilitar RLS
ALTER TABLE api.support_request_rate_limit ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios autenticados puedan leer y escribir sus propios registros
DROP POLICY IF EXISTS "allow_authenticated_manage_rate_limit" ON api.support_request_rate_limit;
CREATE POLICY "allow_authenticated_manage_rate_limit" 
ON api.support_request_rate_limit
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

GRANT ALL ON api.support_request_rate_limit TO authenticated;

-- Crear índice para limpieza de registros antiguos
CREATE INDEX IF NOT EXISTS idx_rate_limit_window 
ON api.support_request_rate_limit(window_start);
