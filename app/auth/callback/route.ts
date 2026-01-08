import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Intercambiar el código por una sesión
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirigir al usuario autenticado
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Si hay error o no hay código, redirigir a login
  return NextResponse.redirect(new URL('/login?error=auth_error', request.url));
}
