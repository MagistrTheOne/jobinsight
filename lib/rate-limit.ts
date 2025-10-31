interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export async function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<{ success: boolean; remaining?: number; resetTime?: number }> {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    
    return {
      success: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    };
  }

  if (entry.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }

  entry.count += 1;
  rateLimitMap.set(identifier, entry);

  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  rateLimitMap.forEach((entry, key) => {
    if (now > entry.resetTime) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => rateLimitMap.delete(key));
}, 60000); // Clean up every minute