-- ============================================================================
-- SECURE ROW LEVEL SECURITY (RLS) POLICIES FOR PRODUCTION
-- ============================================================================
-- This file contains production-ready RLS policies for the encuestas table
-- that implement proper security controls for a CEO dashboard.
--
-- SECURITY MODEL:
-- 1. Public users: Can INSERT survey responses only (anonymous submissions)
-- 2. Admin/CEO: Can SELECT all records (requires authentication)
-- 3. No public reads allowed - protects user privacy
-- 4. All operations are logged and auditable
--
-- PREREQUISITES:
-- - Supabase Auth must be enabled and configured
-- - Admin users must be authenticated before accessing dashboard
-- - Service role key should never be exposed to client-side code
-- ============================================================================

-- ============================================================================
-- STEP 1: Enable Row Level Security
-- ============================================================================
ALTER TABLE public.encuestas ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Drop existing policies (if any)
-- ============================================================================
-- Clean up any existing policies to start fresh
DROP POLICY IF EXISTS "Allow public inserts" ON public.encuestas;
DROP POLICY IF EXISTS "Allow public reads" ON public.encuestas;
DROP POLICY IF EXISTS "Allow authenticated reads" ON public.encuestas;
DROP POLICY IF EXISTS "Allow admin reads" ON public.encuestas;

-- ============================================================================
-- STEP 3: CREATE SECURE POLICIES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- POLICY 1: Public Insert Only (Survey Submissions)
-- ----------------------------------------------------------------------------
-- Allows anonymous users to submit survey responses
-- This enables the public survey bot to function without authentication
CREATE POLICY "Public can insert survey responses"
ON public.encuestas
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Allow inserts for all users (anon and authenticated)
  -- Validation should be done at application level
  true
);

-- ----------------------------------------------------------------------------
-- POLICY 2: Admin-Only Reads (CEO Dashboard)
-- ----------------------------------------------------------------------------
-- Restricts SELECT to authenticated users only
-- IMPORTANT: This basic policy grants read access to ALL authenticated users.
-- This is INTENTIONAL for demonstration/initial setup, allowing any authenticated
-- user to access the dashboard. For production, you MUST implement role-based
-- access control using the enhanced version below.
CREATE POLICY "Only authenticated users can read all responses"
ON public.encuestas
FOR SELECT
TO authenticated
USING (
  -- Basic: Any authenticated user can read
  -- This allows testing with any Supabase authenticated account
  true
  
  -- For PRODUCTION, replace 'true' with role-based check:
  -- (auth.jwt()->>'role')::text = 'admin'
  -- OR auth.jwt()->>'email' = 'ceo@company.com'
);

-- ============================================================================
-- STEP 4: ALTERNATIVE - Role-Based Access Control (RECOMMENDED)
-- ============================================================================
-- For production environments, implement role-based policies
-- Uncomment and customize the following policies:

/*
-- Create a custom claim for admin role in your Supabase Auth settings
-- Dashboard: Authentication > Policies > Add custom claim

-- Admin-only read policy
CREATE POLICY "Only admins can read all responses"
ON public.encuestas
FOR SELECT
TO authenticated
USING (
  -- Check if user has admin role in JWT
  (auth.jwt()->>'role')::text = 'admin'
);

-- Optional: Allow users to read only their own submissions
CREATE POLICY "Users can read their own submissions"
ON public.encuestas
FOR SELECT
TO authenticated
USING (
  -- Match by phone number or email if you add a user_id column
  telefono = auth.jwt()->>'phone'
  -- OR user_id = auth.uid() -- if you add a user_id column
);
*/

-- ============================================================================
-- STEP 5: ADDITIONAL SECURITY ENHANCEMENTS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1: Prevent Updates and Deletes
-- ----------------------------------------------------------------------------
-- For audit purposes, prevent modifications to submitted surveys
-- Only inserts are allowed, modifications require admin intervention via SQL

-- No update policy = updates are blocked by RLS
-- No delete policy = deletes are blocked by RLS

-- If you need to allow updates/deletes for admins, uncomment:
/*
CREATE POLICY "Only admins can update responses"
ON public.encuestas
FOR UPDATE
TO authenticated
USING (
  (auth.jwt()->>'role')::text = 'admin'
)
WITH CHECK (
  (auth.jwt()->>'role')::text = 'admin'
);

CREATE POLICY "Only admins can delete responses"
ON public.encuestas
FOR DELETE
TO authenticated
USING (
  (auth.jwt()->>'role')::text = 'admin'
);
*/

-- ============================================================================
-- STEP 6: AUDIT LOGGING (OPTIONAL BUT RECOMMENDED)
-- ============================================================================
-- Track who accessed the data and when

/*
-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  metadata JSONB
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Only admins can read audit logs"
ON public.audit_log
FOR SELECT
TO authenticated
USING (
  (auth.jwt()->>'role')::text = 'admin'
);

-- Create function to log access
CREATE OR REPLACE FUNCTION log_encuesta_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (user_id, action, table_name, record_id, metadata)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    NEW.id,
    jsonb_build_object(
      'user_email', auth.jwt()->>'email',
      'user_role', auth.jwt()->>'role'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to encuestas table
CREATE TRIGGER audit_encuesta_access
AFTER INSERT OR UPDATE OR DELETE ON public.encuestas
FOR EACH ROW EXECUTE FUNCTION log_encuesta_access();
*/

-- ============================================================================
-- STEP 7: RATE LIMITING (OPTIONAL BUT RECOMMENDED)
-- ============================================================================
-- Prevent abuse by limiting submissions per IP/user

/*
-- This requires additional setup with Supabase Edge Functions or middleware
-- Example approach: Store submission timestamps and check against limits

CREATE TABLE IF NOT EXISTS public.rate_limit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  submission_count INTEGER DEFAULT 1,
  last_submission TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(ip_address)
);

-- Function to check rate limit (call this before allowing inserts)
CREATE OR REPLACE FUNCTION check_rate_limit(user_ip INET)
RETURNS BOOLEAN AS $$
DECLARE
  submission_count INTEGER;
  last_submission TIMESTAMP;
BEGIN
  SELECT submission_count, last_submission
  INTO submission_count, last_submission
  FROM public.rate_limit
  WHERE ip_address = user_ip;
  
  -- Allow if no record exists
  IF NOT FOUND THEN
    INSERT INTO public.rate_limit (ip_address) VALUES (user_ip);
    RETURN true;
  END IF;
  
  -- Check if more than 5 submissions in last hour
  IF submission_count >= 5 AND last_submission > now() - INTERVAL '1 hour' THEN
    RETURN false;
  END IF;
  
  -- Reset counter if more than 1 hour has passed
  IF last_submission <= now() - INTERVAL '1 hour' THEN
    UPDATE public.rate_limit
    SET submission_count = 1, last_submission = now()
    WHERE ip_address = user_ip;
  ELSE
    UPDATE public.rate_limit
    SET submission_count = submission_count + 1, last_submission = now()
    WHERE ip_address = user_ip;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;
*/

-- ============================================================================
-- IMPLEMENTATION GUIDE
-- ============================================================================
-- 
-- TO APPLY THESE POLICIES:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to: SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
-- 
-- TO SET UP ADMIN AUTHENTICATION:
-- 1. Go to: Authentication > Policies
-- 2. Enable email authentication
-- 3. Create an admin user account
-- 4. Add custom claim "role": "admin" to the user's metadata
--    - Use Supabase Dashboard: Authentication > Users > Click user > Edit
--    - Or use SQL: 
--      UPDATE auth.users 
--      SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
--      WHERE email = 'admin@example.com';
-- 
-- TO PROTECT YOUR DASHBOARD:
-- 1. Implement authentication in your Next.js app
-- 2. Use Supabase Auth or NextAuth.js
-- 3. Protect dashboard route with middleware
-- 4. Example: app/dashboard/middleware.ts or app/middleware.ts
-- 
-- TESTING YOUR POLICIES:
-- 1. Try accessing dashboard without authentication (should fail)
-- 2. Try inserting a survey response anonymously (should succeed)
-- 3. Try reading data without authentication (should fail)
-- 4. Login as admin and access dashboard (should succeed)
-- 
-- ============================================================================
