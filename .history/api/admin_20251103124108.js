// Consolidated admin endpoints - all admin routes in one file
import pool from './_db.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // In Vercel, the URL will be like /api/admin/login, /api/admin/maps, etc.
  // Extract the path after /admin/
  const urlPath = req.url || '';
  const pathMatch = urlPath.match(/\/admin\/(.+?)(?:\?|$)/);
  const endpoint = pathMatch ? pathMatch[1] : '';
  
  console.log('[Admin API] Endpoint:', endpoint, 'Method:', req.method);

  try {
    // Route: /api/admin/login
    if (endpoint === 'login' && req.method === 'POST') {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password required' });
      }

      const result = await pool.query(
        'SELECT admin_id, email, first_name, last_name, password_hash FROM admin WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const admin = result.rows[0];
      const passwordMatch = await bcrypt.compare(password, admin.password_hash);

      if (!passwordMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      await pool.query('UPDATE admin SET last_login = NOW() WHERE admin_id = $1', [admin.admin_id]);

      return res.status(200).json({
        success: true,
        admin: {
          admin_id: admin.admin_id,
          email: admin.email,
          first_name: admin.first_name,
          last_name: admin.last_name
        }
      });
    }

    // Route: /api/admin/maps
    if (path === '/maps' && req.method === 'GET') {
      const result = await pool.query(`
        SELECT 
          m.map_id,
          m.title,
          m.description,
          m.map_code,
          m.created_at,
          m.active,
          c.first_name || ' ' || c.last_name as customer_name,
          c.email as customer_email,
          COUNT(z.id) as zone_count
        FROM map m
        LEFT JOIN customer c ON m.customer_id = c.customer_id
        LEFT JOIN zones z ON m.map_id = z.map_id
        GROUP BY m.map_id, c.customer_id
        ORDER BY m.created_at DESC
      `);

      return res.status(200).json({
        success: true,
        maps: result.rows
      });
    }

    // Route: /api/admin/orders
    if (path === '/orders' && req.method === 'GET') {
      const result = await pool.query(`
        SELECT 
          o.id,
          o.date_time,
          o.total,
          o.status,
          c.first_name || ' ' || c.last_name as customer_name,
          c.email as customer_email,
          p.name as package_name,
          p.allowed_maps
        FROM orders o
        JOIN customer c ON o.customer_id = c.customer_id
        JOIN packages p ON o.package_id = p.package_id
        ORDER BY o.date_time DESC
      `);

      return res.status(200).json({
        success: true,
        orders: result.rows
      });
    }

    // Route: /api/admin/stats
    if (path === '/stats' && req.method === 'GET') {
      const [customers, maps, zones, orders, revenue, activeMaps] = await Promise.all([
        pool.query('SELECT COUNT(*) as count FROM customer'),
        pool.query('SELECT COUNT(*) as count FROM map'),
        pool.query('SELECT COUNT(*) as count FROM zones'),
        pool.query('SELECT COUNT(*) as count FROM orders'),
        pool.query('SELECT SUM(total) as total FROM orders WHERE status = $1', ['completed']),
        pool.query('SELECT COUNT(*) as count FROM map WHERE active = true')
      ]);

      return res.status(200).json({
        success: true,
        stats: {
          totalCustomers: parseInt(customers.rows[0]?.count || 0),
          totalMaps: parseInt(maps.rows[0]?.count || 0),
          totalZones: parseInt(zones.rows[0]?.count || 0),
          totalOrders: parseInt(orders.rows[0]?.count || 0),
          totalRevenue: parseFloat(revenue.rows[0]?.total || 0),
          activeMaps: parseInt(activeMaps.rows[0]?.count || 0)
        }
      });
    }

    return res.status(404).json({ success: false, error: 'Route not found' });
  } catch (error) {
    console.error('[Admin API] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
