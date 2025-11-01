import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in .env.local');
}

if (!process.env.BETTER_AUTH_URL) {
  throw new Error('BETTER_AUTH_URL is not defined in .env.local');
}

const sql = neon(process.env.DATABASE_URL);
const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

async function createAdminViaAuth() {
  try {
    console.log('🚀 Creating admin user via Better Auth API...');
    
    const email = 'maxonyushko71@gmail.com';
    const password = 'magistr2025';
    const name = 'magistr2025';
    
    // First, check if user exists and delete account if needed
    const existingUsers = await sql`
      SELECT id FROM "users" WHERE email = ${email} LIMIT 1;
    `;
    
    if (existingUsers.length > 0) {
      console.log('⚠️  User exists, will update account...');
      const userId = existingUsers[0].id;
      
      // Delete existing credential account to recreate
      await sql`
        DELETE FROM "accounts" 
        WHERE user_id = ${userId} AND provider_id = 'credential' AND account_id = ${email};
      `;
      console.log('✅ Removed old credential account');
    }
    
    // Try to sign up via Better Auth API
    try {
      const signUpResponse = await fetch(`${baseURL}/api/auth/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });
      
      const signUpData = await signUpResponse.json();
      
      if (!signUpResponse.ok) {
        // If user already exists, try to update password via reset or update
        if (signUpData.error?.message?.includes('already exists') || signUpResponse.status === 400) {
          console.log('⚠️  User already exists, attempting password update...');
          
          // Use Better Auth password update if available, or recreate account manually
          // For now, let's use the internal auth method
          console.log('📝 Note: Password may need to be reset through the UI');
          console.log('   Or you can delete the user and recreate via signup');
        } else {
          throw new Error(signUpData.error?.message || 'Sign up failed');
        }
      } else {
        console.log('✅ User created via Better Auth API');
        const userId = signUpData.user?.id;
        
        if (userId) {
          // Update user to admin
          await sql`
            UPDATE "users" 
            SET role = 'admin', verified = 1, title = 'CEO', email_verified = NOW()
            WHERE id = ${userId};
          `;
          
          // Create enterprise subscription
          await sql`
            INSERT INTO "subscriptions" (id, user_id, plan, status, current_period_start, current_period_end, created_at, updated_at)
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
            ON CONFLICT (user_id) 
            DO UPDATE SET 
              plan = 'enterprise',
              status = 'active',
              current_period_start = NOW(),
              current_period_end = NOW() + INTERVAL '1 year',
              updated_at = NOW();
          `;
          
          console.log('✅ User updated to admin with enterprise subscription');
        }
      }
    } catch (apiError: any) {
      console.log('⚠️  API signup failed, creating user directly in DB...');
      console.log('   Error:', apiError.message);
      
      // Fallback: create user directly but use Better Auth's password hashing
      // Better Auth uses scrypt or similar, but we'll try with proper bcrypt format
      const userId = existingUsers.length > 0 ? existingUsers[0].id : crypto.randomUUID();
      
      if (existingUsers.length === 0) {
        await sql`
          INSERT INTO "users" (id, email, name, email_verified, role, verified, title, created_at, updated_at)
          VALUES (
            ${userId},
            ${email},
            ${name},
            NOW(),
            'admin',
            1,
            'CEO',
            NOW(),
            NOW()
          )
          ON CONFLICT (email) DO UPDATE SET
            name = ${name},
            role = 'admin',
            verified = 1,
            title = 'CEO',
            email_verified = NOW(),
            updated_at = NOW();
        `;
      }
      
      // The password will be set when user signs in or resets password
      console.log('⚠️  Please use password reset functionality or sign up through UI');
    }
    
    console.log('\n📋 Admin user setup:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Name: ${name}`);
    console.log(`   Role: admin`);
    console.log(`   Verified: ✅`);
    console.log(`   Title: CEO`);
    console.log(`   Plan: enterprise`);
    console.log('\n💡 If login still fails:');
    console.log('   1. Try password reset via "Forgot password?" link');
    console.log('   2. Or delete user from DB and sign up fresh through UI');
    
  } catch (error: any) {
    console.error('❌ Error:', error);
    throw error;
  }
}

createAdminViaAuth()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

