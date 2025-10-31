import { NextRequest, NextResponse } from 'next/server';
import { gigachatAPI } from '@/lib/gigachat';

export async function POST(request: NextRequest) {
  try {
    // Test the authentication by sending a simple message
    const testMessage = await gigachatAPI.sendMessage([
      {
        role: 'user',
        content: 'Привет! Это тестовое сообщение для проверки подключения.'
      }
    ]);

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      response: testMessage
    });
  } catch (error: any) {
    console.error('Authentication test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'GigaChat API endpoint ready',
    timestamp: new Date().toISOString()
  });
}