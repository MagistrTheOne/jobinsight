import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in .env.local');
}

const sql = neon(process.env.DATABASE_URL);

async function fixAdminPassword() {
  try {
    console.log('🔧 Fixing admin password...');
    
    const email = 'maxonyushko71@gmail.com';
    const password = 'magistr2025';
    
    // Get user
    const users = await sql`
      SELECT id FROM "users" WHERE email = ${email} LIMIT 1;
    `;
    
    if (users.length === 0) {
      throw new Error('User not found');
    }
    
    const userId = users[0].id;
    console.log('✅ Found user:', userId);
    
    // Hash password using bcrypt (same method as Better Auth)
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');
    
    // Update or create account with correct password
    // Better Auth uses provider_id = 'credential' and account_id = email
    // Check if account exists
    const existingAccounts = await sql`
      SELECT id FROM "accounts" 
      WHERE user_id = ${userId} AND provider_id = 'credential' AND account_id = ${email}
      LIMIT 1;
    `;
    
    if (existingAccounts.length > 0) {
      // Update existing account
      await sql`
        UPDATE "accounts" 
        SET password = ${hashedPassword}, updated_at = NOW()
        WHERE user_id = ${userId} AND provider_id = 'credential' AND account_id = ${email};
      `;
      console.log('✅ Account password updated');
    } else {
      // Create new account
      await sql`
        INSERT INTO "accounts" (id, user_id, account_id, provider_id, password, created_at, updated_at)
        VALUES (
          gen_random_uuid()::text,
          ${userId},
          ${email},
          'credential',
          ${hashedPassword},
          NOW(),
          NOW()
        );
      `;
      console.log('✅ Account created with password');
    }
    
    // Verify the password works
    const accounts = await sql`
      SELECT password FROM "accounts" 
      WHERE user_id = ${userId} AND provider_id = 'credential' AND account_id = ${email}
      LIMIT 1;
    `;
    
    if (accounts.length > 0) {
      const isValid = await bcrypt.compare(password, accounts[0].password);
      if (isValid) {
        console.log('✅ Password verification successful!');
      } else {
        console.log('❌ Password verification failed!');
      }
    }
    
    console.log('\n🎉 Admin password fixed successfully!');
    console.log('\n🔐 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    
  } catch (error: any) {
    console.error('❌ Error fixing password:', error);
    throw error;
  }
}

fixAdminPassword()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

