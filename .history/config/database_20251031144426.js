/**
 * Centralized Database Configuration - Supabase PostgreSQL
 * 
 * This file provides a single source of truth for database configuration
 * across the entire application. All API endpoints use the Supabase database
 * via the pg Pool connection with Session Pooler.
 */

import dotenv from 'dotenv';
import pg from 'pg';

const { Pool } = pg;

// Load environment variables
dotenv.config();

// Supabase Database configuration
export const dbConfig = {
  // Primary connection method - use DATABASE_URL from .env (Supabase Session Pooler)
  connectionString: process.env.DATABASE_URL,
  
  // SSL is required for Supabase
  ssl: {
    rejectUnauthorized: false // Required for Supabase and other cloud providers
  },
  
  // Connection pool settings optimized for Supabase
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 10000, // How long to wait for a connection (increased for cloud)
};

// CORS configuration
export const corsConfig = {
  origins: process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
    'http://localhost:3101',
    'http://127.0.0.1:3101',
  ],
  maxAge: parseInt(process.env.CORS_MAX_AGE || '86400'),
};

// Create and export a shared connection pool
export const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

// Test connection function
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now, current_database() as db, current_user as user');
    console.log('✅ Database connected successfully!');
    console.log(`📊 Database: ${result.rows[0].db}`);
    console.log(`👤 User: ${result.rows[0].user}`);
    console.log(`🕒 Time: ${result.rows[0].now}`);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Graceful shutdown
export async function closePool() {
  try {
    await pool.end();
    console.log('Database pool has ended');
  } catch (error) {
    console.error('Error closing database pool:', error.message);
  }
}

// Export default configuration object
export default {
  db: dbConfig,
  cors: corsConfig,
  pool,
  testConnection,
  closePool
};
