import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

// Добавляем CORS headers для поддержки preview деплоев
export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  
  // Разрешаем запросы с любых Vercel preview деплоев
  const allowedOrigins = [
    process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
    /^https:\/\/.*\.vercel\.app$/,
  ];
  
  const isAllowed = origin && (
    allowedOrigins.some(allowed => 
      typeof allowed === "string" 
        ? allowed === origin 
        : allowed instanceof RegExp && allowed.test(origin)
    )
  );

  const response = await handler.GET(request);
  
  if (isAllowed && origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  
  return response;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  
  const allowedOrigins = [
    process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
    /^https:\/\/.*\.vercel\.app$/,
  ];
  
  const isAllowed = origin && (
    allowedOrigins.some(allowed => 
      typeof allowed === "string" 
        ? allowed === origin 
        : allowed instanceof RegExp && allowed.test(origin)
    )
  );

  const response = await handler.POST(request);
  
  if (isAllowed && origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  
  return response;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  
  const allowedOrigins = [
    process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
    /^https:\/\/.*\.vercel\.app$/,
  ];
  
  const isAllowed = origin && (
    allowedOrigins.some(allowed => 
      typeof allowed === "string" 
        ? allowed === origin 
        : allowed instanceof RegExp && allowed.test(origin)
    )
  );

  if (isAllowed && origin) {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  return new NextResponse(null, { status: 200 });
}

