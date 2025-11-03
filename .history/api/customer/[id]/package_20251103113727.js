// API endpoint for customer package info (GET /api/customer/[id]/package)
import pool from '../../_db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const customer_id = parseInt(id, 10);

    if (!customer_id || isNaN(customer_id)) {
      return res.status(400).json({ success: false, error: 'Valid customer ID required' });
    }

    console.log(`[GET /api/customer/${customer_id}/package] Fetching package...`);

    const result = await pool.query(`
      SELECT 
        p.package_id,
        p.name,
        p.price,
        p.allowed_maps,
        p.priority,
        o.date_time as order_date
      FROM orders o
      JOIN packages p ON o.package_id = p.package_id
      WHERE o.customer_id = $1
      ORDER BY o.date_time DESC
      LIMIT 1
    `, [customer_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'No package found for this customer' 
      });
    }

    console.log(`[GET /api/customer/${customer_id}/package] Found package:`, result.rows[0].name);

    return res.status(200).json({
      success: true,
      package: result.rows[0]
    });
  } catch (error) {
    console.error('[GET /api/customer/:id/package] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
