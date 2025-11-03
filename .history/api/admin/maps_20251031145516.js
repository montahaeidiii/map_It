// API endpoint for admin maps list
import pool from '../_db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const result = await pool.query(`
      SELECT 
        m.map_id,
        m.title,
        m.description,
        m.map_code,
        m.created_at,
        m.active,
        m.country,
        m.customer_id,
        c.first_name,
        c.last_name,
        c.email,
        c.registration_date,
        COUNT(z.id) as zone_count
      FROM map m
      LEFT JOIN customer c ON m.customer_id = c.customer_id
      LEFT JOIN zones z ON m.map_id = z.map_id
      GROUP BY m.map_id, m.title, m.description, m.map_code, m.created_at, m.active, m.country, 
               m.customer_id, c.first_name, c.last_name, c.email, c.registration_date
      ORDER BY m.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      maps: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Maps fetch error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
}
