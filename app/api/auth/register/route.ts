import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = registerSchema.parse(body);

    const user = await registerUser(email, name, password);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    });
  } catch (error: any) {
    if (error.message === "User already exists") {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}

