import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Здесь можно добавить дополнительную логику проверки прав доступа
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Защищаем только определенные маршруты
        // Для публичных страниц возвращаем true
        const { pathname } = req.nextUrl;
        
        // Публичные маршруты
        const publicRoutes = [
          '/landing',
          '/auth/signin',
          '/auth/signup',
          '/api/auth',
        ];
        
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }
        
        // Защищенные маршруты требуют авторизации
        // Dashboard требует авторизации
        if (pathname.startsWith('/dashboard')) {
          return !!token;
        }
        
        // API роуты (кроме /api/auth) требуют авторизации
        if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
          return !!token;
        }
        
        // Все остальные роуты публичные
        return true;
      },
    },
  }
);

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

