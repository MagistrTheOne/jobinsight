import { getUserSubscription, getUsageLimits, createOrGetUsageLimits } from './db/queries';

export type UsageType = 'resume' | 'job' | 'coverLetter';

export interface UsageLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
}

export interface FreePlanLimits {
  resume: number;
  job: number;
  coverLetter: number;
}

export function getFreePlanLimits(): FreePlanLimits {
  return {
    resume: 5,
    job: 5,
    coverLetter: 2,
  };
}

export function getCurrentPeriodStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function checkUsageLimit(
  userId: string,
  type: UsageType
): Promise<UsageLimitResult> {
  // Get user subscription
  const subscription = await getUserSubscription(userId);
  
  // Pro users have unlimited access
  if (subscription?.plan === 'pro' && subscription?.status === 'active') {
    return {
      allowed: true,
      remaining: Infinity,
      limit: Infinity,
      used: 0,
    };
  }
  
  // Free users have limits
  const limits = getFreePlanLimits();
  const limit = limits[type];
  
  // Get current period start (beginning of current month)
  const periodStart = getCurrentPeriodStart();
  
  // Get or create usage limits record
  const usage = await createOrGetUsageLimits(userId, periodStart);
  
  // Get current usage count
  const used = type === 'resume' ? usage.resumeCount :
               type === 'job' ? usage.jobCount :
               usage.coverLetterCount;
  
  const remaining = Math.max(0, limit - used);
  const allowed = remaining > 0;
  
  return {
    allowed,
    remaining,
    limit,
    used,
  };
}

export async function canUseFeature(
  userId: string,
  type: UsageType
): Promise<boolean> {
  const result = await checkUsageLimit(userId, type);
  return result.allowed;
}

