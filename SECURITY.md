# 🔒 Security Guide - Survey Bot & Dashboard

This document provides comprehensive security guidelines for the Survey Bot & Dashboard application built with Next.js 15, React 19, and Supabase.

## 📋 Table of Contents

1. [Security Overview](#security-overview)
2. [Repository Hygiene](#repository-hygiene)
3. [Dependency Security](#dependency-security)
4. [Application Security](#application-security)
5. [Supabase Security (RLS)](#supabase-security-rls)
6. [Common Vulnerabilities](#common-vulnerabilities)
7. [Security Checklist](#security-checklist)
8. [Incident Response](#incident-response)

---

## 🛡️ Security Overview

This application implements multiple layers of security:

- **Transport Layer**: HTTPS/TLS encryption (enforced in production)
- **Application Layer**: Security headers, input validation, XSS protection
- **Data Layer**: Row Level Security (RLS), encrypted connections
- **Authentication**: Supabase Auth (for admin dashboard)

---

## 🧹 Repository Hygiene

### .gitignore Configuration

A robust `.gitignore` file has been configured to prevent sensitive data from being committed:

```bash
# Critical files that MUST NEVER be committed:
- .env, .env.local, .env.production
- *.pem, *.key, *.cert (certificates and keys)
- .vercel (Vercel deployment config)
- .supabase (local Supabase config)
```

### Files to Delete Before Commit

Before pushing to GitHub, manually review and delete:

1. **Temporary files**: `*.tmp`, `*.bak`, `*~`
2. **Unused components**: Check `/components` for unused React components
3. **Test files**: Remove any `test.js`, `example.tsx`, or placeholder files
4. **Old documentation**: Remove outdated docs or merge them
5. **System files**: `.DS_Store` (macOS), `Thumbs.db` (Windows)
6. **Build artifacts**: Ensure `.next/`, `out/`, and `dist/` are ignored

**Command to find junk files:**
```bash
# Find temporary files
find . -type f \( -name "*.tmp" -o -name "*.bak" -o -name "*~" \) | grep -v node_modules

# Find unused images (manually verify before deleting)
find . -name "*.png" -o -name "*.jpg" | grep placeholder

# Find TODO or FIXME comments that need addressing
grep -r "TODO\|FIXME" --include="*.ts" --include="*.tsx" .
```

---

## 🔐 Dependency Security

### Running Security Audits

This project uses npm for dependency management. Regular security audits are essential.

#### 1. Check for Vulnerabilities

```bash
# Run npm audit (included in package.json as a script)
npm audit

# Show detailed report
npm audit --json

# Check for high severity only
npm audit --audit-level=high
```

**Current Status**: ✅ No vulnerabilities found (as of last check)

#### 2. Fix Vulnerabilities

```bash
# Automatically fix vulnerabilities
npm audit fix

# Fix with breaking changes (careful!)
npm audit fix --force

# Update specific package
npm update package-name
```

#### 3. Common Vulnerabilities in Next.js/React

##### Prototype Pollution
- **What**: Attackers can inject properties into JavaScript object prototypes
- **How to prevent**: 
  - Avoid using user input in object keys directly
  - Use `Object.create(null)` for maps
  - Validate and sanitize all user inputs

```typescript
// ❌ BAD - Vulnerable to prototype pollution
const obj = {};
obj[userInput] = value;

// ✅ GOOD - Safe approach
const obj = Object.create(null);
if (allowedKeys.includes(userInput)) {
  obj[userInput] = value;
}
```

##### XSS (Cross-Site Scripting)
- **What**: Injection of malicious scripts into web pages
- **How to prevent**:
  - React automatically escapes JSX values (built-in protection)
  - Never use `dangerouslySetInnerHTML` with user input
  - Validate and sanitize all form inputs
  - Use Content Security Policy headers (already configured)

```typescript
// ❌ BAD - XSS vulnerable
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ GOOD - React auto-escapes
<div>{userInput}</div>

// ✅ GOOD - Sanitize if you must use HTML
import DOMPurify from 'isomorphic-dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

##### CSRF (Cross-Site Request Forgery)
- **What**: Unauthorized commands transmitted from a user the web application trusts
- **How to prevent**:
  - Next.js API routes are protected by default
  - Use SameSite cookies
  - Implement CSRF tokens for sensitive operations

---

## 🔒 Application Security

### Security Headers (next.config.js)

The following security headers have been configured in `next.config.js`:

#### 1. X-Frame-Options: DENY
- **Purpose**: Prevents clickjacking attacks
- **Effect**: Page cannot be embedded in `<iframe>`, `<frame>`, or `<object>`

#### 2. Content-Security-Policy (CSP)
- **Purpose**: Prevents XSS, injection attacks, and data exfiltration
- **Configuration**:
  ```
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  ```

**Note**: `unsafe-inline` and `unsafe-eval` are required for Next.js runtime. For maximum security, consider implementing nonces or hashes in production.

#### 3. X-Content-Type-Options: nosniff
- **Purpose**: Prevents MIME type sniffing
- **Effect**: Browsers will not try to guess content types

#### 4. Referrer-Policy: strict-origin-when-cross-origin
- **Purpose**: Controls referrer information
- **Effect**: Full URL sent to same origin, only origin sent cross-origin

#### 5. Permissions-Policy
- **Purpose**: Disable unnecessary browser features
- **Disabled**: camera, microphone, geolocation, interest-cohort

#### 6. X-XSS-Protection: 1; mode=block
- **Purpose**: Legacy XSS filter for older browsers
- **Effect**: Block rendering if attack detected

#### 7. Strict-Transport-Security (Production Only)
- **Purpose**: Force HTTPS connections
- **Configuration**: `max-age=63072000; includeSubDomains; preload`
- **Note**: Only enable when deploying with HTTPS

### Input Validation

All form inputs should be validated using Zod schemas:

```typescript
import { z } from 'zod';

// Example: Survey form validation
const surveySchema = z.object({
  nombre: z.string().min(2).max(100).regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
  telefono: z.string().regex(/^[0-9]{10}$/),
  regalo: z.enum(['Juguetes', 'Ropa', 'Electrónicos', 'Libros', 'Perfumes']),
  lugar_compra: z.string().min(1),
  gasto: z.string().min(1),
});

// Validate before submitting
const result = surveySchema.safeParse(formData);
if (!result.success) {
  // Handle validation errors
  console.error(result.error);
}
```

### Environment Variables

**✅ Current Configuration**: All secrets are properly stored in environment variables

```typescript
// lib/supabase.ts - ✅ GOOD
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
```

**❌ NEVER DO THIS**:
```typescript
// ❌ BAD - Hardcoded secrets
const supabaseUrl = 'https://xxxxx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1...';
```

**Environment Variable Naming**:
- `NEXT_PUBLIC_*`: Exposed to browser (use for public data only)
- Without `NEXT_PUBLIC_`: Server-side only (use for secrets)

**Required Environment Variables**:
```bash
# .env.local (never commit this file)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For admin operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Server-side only!
```

---

## 🗄️ Supabase Security (RLS)

### Row Level Security (RLS) Overview

RLS policies have been implemented to secure the database:

1. **Public Insert Policy**: Anonymous users can submit surveys
2. **Admin Read Policy**: Only authenticated users can view dashboard data
3. **No Update/Delete**: Ensures data integrity and audit trail

### Applying Secure RLS Policies

**File**: `database/rls-policies-secure.sql`

#### Step-by-Step Implementation:

1. **Go to Supabase Dashboard**
   - Navigate to your project: https://app.supabase.com
   - Go to: SQL Editor

2. **Run the RLS Policies Script**
   ```sql
   -- Copy entire content from database/rls-policies-secure.sql
   -- Paste in SQL Editor
   -- Click "Run"
   ```

3. **Verify Policies Are Active**
   ```sql
   -- Check active policies
   SELECT schemaname, tablename, policyname, permissive, roles, cmd
   FROM pg_policies
   WHERE tablename = 'encuestas';
   ```

### Policy Details

#### Policy 1: Public Insert Only
```sql
CREATE POLICY "Public can insert survey responses"
ON public.encuestas
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
```
- **Who**: Anonymous and authenticated users
- **What**: Can insert new survey responses
- **Why**: Allows public survey submissions

#### Policy 2: Admin Read Only
```sql
CREATE POLICY "Only authenticated users can read all responses"
ON public.encuestas
FOR SELECT
TO authenticated
USING (true);
```
- **Who**: Only authenticated users
- **What**: Can read all survey responses
- **Why**: Protects user privacy, CEO dashboard access only

### Implementing Admin Authentication

To secure the dashboard, implement authentication:

```typescript
// app/dashboard/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  // Check admin role
  const userRole = session.user.user_metadata?.role;
  if (userRole !== 'admin') {
    redirect('/unauthorized');
  }
  
  // Fetch data (RLS will enforce access control)
  const { data, error } = await supabase
    .from('encuestas')
    .select('*')
    .order('created_at', { ascending: false });
  
  return <DashboardComponent data={data} />;
}
```

### Setting Up Admin User

```sql
-- Update user metadata to add admin role
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'ceo@company.com';
```

Or use Supabase Dashboard:
1. Go to: Authentication > Users
2. Click on the user
3. Edit User Metadata
4. Add: `{ "role": "admin" }`

---

## 🚨 Common Vulnerabilities

### 1. SQL Injection
**Status**: ✅ Protected by Supabase (uses parameterized queries)

```typescript
// ✅ GOOD - Supabase handles parameterization
const { data } = await supabase
  .from('encuestas')
  .select('*')
  .eq('nombre', userInput);

// ❌ BAD - Never do raw SQL with user input
// await supabase.rpc('unsafe_query', { query: `SELECT * FROM encuestas WHERE nombre = '${userInput}'` });
```

### 2. Broken Authentication
**Risk**: Unauthorized access to CEO dashboard

**Mitigation**:
- Implement Supabase Auth
- Use session-based authentication
- Enable MFA for admin accounts
- Implement session timeout
- Log all authentication attempts

### 3. Sensitive Data Exposure
**Risk**: Phone numbers and personal data in database

**Mitigation**:
- ✅ RLS policies implemented
- ✅ Environment variables for secrets
- Consider encrypting phone numbers at rest
- Implement data retention policies
- Use HTTPS in production (Vercel enforces this)

### 4. Insufficient Logging & Monitoring
**Recommendation**: Implement audit logging (see `rls-policies-secure.sql` for example)

```sql
-- Track all access to encuestas table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT now(),
  user_id UUID,
  action TEXT,
  table_name TEXT,
  record_id UUID
);
```

### 5. Rate Limiting
**Status**: ⚠️ Not implemented (recommended for production)

**Implementation Options**:
- Use Vercel's built-in rate limiting
- Implement API route rate limiting with middleware
- Use Supabase Edge Functions
- See `rls-policies-secure.sql` for database-level approach

---

## ✅ Security Checklist

Before deploying to production, ensure:

### Pre-Deployment
- [ ] Run `npm audit` and fix all vulnerabilities
- [ ] Verify no secrets in code (`git log -p | grep -i "api[_-]key\|secret\|password"`)
- [ ] Check `.gitignore` is comprehensive
- [ ] Review and delete temporary/test files
- [ ] Verify environment variables are set
- [ ] Test security headers (use securityheaders.com after deployment)

### Supabase Configuration
- [ ] Apply RLS policies from `database/rls-policies-secure.sql`
- [ ] Enable MFA for admin accounts
- [ ] Verify RLS is enabled: `ALTER TABLE encuestas ENABLE ROW LEVEL SECURITY;`
- [ ] Test anonymous insert (should work)
- [ ] Test anonymous select (should fail)
- [ ] Set up admin user with proper role

### Application Security
- [ ] Validate all form inputs with Zod
- [ ] Implement authentication for dashboard
- [ ] Add CSRF protection for sensitive operations
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set up monitoring and alerting
- [ ] Implement rate limiting
- [ ] Add audit logging

### Testing
- [ ] Test XSS by entering `<script>alert('XSS')</script>` in forms
- [ ] Test SQL injection by entering `' OR '1'='1` in forms
- [ ] Verify security headers with browser dev tools
- [ ] Test authentication flow
- [ ] Verify RLS policies block unauthorized access

---

## 🆘 Incident Response

If you discover a security vulnerability:

1. **Do NOT commit sensitive data to Git**
   ```bash
   # If you accidentally committed secrets:
   # 1. Revoke the compromised credentials immediately
   # 2. Use git-filter-repo to remove from history (not git reset)
   # 3. Force push (if repo is private and you're sure)
   # 4. For public repos, consider the repo compromised - create new credentials
   ```

2. **Rotate Compromised Credentials**
   - Generate new Supabase API keys
   - Update environment variables in Vercel
   - Update `.env.local` for local development

3. **Assess Impact**
   - Check Supabase logs for unauthorized access
   - Review authentication logs
   - Check for data exfiltration

4. **Notify Stakeholders**
   - Inform team members
   - If user data was exposed, follow data breach notification requirements

---

## 📚 Additional Resources

- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Vercel Security](https://vercel.com/docs/security/deployment-security)

---

## 🔄 Regular Maintenance

Perform these security checks regularly:

- **Weekly**: Run `npm audit`
- **Monthly**: Review and update dependencies
- **Quarterly**: Review RLS policies and authentication logs
- **Annually**: Conduct full security audit

---

**Last Updated**: 2024-12-23  
**Version**: 1.0.0  
**Maintainer**: Security Team

