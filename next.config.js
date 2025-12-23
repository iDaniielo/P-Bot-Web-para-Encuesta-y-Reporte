/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // Disable ESLint during builds (solo para desarrollo rápido)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Security Headers Configuration
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            // Prevent clickjacking attacks by disallowing iframe embedding
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Prevent MIME type sniffing
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Content Security Policy - XSS Protection
            // NOTE: 'unsafe-eval' is required for Next.js dev mode and runtime features.
            // For production, consider:
            // 1. Using Next.js build with 'output: "standalone"' (already configured)
            // 2. Implementing nonces for inline scripts (advanced)
            // 3. Moving to Next.js Edge Runtime where possible
            // Current config balances security with Next.js compatibility
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          {
            // Control how much referrer information is sent
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Disable browser features and APIs that aren't needed
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            // Enable XSS filter in browsers (legacy support)
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            // Disable DNS prefetching for better privacy
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
          // Strict Transport Security - Force HTTPS (only in production)
          // Uncomment when deploying to production with HTTPS:
          // {
          //   key: 'Strict-Transport-Security',
          //   value: 'max-age=63072000; includeSubDomains; preload',
          // },
        ],
      },
    ];
  },
}

module.exports = nextConfig
