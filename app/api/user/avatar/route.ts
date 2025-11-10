import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateUser } from '@/lib/db/queries';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';

// Максимальный размер файла: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Проверка размера
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // Создаем директорию для аватаров, если не существует
    const uploadsDir = join(process.cwd(), 'public', 'avatars');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Генерируем уникальное имя файла
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${session.user.id}-${Date.now()}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Конвертируем File в Buffer и сохраняем
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // URL для доступа к файлу
    const avatarUrl = `/avatars/${fileName}`;

    // Обновляем пользователя в БД
    await updateUser(session.user.id, { image: avatarUrl });

    return NextResponse.json({
      success: true,
      url: avatarUrl,
    });

  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload avatar',
        message: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

