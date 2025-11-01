import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from './db/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

// Configure Neon with better timeout settings
neonConfig.fetchConnectionCache = true;
neonConfig.pipelineTLS = true;
neonConfig.pipelineConnect = false;
neonConfig.useSecureWebSocket = true;

// Remove channel_binding from URL if present (can cause connection issues)
const databaseUrl = process.env.DATABASE_URL.replace(/[?&]channel_binding=[^&]*/gi, '');

// Neon serverless client
const sql = neon(databaseUrl);

// Drizzle ORM instance
export const db = drizzle(sql, { schema });

// Export schema for use in other files
export { schema };

// For backward compatibility (if needed)
export { sql };

