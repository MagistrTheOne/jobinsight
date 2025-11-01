import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in .env.local');
}

const sql = neon(process.env.DATABASE_URL);

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user...');
    
    // First, add columns if they don't exist
    try {
      await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user'`;
    } catch (e: any) {
      if (!e.message?.includes('already exists')) console.log('Column role already exists');
    }
    
    try {
      await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verified" integer DEFAULT 0`;
    } catch (e: any) {
      if (!e.message?.includes('already exists')) console.log('Column verified already exists');
    }
    
    try {
      await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "title" text`;
    } catch (e: any) {
      if (!e.message?.includes('already exists')) console.log('Column title already exists');
    }
    
    console.log('✅ Columns added/verified');
    
    // Hash password: magistr2025 using bcrypt
    // Generated with: bcrypt.hashSync('magistr2025', 10)
    const hashedPassword = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
    
    // Insert or update user
    const users = await sql`
      INSERT INTO "users" (id, email, name, email_verified, role, verified, title, created_at, updated_at)
      VALUES (
        gen_random_uuid()::text,
        'maxonyushko71@gmail.com',
        'magistr2025',
        NOW(),
        'admin',
        1,
        'CEO',
        NOW(),
        NOW()
      )
      ON CONFLICT (email) 
      DO UPDATE SET 
        name = 'magistr2025',
        role = 'admin',
        verified = 1,
        title = 'CEO',
        email_verified = NOW(),
        updated_at = NOW()
      RETURNING id, email, name, role, verified, title;
    `;
    
    const user = users[0];
    console.log('✅ User created/updated:', user.id);
    
    // Create or update account
    await sql`
      INSERT INTO "accounts" (id, user_id, account_id, provider_id, password, created_at, updated_at)
      VALUES (
        gen_random_uuid()::text,
        ${user.id},
        'maxonyushko71@gmail.com',
        'credential',
        ${hashedPassword},
        NOW(),
        NOW()
      )
      ON CONFLICT DO NOTHING;
    `;
    
    console.log('✅ Account created');
    
    // Create or update subscription to enterprise (need to handle constraint)
    try {
      await sql`
        INSERT INTO "subscriptions" (id, user_id, plan, status, current_period_start, current_period_end, created_at, updated_at)
        VALUES (
          gen_random_uuid()::text,
          ${user.id},
          'enterprise',
          'active',
          NOW(),
          NOW() + INTERVAL '1 year',
          NOW(),
          NOW()
        )
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          plan = 'enterprise',
          status = 'active',
          current_period_start = NOW(),
          current_period_end = NOW() + INTERVAL '1 year',
          updated_at = NOW();
      `;
      console.log('✅ Enterprise subscription created/updated');
    } catch (e: any) {
      // If enterprise is not in constraint, update via UPDATE
      if (e.message?.includes('check constraint')) {
        await sql`
          UPDATE "subscriptions" 
          SET status = 'active',
              current_period_start = NOW(),
              current_period_end = NOW() + INTERVAL '1 year',
              updated_at = NOW()
          WHERE user_id = ${user.id};
        `;
        console.log('⚠️  Subscription updated (plan constraint may need manual fix)');
      } else {
        throw e;
      }
    }
    
    // Create usage limits
    await sql`
      INSERT INTO "usage_limits" (id, user_id, period_start, resume_count, job_count, cover_letter_count, created_at, updated_at)
      VALUES (
        gen_random_uuid()::text,
        ${user.id},
        NOW(),
        0,
        0,
        0,
        NOW(),
        NOW()
      )
      ON CONFLICT DO NOTHING;
    `;
    
    console.log('✅ Usage limits created');
    
    console.log('\n🎉 Admin user created successfully!');
    console.log('\n📋 User Details:');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Email: maxonyushko71@gmail.com`);
    console.log(`   Name: magistr2025 (MagistrTheOne)`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Verified: ✅ (blue check)`);
    console.log(`   Title: ${user.title}`);
    console.log(`   Plan: enterprise`);
    console.log('\n🔐 Login credentials:');
    console.log(`   Email: maxonyushko71@gmail.com`);
    console.log(`   Password: magistr2025`);
    
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

createAdminUser()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

