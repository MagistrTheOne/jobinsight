/**
 * Скрипт для исправления/создания админа в production
 * Запуск: npx tsx scripts/fix-admin-production.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

// Загружаем переменные окружения
config({ path: resolve(process.cwd(), '.env.production') });
// Если нет production, используем local
if (!process.env.DATABASE_URL) {
  config({ path: resolve(process.cwd(), '.env.local') });
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined. Please set it in .env.production or .env.local');
}

const sql = neon(process.env.DATABASE_URL.replace(/[?&]channel_binding=[^&]*/gi, ''));

const email = 'maxonyushko71@gmail.com';
const password = 'magistr2025';
const name = 'MagistrTheOne';
const nickname = 'magistr2025';

async function fixAdminUser() {
  try {
    console.log('🚀 Fixing admin user for production...');
    console.log(`   Email: ${email}`);
    console.log(`   Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown'}\n`);

    // 1. Проверяем существование пользователя
    console.log('📋 Step 1: Checking if user exists...');
    const existingUsers = await sql`
      SELECT id, email, name, role, verified, title 
      FROM users 
      WHERE email = ${email}
    `;

    let userId: string;
    
    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log(`   ✅ User found: ${userId}`);
      
      // Обновляем пользователя
      await sql`
        UPDATE users 
        SET 
          name = ${name},
          role = 'admin',
          verified = 1,
          title = 'CEO',
          email_verified = NOW(),
          updated_at = NOW()
        WHERE id = ${userId}
      `;
      console.log('   ✅ User updated');
    } else {
      // Создаем нового пользователя
      console.log('   ⚠️  User not found, creating new user...');
      const newUsers = await sql`
        INSERT INTO users (id, email, name, email_verified, role, verified, title, created_at, updated_at)
        VALUES (
          gen_random_uuid()::text,
          ${email},
          ${name},
          NOW(),
          'admin',
          1,
          'CEO',
          NOW(),
          NOW()
        )
        RETURNING id
      `;
      userId = newUsers[0].id;
      console.log(`   ✅ User created: ${userId}`);
    }

    // 2. Хешируем пароль правильно для Better Auth
    console.log('\n📋 Step 2: Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`   ✅ Password hashed: ${hashedPassword.substring(0, 20)}...`);

    // 3. Создаем/обновляем account (Better Auth хранит пароли здесь)
    console.log('\n📋 Step 3: Creating/updating account (Better Auth)...');
    
    // Проверяем существующий account (Better Auth использует provider_id='credential' и account_id=email)
    const existingAccounts = await sql`
      SELECT id, provider_id, account_id 
      FROM accounts 
      WHERE user_id = ${userId} AND provider_id = 'credential' AND account_id = ${email}
    `;

    if (existingAccounts.length > 0) {
      // Обновляем пароль
      await sql`
        UPDATE accounts 
        SET 
          password = ${hashedPassword},
          updated_at = NOW()
        WHERE user_id = ${userId} AND provider_id = 'credential' AND account_id = ${email}
      `;
      console.log('   ✅ Account password updated');
    } else {
      // Удаляем старые accounts с credential (на всякий случай)
      await sql`
        DELETE FROM accounts 
        WHERE user_id = ${userId} AND provider_id = 'credential'
      `;
      
      // Создаем новый account
      await sql`
        INSERT INTO accounts (
          id, 
          user_id, 
          account_id, 
          provider_id, 
          password, 
          created_at, 
          updated_at
        )
        VALUES (
          gen_random_uuid()::text,
          ${userId},
          ${email},
          'credential',
          ${hashedPassword},
          NOW(),
          NOW()
        )
      `;
      console.log('   ✅ Account created with password');
    }
    
    // Проверяем, что пароль правильно сохранен
    const verifyAccount = await sql`
      SELECT password FROM accounts 
      WHERE user_id = ${userId} AND provider_id = 'credential' AND account_id = ${email}
    `;
    
    if (verifyAccount.length > 0 && verifyAccount[0].password) {
      const isValid = await bcrypt.compare(password, verifyAccount[0].password);
      if (isValid) {
        console.log('   ✅ Password verification: SUCCESS');
      } else {
        console.log('   ❌ Password verification: FAILED - пароль не совпадает');
      }
    } else {
      console.log('   ⚠️  Account password not found');
    }

    // 4. Создаем/обновляем подписку Enterprise
    console.log('\n📋 Step 4: Setting up Enterprise subscription...');
    const existingSubs = await sql`
      SELECT id FROM subscriptions WHERE user_id = ${userId}
    `;

    if (existingSubs.length > 0) {
      await sql`
        UPDATE subscriptions 
        SET 
          plan = 'enterprise',
          status = 'active',
          current_period_start = NOW(),
          current_period_end = NOW() + INTERVAL '1 year',
          updated_at = NOW()
        WHERE user_id = ${userId}
      `;
      console.log('   ✅ Subscription updated to Enterprise');
    } else {
      await sql`
        INSERT INTO subscriptions (
          id,
          user_id,
          plan,
          status,
          current_period_start,
          current_period_end,
          created_at,
          updated_at
        )
        VALUES (
          gen_random_uuid()::text,
          ${userId},
          'enterprise',
          'active',
          NOW(),
          NOW() + INTERVAL '1 year',
          NOW(),
          NOW()
        )
      `;
      console.log('   ✅ Enterprise subscription created');
    }

    // 5. Проверяем результат
    console.log('\n📋 Step 5: Verifying...');
    const finalUser = await sql`
      SELECT 
        u.id, u.email, u.name, u.role, u.verified, u.title,
        a.password IS NOT NULL as has_password,
        s.plan, s.status
      FROM users u
      LEFT JOIN accounts a ON a.user_id = u.id AND a.provider_id = 'credential'
      LEFT JOIN subscriptions s ON s.user_id = u.id
      WHERE u.email = ${email}
    `;

    if (finalUser.length > 0) {
      const user = finalUser[0];
      console.log('\n✅ Admin user setup complete!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   User ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Verified: ${user.verified ? '✅' : '❌'}`);
      console.log(`   Title: ${user.title}`);
      console.log(`   Has Password: ${user.has_password ? '✅' : '❌'}`);
      console.log(`   Plan: ${user.plan || 'N/A'}`);
      console.log(`   Status: ${user.status || 'N/A'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`\n🔐 Login credentials:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`\n💡 Try logging in now!`);
    } else {
      throw new Error('User not found after setup');
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

fixAdminUser()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

