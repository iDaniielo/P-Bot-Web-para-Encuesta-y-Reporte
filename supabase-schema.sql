-- NavidadSurvey Database Schema
-- This script creates the necessary table for storing survey responses

-- Create the encuestas table
CREATE TABLE IF NOT EXISTS public.encuestas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    regalo TEXT NOT NULL,
    lugar_compra TEXT NOT NULL,
    gasto TEXT NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.encuestas ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for survey submissions)
CREATE POLICY "Allow public inserts" ON public.encuestas
    FOR INSERT
    WITH CHECK (true);

-- Create policy to allow authenticated reads (for dashboard)
-- ⚠️ SECURITY NOTE: This policy allows public reads for demonstration purposes.
-- For production, you should:
-- 1. Implement proper authentication (Supabase Auth, NextAuth.js, etc.)
-- 2. Restrict reads to authenticated users only
-- 3. Consider adding user roles and permissions
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
CREATE INDEX IF NOT EXISTS idx_encuestas_gasto ON public.encuestas(gasto);

-- Optional: Insert sample data for testing
-- Uncomment the following lines to add test data
/*
INSERT INTO public.encuestas (nombre, telefono, regalo, lugar_compra, gasto) VALUES
    ('Juan Pérez', '555-0101', 'Juguetes', 'Amazon', '$50-$100'),
    ('María García', '555-0102', 'Ropa', 'Centro Comercial', '$100-$200'),
    ('Carlos López', '555-0103', 'Electrónicos', 'Tienda Online', '$200-$500'),
    ('Ana Martínez', '555-0104', 'Libros', 'Librería Local', 'Menos de $50'),
    ('Luis Rodríguez', '555-0105', 'Perfumes', 'Departamental', '$50-$100');
*/
