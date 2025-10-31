import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Публичные маршруты
  const publicRoutes = [
    '/landing',
    '/auth/signin',
    '/auth/signup',
    '/api/auth',
  ];
  
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Защищенные маршруты требуют авторизации
  if (pathname.startsWith('/dashboard') || 
      (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth'))) {
    try {
      const session = await auth.api.getSession({ headers: request.headers });
      
      if (!session) {
        // Редирект на страницу входа с сохранением callbackUrl
        const signInUrl = new URL('/auth/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }
      
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware auth error:', error);
      const signInUrl = new URL('/auth/signin', request.url);
      return NextResponse.redirect(signInUrl);
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
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
