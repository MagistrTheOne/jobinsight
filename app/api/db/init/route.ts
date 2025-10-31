import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Use drizzle-kit push to initialize database schema',
    instructions: [
      '1. Run: npx drizzle-kit push',
      '2. Or use: npm run db:push',
      '3. Schema is defined in lib/db/schema.ts'
    ]
  });
}

