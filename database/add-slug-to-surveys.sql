-- ============================================================================
-- ADD SLUG COLUMN TO SURVEYS TABLE
-- ============================================================================
-- This script adds a slug column to the surveys table for URL-friendly paths
-- ============================================================================

-- 1. ADD SLUG COLUMN
-- ============================================================================
ALTER TABLE api.surveys ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2. CREATE INDEX FOR FAST LOOKUPS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_surveys_slug ON api.surveys(slug);

-- 3. UPDATE DEFAULT SURVEY WITH SLUG
-- ============================================================================
UPDATE api.surveys 
SET slug = 'navidad' 
WHERE id = '00000000-0000-0000-0000-000000000001'
  AND slug IS NULL;

-- 4. FUNCTION TO GENERATE SLUG FROM TITLE
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Convert title to lowercase slug
  base_slug := lower(trim(title));
  base_slug := regexp_replace(base_slug, '[áàä]', 'a', 'g');
  base_slug := regexp_replace(base_slug, '[éèë]', 'e', 'g');
  base_slug := regexp_replace(base_slug, '[íìï]', 'i', 'g');
  base_slug := regexp_replace(base_slug, '[óòö]', 'o', 'g');
  base_slug := regexp_replace(base_slug, '[úùü]', 'u', 'g');
  base_slug := regexp_replace(base_slug, 'ñ', 'n', 'g');
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := regexp_replace(base_slug, '^-|-$', '', 'g');
  
  -- Limit to 100 characters
  base_slug := substring(base_slug, 1, 100);
  
  -- Check if slug exists, if so add counter
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM api.surveys WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 5. TRIGGER TO AUTO-GENERATE SLUG ON INSERT
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON api.surveys;
CREATE TRIGGER trigger_auto_generate_slug
  BEFORE INSERT ON api.surveys
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();

-- 6. GENERATE SLUGS FOR EXISTING SURVEYS WITHOUT ONE
-- ============================================================================
DO $$
DECLARE
  survey_rec RECORD;
BEGIN
  FOR survey_rec IN 
    SELECT id, title FROM api.surveys WHERE slug IS NULL
  LOOP
    UPDATE api.surveys 
    SET slug = generate_slug(survey_rec.title)
    WHERE id = survey_rec.id;
  END LOOP;
END $$;

-- ============================================================================
-- MIGRATION COMPLETED
-- ============================================================================
-- Now surveys have:
-- 1. slug column (TEXT UNIQUE)
-- 2. Index for fast slug lookups
-- 3. Auto-generation function for new surveys
-- 4. Trigger to auto-generate slug on insert
-- 5. All existing surveys have slugs
-- ============================================================================
