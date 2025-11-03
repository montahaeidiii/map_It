// API endpoint for admin stats
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
    const [customers, maps, orders, revenue, zones, activeMaps] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM customer'),
      pool.query('SELECT COUNT(*) as count FROM map'),
      pool.query('SELECT COUNT(*) as count FROM orders'),
      pool.query('SELECT SUM(total) as total FROM orders WHERE status = $1', ['completed']),
      pool.query('SELECT COUNT(*) as count FROM zones'),
      pool.query('SELECT COUNT(*) as count FROM map WHERE active = true')
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalCustomers: parseInt(customers.rows[0]?.count || 0),
        totalMaps: parseInt(maps.rows[0]?.count || 0),
        totalOrders: parseInt(orders.rows[0]?.count || 0),
        totalRevenue: parseFloat(revenue.rows[0]?.total || 0),
        totalZones: parseInt(zones.rows[0]?.count || 0),
        activeMaps: parseInt(activeMaps.rows[0]?.count || 0)
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
}
