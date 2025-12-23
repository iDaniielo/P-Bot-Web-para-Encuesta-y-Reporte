-- NavidadSurvey Database Schema
-- This script creates the necessary table for storing survey responses

-- Create the encuestas table
CREATE TABLE IF NOT EXISTS public.encuestas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    regalo TEXT NOT NULL,
    regalo_otro TEXT,
    lugar_compra TEXT NOT NULL,
    gasto TEXT NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.encuestas ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for survey submissions)
CREATE POLICY "Allow public inserts" ON public.encuestas
    FOR INSERT
    WITH CHECK (true);

-- Create policy to allow public reads (for dashboard)
-- ⚠️ SECURITY NOTE: This policy allows public reads for demonstration purposes.
-- For production, you should:
-- 1. Implement proper authentication (Supabase Auth, NextAuth.js, etc.)
-- 2. Restrict reads to authenticated users only
-- 3. Consider adding user roles and permissions
-- 4. Enable 2FA for dashboard access
-- 5. Implement rate limiting
-- 6. Add audit logging
-- 7. Use encryption at rest for sensitive data (phone numbers)
-- 8. Implement strict RLS policies based on user roles
-- Example for authenticated-only reads:
-- CREATE POLICY "Allow authenticated reads" ON public.encuestas
--     FOR SELECT
--     USING (auth.role() = 'authenticated');
CREATE POLICY "Allow public reads" ON public.encuestas
    FOR SELECT
    USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_encuestas_created_at ON public.encuestas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_encuestas_lugar_compra ON public.encuestas(lugar_compra);
CREATE INDEX IF NOT EXISTS idx_encuestas_regalo ON public.encuestas(regalo);

-- Optional: Insert sample data for testing
-- Uncomment the following lines to add test data
/*
INSERT INTO public.encuestas (nombre, telefono, regalo, lugar_compra, gasto) VALUES
    ('Juan Pérez', '5551234567', 'Juguetes', 'Tienda Online (Amazon, MercadoLibre, etc.)', '$500-$1000'),
    ('María García', '5559876543', 'Ropa', 'Centro Comercial', '$1000-$2000'),
    ('Carlos López', '5556547890', 'Electrónicos', 'Tienda Online (Amazon, MercadoLibre, etc.)', '$2000-$5000'),
    ('Ana Martínez', '5553216549', 'Libros', 'Tienda Local', 'Menos de $500'),
    ('Luis Rodríguez', '5558529637', 'Perfumes', 'Tienda Departamental', '$500-$1000');
*/
