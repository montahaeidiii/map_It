// Consolidated Customer API - handles all customer-related endpoints
import pool from '../_db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { path } = req.query;
  
  try {
    // Route: /api/customer/maps - Get all customer maps
    if (!path || (Array.isArray(path) && path[0] === 'maps')) {
      if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
      }

      const result = await pool.query(`
        SELECT 
          m.map_id, m.title, m.description, m.country, m.active, m.created_at,
          m.customer_id,
          c.first_name || ' ' || c.last_name as customer_name
        FROM map m
        LEFT JOIN customer c ON m.customer_id = c.customer_id
        ORDER BY m.created_at DESC
      `);

      return res.status(200).json({ success: true, maps: result.rows });
    }

    // Route: /api/customer/[id]/maps - Get specific customer's maps
    if (Array.isArray(path) && path.length === 2 && path[1] === 'maps') {
      if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
      }

      const customerId = path[0];
      const result = await pool.query(`
        SELECT 
          m.map_id, m.title, m.description, m.country, m.active, m.created_at,
          m.customer_id,
          COUNT(z.id) as zone_count
        FROM map m
        LEFT JOIN zones z ON m.map_id = z.map_id
        WHERE m.customer_id = $1
        GROUP BY m.map_id
        ORDER BY m.created_at DESC
      `, [customerId]);

      return res.status(200).json({ success: true, maps: result.rows });
    }

    // Route: /api/customer/[id]/package - Get customer's package info
    if (Array.isArray(path) && path.length === 2 && path[1] === 'package') {
      if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
      }

      const customerId = path[0];
      const result = await pool.query(`
        SELECT 
          p.package_id, p.name, p.price, p.allowed_maps, p.priority,
          o.date_time as subscribed_at,
          o.status as subscription_status
        FROM customer c
        LEFT JOIN orders o ON c.customer_id = o.customer_id
        LEFT JOIN packages p ON o.package_id = p.package_id
        WHERE c.customer_id = $1
        ORDER BY o.date_time DESC
        LIMIT 1
      `, [customerId]);

      if (result.rows.length === 0) {
        return res.status(200).json({ success: true, package: null, message: 'No active package found' });
      }

      return res.status(200).json({ success: true, package: result.rows[0] });
    }

    return res.status(404).json({ success: false, error: 'Route not found' });

  } catch (error) {
    console.error('Customer API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
