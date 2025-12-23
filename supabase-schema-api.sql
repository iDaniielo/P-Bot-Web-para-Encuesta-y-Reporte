-- NavidadSurvey Database Schema for API schema
-- Execute this in Supabase SQL Editor: https://app.supabase.com/project/ykhrhzckfklnoakldncq/sql/new

-- Create the encuestas table in the api schema
CREATE TABLE IF NOT EXISTS api.encuestas (
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
ALTER TABLE api.encuestas ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for survey submissions)
CREATE POLICY "Allow public inserts" ON api.encuestas
    FOR INSERT
    WITH CHECK (true);

-- Create policy to allow public reads (for dashboard)
CREATE POLICY "Allow public reads" ON api.encuestas
    FOR SELECT
    USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_encuestas_created_at ON api.encuestas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_encuestas_lugar_compra ON api.encuestas(lugar_compra);
CREATE INDEX IF NOT EXISTS idx_encuestas_regalo ON api.encuestas(regalo);

-- Verify the table was created
SELECT 'Table created successfully!' as status;
