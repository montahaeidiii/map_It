// Shared database configuration for API endpoints
// This file is used by Vercel serverless functions
import pkg from 'pg';
const { Pool } = pkg;

// Create a single shared pool for all API endpoints
// Vercel will inject DATABASE_URL from environment variables
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
  console.error('Unexpected database pool error:', err);
});

export default pool;
