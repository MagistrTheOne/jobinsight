import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from './db/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

// Configure Neon with better timeout settings for stability
neonConfig.fetchConnectionCache = true;
neonConfig.pipelineTLS = false; // Disable pipeline TLS to avoid connection issues
neonConfig.pipelineConnect = false;
neonConfig.useSecureWebSocket = false; // Disable WebSocket to avoid connection drops
neonConfig.webSocketConstructor = undefined;

// Remove channel_binding from URL if present (can cause connection issues)
const databaseUrl = process.env.DATABASE_URL.replace(/[?&]channel_binding=[^&]*/gi, '');

// Neon serverless client with custom fetch for better error handling
const sql = neon(databaseUrl, {
  fetchOptions: {
    timeout: 10000, // 10 second timeout
  }
});

// Drizzle ORM instance
export const db = drizzle(sql, { schema });

// Export schema for use in other files
export { schema };

// For backward compatibility (if needed)
export { sql };

