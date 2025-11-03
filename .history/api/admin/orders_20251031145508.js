// API endpoint for admin orders
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
        o.id as order_id,
        o.customer_id,
        o.package_id,
        o.total,
        o.status,
        o.created_at,
        o.date_time as order_date,
        c.first_name,
        c.last_name,
        c.email,
        p.name as package_name,
        p.allowed_maps,
        p.price
      FROM orders o
      LEFT JOIN customer c ON o.customer_id = c.customer_id
      LEFT JOIN packages p ON o.package_id = p.package_id
      ORDER BY o.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      orders: result.rows
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
}
