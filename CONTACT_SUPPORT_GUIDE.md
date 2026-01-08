# Contact Support Feature - Implementation Guide

## Overview
This document describes the new contact support functionality added to the CEO Dashboard's FAQChat widget.

## Features Implemented

### 1. Database Schema
- **Table**: `support_requests`
  - `id`: UUID (primary key)
  - `name`: TEXT (required)
  - `email`: TEXT (required)
  - `phone`: TEXT (optional)
  - `message`: TEXT (required)
  - `status`: TEXT (default: 'pending', options: 'pending', 'in_progress', 'resolved')
  - `created_at`: TIMESTAMP (auto-generated)

- **Table**: `support_request_rate_limit`
  - Used for rate limiting (3 requests per user per 10 minutes)

### 2. API Endpoint
- **Path**: `/api/contact-support`
- **Method**: POST
- **Authentication**: Required (checks Supabase session)
- **Rate Limiting**: 3 requests per user per 10 minutes

#### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "5551234567",  // optional
  "message": "I need help with..."
}
```

#### Success Response (201)
```json
{
  "success": true,
  "message": "Solicitud enviada correctamente. Nos pondremos en contacto pronto.",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "5551234567",
    "message": "I need help with...",
    "status": "pending",
    "created_at": "2026-01-08T17:00:00Z"
  }
}
```

#### Error Responses
- **400**: Invalid data (validation errors)
- **401**: Not authenticated
- **429**: Rate limit exceeded
- **500**: Server error

### 3. FAQChat Component
Located at: `components/FAQChat.tsx`

**Features**:
- Floating chat button in bottom-right corner
- FAQ accordion with categories (General, Questions, Dashboard)
- Contact form with validation
- Loading states and error handling
- Success message with auto-close

## Setup Instructions

### 1. Database Migration
Run the migration to create the necessary tables:
```bash
supabase db push
```

Or apply the migration manually:
```bash
supabase migration apply
```

### 2. Environment Variables
Add to your `.env.local`:
```env
ADMIN_EMAIL=admin@yourdomain.com
```

This email will receive notifications when users submit support requests.

### 3. Email Integration (Optional)
The email notification is currently using console.log for testing. To integrate with an email service:

#### Option A: Resend (Recommended)
1. Install Resend: `npm install resend`
2. Get API key from https://resend.com
3. Update the `sendEmailNotification` function in `/app/api/contact-support/route.ts`:

```typescript
import { Resend } from 'resend';

async function sendEmailNotification(data: SupportRequestData) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.error('No admin email configured');
    return;
  }
  
  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: adminEmail,
    subject: 'Nueva solicitud de ayuda - Dashboard CEO',
    text: `
Nueva solicitud de ayuda recibida

Detalles:
- Nombre: ${data.name}
- Email: ${data.email}
${data.phone ? `- Teléfono: ${data.phone}` : ''}
- Mensaje: ${data.message}

Fecha: ${new Date().toLocaleString('es-MX')}
    `.trim(),
  });
}
```

#### Option B: SendGrid
Similar process with SendGrid's npm package.

## Testing

### Manual Testing
1. Navigate to the CEO Dashboard at `/dashboard`
2. Click the floating chat button (bottom-right)
3. Click "Contáctanos" at the bottom
4. Fill in the contact form:
   - Name: Required
   - Email: Required (must be valid email format)
   - Phone: Optional
   - Message: Required
5. Submit and verify:
   - Success message appears
   - Form clears
   - Chat closes after 2 seconds

### Testing Rate Limiting
1. Submit 3 support requests quickly
2. Try to submit a 4th request
3. Should see error: "Límite de solicitudes excedido. Por favor, espere 10 minutos antes de enviar otra solicitud."

### Verify Database
Check that requests are saved:
```sql
SELECT * FROM api.support_requests ORDER BY created_at DESC LIMIT 10;
```

### Verify Rate Limiting Table
```sql
SELECT * FROM api.support_request_rate_limit;
```

## Security Features

1. **Authentication**: Only authenticated users can submit requests
2. **Input Validation**: Zod schema validates all inputs
3. **Sanitization**: HTML entity encoding prevents XSS attacks
4. **Rate Limiting**: 3 requests per user per 10 minutes
5. **RLS Policies**: Database-level security on tables
6. **Error Handling**: No sensitive information exposed in error messages

## Monitoring

Monitor support requests in your dashboard:
```sql
-- View all pending requests
SELECT * FROM api.support_requests 
WHERE status = 'pending' 
ORDER BY created_at DESC;

-- Count requests by status
SELECT status, COUNT(*) as count 
FROM api.support_requests 
GROUP BY status;

-- Recent activity
SELECT 
  name, 
  email, 
  message, 
  created_at 
FROM api.support_requests 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## Maintenance

### Cleaning Old Rate Limit Data
The system automatically cleans up old rate limit entries (older than 10 minutes) when checking limits. No manual cleanup needed.

### Updating Support Request Status
```sql
UPDATE api.support_requests 
SET status = 'resolved' 
WHERE id = 'request-id-here';
```

## Troubleshooting

### "No autorizado" Error
- User must be logged in to submit requests
- Check Supabase session is valid

### "Límite de solicitudes excedido" Error
- User has submitted 3 requests in the last 10 minutes
- Wait 10 minutes or clear the rate limit:
```sql
DELETE FROM api.support_request_rate_limit WHERE user_id = 'user-id-here';
```

### Email Not Sending
- Check `ADMIN_EMAIL` is set in environment variables
- Check console logs for errors
- If using Resend/SendGrid, verify API key is correct

### Database Insert Error
- Verify migration was applied successfully
- Check RLS policies allow authenticated inserts
- Verify Supabase credentials are correct

## Future Enhancements

1. **Email Templates**: Use HTML email templates for better formatting
2. **Admin Dashboard**: Create a UI to view and manage support requests
3. **Auto-response**: Send confirmation email to user when request is received
4. **Attachments**: Allow users to upload files with their support requests
5. **Live Chat**: Integrate real-time chat functionality
6. **Webhooks**: Notify external systems when new requests arrive

## Related Files

- **Migration**: `/supabase/migrations/20260108170000_support_requests.sql`
- **API Route**: `/app/api/contact-support/route.ts`
- **Component**: `/components/FAQChat.tsx`
- **Types**: `/types/database.ts`
- **Config**: `.env.example`
