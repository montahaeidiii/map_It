// API endpoint to test database connection
import pkg from 'pg';
const { Pool } = pkg;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // Log what we're using
    const dbUrl = process.env.DATABASE_URL;
    const hasDbUrl = !!dbUrl;
    const isNeon = dbUrl?.includes('neon.tech');
    
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: dbUrl?.includes('localhost') ? false : { rejectUnauthorized: false }
    });
    
    const result = await pool.query('SELECT NOW() as time, current_database() as db');
    await pool.end();
    
    return res.status(200).json({
      success: true,
      hasEnvVar: hasDbUrl,
      isNeon,
      database: result.rows[0].db,
      time: result.rows[0].time,
      message: 'Database connection successful'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      hasEnvVar: !!process.env.DATABASE_URL,
      message: 'Database connection failed'
    });
  }
}
