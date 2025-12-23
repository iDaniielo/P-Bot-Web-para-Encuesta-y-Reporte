-- Add regalo_otro column to encuestas table
-- Execute this in Supabase SQL Editor: https://app.supabase.com/project/YOUR_PROJECT_ID/sql/new

-- For public schema
ALTER TABLE public.encuestas 
ADD COLUMN IF NOT EXISTS regalo_otro TEXT;

-- For api schema (if you're using it)
ALTER TABLE api.encuestas 
ADD COLUMN IF NOT EXISTS regalo_otro TEXT;

-- Verify the column was added
SELECT 'Column regalo_otro added successfully!' as status;
