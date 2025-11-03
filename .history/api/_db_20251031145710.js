// Shared database configuration for API endpoints
// This file is used by Vercel serverless functions and local development
import pkg from 'pg';
import dotenv from 'dotenv';

// Load environment variables (for local development)
// Vercel will inject DATABASE_URL automatically in production
dotenv.config();

const { Pool } = pkg;

// Log connection attempt (will help debug issues)
console.log('[DB] Initializing database connection...');
console.log('[DB] DATABASE_URL exists:', !!process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  console.error('[DB] ERROR: DATABASE_URL not found in environment variables');
}

// Create a single shared pool for all API endpoints
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10, // Limit connections for serverless
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000
});

// Error handler for pool
pool.on('error', (err) => {
  console.error('[DB] Unexpected database pool error:', err);
});

// Test connection on startup
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('[DB] Connection test failed:', err.message);
  } else {
    console.log('[DB] Connection successful at:', result.rows[0].now);
  }
});

export default pool;
