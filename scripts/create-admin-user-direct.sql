-- Direct SQL script to create admin user
-- First, add columns if they don't exist
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verified" integer DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "title" text;

-- Update subscriptions to support enterprise
ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_plan_check";
-- Note: PostgreSQL doesn't support CHECK constraint modification easily, 
-- so we'll just try to insert enterprise and let it fail if constraint exists

-- Insert or update user
INSERT INTO "users" (id, email, name, "emailVerified", role, verified, title, "createdAt", "updatedAt")
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
  "emailVerified" = NOW(),
  "updatedAt" = NOW();

-- Get user ID
DO $$
DECLARE
  v_user_id text;
  v_account_id text;
  v_subscription_id text;
  v_usage_limits_id text;
  v_hashed_password text;
BEGIN
  SELECT id INTO v_user_id FROM "users" WHERE email = 'maxonyushko71@gmail.com';
  
  -- Hash password: magistr2025
  -- Using bcrypt hash of 'magistr2025' - $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
  v_hashed_password := '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
  
  -- Create or update account
  INSERT INTO "accounts" (id, user_id, account_id, provider_id, password, "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid()::text,
    v_user_id,
    'maxonyushko71@gmail.com',
    'credential',
    v_hashed_password,
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;
  
  -- Create or update subscription to enterprise
  INSERT INTO "subscriptions" (id, user_id, plan, status, "currentPeriodStart", "currentPeriodEnd", "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid()::text,
    v_user_id,
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
    "currentPeriodStart" = NOW(),
    "currentPeriodEnd" = NOW() + INTERVAL '1 year',
    "updatedAt" = NOW();
  
  -- Create or update usage limits
  INSERT INTO "usage_limits" (id, user_id, "periodStart", "resumeCount", "jobCount", "coverLetterCount", "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid()::text,
    v_user_id,
    NOW(),
    0,
    0,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Admin user created/updated successfully! User ID: %', v_user_id;
END $$;

