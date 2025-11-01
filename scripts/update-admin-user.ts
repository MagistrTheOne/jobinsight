import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../lib/db/schema';
import { eq } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in .env.local');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

const { users, subscriptions, usageLimits } = schema;

async function updateAdminUser() {
  try {
    console.log("🔧 Обновление пользователя admin...");

    const email = "maxonyushko71@gmail.com";
    
    // Найти пользователя
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      console.error("❌ Пользователь не найден:", email);
      process.exit(1);
    }

    console.log("✅ Пользователь найден:", user.id);

    // Обновить пользователя
    await db
      .update(users)
      .set({
        name: "MagistrTheOne",
        verified: 1, // Синяя галочка
        title: "CEO",
        role: "admin",
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    console.log("✅ Пользователь обновлен: name=MagistrTheOne, verified=1, title=CEO, role=admin");

    // Проверить/создать подписку Enterprise
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id))
      .limit(1);

    if (subscription) {
      // Обновить существующую подписку
      await db
        .update(subscriptions)
        .set({
          plan: "enterprise",
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscription.id));
      console.log("✅ Подписка обновлена на Enterprise");
    } else {
      // Создать новую подписку
      await db.insert(subscriptions).values({
        id: crypto.randomUUID(),
        userId: user.id,
        plan: "enterprise",
        status: "active",
      });
      console.log("✅ Создана подписка Enterprise");
    }

    // Установить Unlimited лимиты для Enterprise (Enterprise = безлимит, можно просто очистить использование)
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [existingLimits] = await db
      .select()
      .from(usageLimits)
      .where(eq(usageLimits.userId, user.id))
      .limit(1);

    if (existingLimits) {
      // Обновить существующие лимиты - сбросить счетчики (Enterprise = unlimited)
      await db
        .update(usageLimits)
        .set({
          resumeCount: 0,
          jobCount: 0,
          coverLetterCount: 0,
          periodStart: periodStart,
          updatedAt: new Date(),
        })
        .where(eq(usageLimits.userId, user.id));
      console.log("✅ Лимиты обновлены: счетчики сброшены (Enterprise = unlimited)");
    } else {
      // Создать новые лимиты
      await db.insert(usageLimits).values({
        id: crypto.randomUUID(),
        userId: user.id,
        resumeCount: 0,
        jobCount: 0,
        coverLetterCount: 0,
        periodStart: periodStart,
      });
      console.log("✅ Созданы лимиты: счетчики = 0 (Enterprise = unlimited)");
    }

    console.log("🎉 Пользователь успешно обновлен!");
    console.log("📧 Email:", email);
    console.log("👤 Name:", "MagistrTheOne");
    console.log("✅ Verified: true (синяя галочка)");
    console.log("💼 Title: CEO");
    console.log("👑 Role: admin");
    console.log("🚀 Plan: Enterprise (Unlimited)");

  } catch (error) {
    console.error("❌ Ошибка обновления пользователя:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

updateAdminUser();
