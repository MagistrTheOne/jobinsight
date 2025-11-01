import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in .env.local');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

const { users, accounts, subscriptions, usageLimits } = schema;

async function createAdminUser() {
  try {
    const email = 'maxonyushko71@gmail.com';
    const userId = crypto.randomUUID();
    const now = new Date();
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      console.log('⚠️  User already exists, updating...');
      const user = existingUser[0];
      
      // Update user to admin
      await db
        .update(users)
        .set({
          name: 'magistr2025',
          role: 'admin',
          verified: 1,
          title: 'CEO',
          emailVerified: now,
        })
        .where(eq(users.id, user.id));
      
      // Check and update/create subscription to enterprise
      const existingSub = await db.select().from(subscriptions).where(eq(subscriptions.userId, user.id)).limit(1);
      
      if (existingSub.length > 0) {
        await db
          .update(subscriptions)
          .set({
            plan: 'enterprise',
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year
          })
          .where(eq(subscriptions.userId, user.id));
      } else {
        await db.insert(subscriptions).values({
          id: crypto.randomUUID(),
          userId: user.id,
          plan: 'enterprise',
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
        });
      }
      
      console.log('✅ Admin user updated successfully!');
      console.log(`   User ID: ${user.id}`);
      console.log(`   Email: ${email}`);
      console.log(`   Name: magistr2025 (MagistrTheOne)`);
      console.log(`   Role: admin`);
      console.log(`   Verified: ✅ (blue check)`);
      console.log(`   Title: CEO`);
      console.log(`   Plan: enterprise`);
      return;
    }
    
    // Create new admin user
    console.log('🚀 Creating new admin user...');
    
    // Hash password (using a default password, user should change it)
    const defaultPassword = 'magistr2025';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        email: email,
        name: 'magistr2025',
        role: 'admin',
        verified: 1,
        title: 'CEO',
        emailVerified: now,
      })
      .returning();
    
    console.log('✅ User created:', newUser.id);
    
    // Create email/password account
    await db.insert(accounts).values({
      id: crypto.randomUUID(),
      userId: userId,
      accountId: email,
      providerId: 'credential',
      password: hashedPassword,
    });
    
    console.log('✅ Account created');
    
    // Create enterprise subscription
    await db.insert(subscriptions).values({
      id: crypto.randomUUID(),
      userId: userId,
      plan: 'enterprise',
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });
    
    console.log('✅ Enterprise subscription created');
    
    // Create usage limits (unlimited for enterprise)
    await db.insert(usageLimits).values({
      id: crypto.randomUUID(),
      userId: userId,
      periodStart: now,
      resumeCount: 0,
      jobCount: 0,
      coverLetterCount: 0,
    });
    
    console.log('✅ Usage limits created');
    
    console.log('\n🎉 Admin user created successfully!');
    console.log('\n📋 User Details:');
    console.log(`   User ID: ${userId}`);
    console.log(`   Email: ${email}`);
    console.log(`   Name: magistr2025 (MagistrTheOne)`);
    console.log(`   Role: admin`);
    console.log(`   Verified: ✅ (blue check)`);
    console.log(`   Title: CEO`);
    console.log(`   Plan: enterprise`);
    console.log(`   Password: ${defaultPassword} (please change on first login)`);
    console.log('\n🔐 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${defaultPassword}`);
    
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
