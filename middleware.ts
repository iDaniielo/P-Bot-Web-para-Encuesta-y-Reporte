import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/encuesta', '/login', '/signup', '/'];

  // Si la ruta es pública, permitir el acceso
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Si es el dashboard, verificar autenticación
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('sb-access-token')?.value;

    if (!token) {
      // Redirigir a login si no hay token
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
