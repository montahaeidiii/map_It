// API endpoint for customer maps (GET /api/customer/[id]/maps)
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

    console.log(`[GET /api/customer/${customer_id}/maps] Fetching maps...`);

    const result = await pool.query(`
      SELECT 
        m.map_id,
        m.title,
        m.description,
        m.map_code,
        m.country,
        m.created_at,
        m.active,
        COUNT(z.id) as zone_count
      FROM map m
      LEFT JOIN zones z ON m.map_id = z.map_id
      WHERE m.customer_id = $1
      GROUP BY m.map_id
      ORDER BY m.created_at DESC
    `, [customer_id]);

    console.log(`[GET /api/customer/${customer_id}/maps] Found ${result.rows.length} maps`);

    return res.status(200).json({
      success: true,
      maps: result.rows
    });
  } catch (error) {
    console.error('[GET /api/customer/:id/maps] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
