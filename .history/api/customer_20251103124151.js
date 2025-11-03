// Consolidated customer endpoints
import pool from './_db.js';

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
    // In Vercel, URL will be like /api/customer/27/maps or /api/customer/27/package
    const urlPath = req.url || '';
    const match = urlPath.match(/\/customer\/(\d+)\/(maps|package)/);

    if (!match) {
      return res.status(400).json({ success: false, error: 'Invalid path format. Use /api/customer/:id/maps or /api/customer/:id/package' });
    }

    const [, customerId, endpoint] = match;
    const customer_id = parseInt(customerId, 10);
    
    console.log('[Customer API] ID:', customer_id, 'Endpoint:', endpoint);

    // Route: /api/customer/:id/maps
    if (endpoint === 'maps') {
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

      return res.status(200).json({
        success: true,
        maps: result.rows
      });
    }

    // Route: /api/customer/:id/package
    if (endpoint === 'package') {
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

      return res.status(200).json({
        success: true,
        package: result.rows[0]
      });
    }

    return res.status(404).json({ success: false, error: 'Route not found' });
  } catch (error) {
    console.error('[Customer API] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
