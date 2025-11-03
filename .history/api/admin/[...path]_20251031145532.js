// Consolidated Admin API - handles all admin endpoints
import pool from '../_db.js';
import bcrypt from 'bcryptjs';

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
    // Debug logging
    console.log('[Admin API] Method:', req.method, 'Path:', path);

    // Route: /api/admin/login
    if (!path || (Array.isArray(path) && path[0] === 'login')) {
      if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
      }

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

    // Route: /api/admin/stats
    if (Array.isArray(path) && path[0] === 'stats') {
      if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
      }

      const [customers, maps, orders, revenue] = await Promise.all([
        pool.query('SELECT COUNT(*) as count FROM customer'),
        pool.query('SELECT COUNT(*) as count FROM map'),
        pool.query('SELECT COUNT(*) as count FROM orders'),
        pool.query('SELECT SUM(total) as total FROM orders WHERE status = $1', ['completed'])
      ]);

      return res.status(200).json({
        success: true,
        stats: {
          totalCustomers: parseInt(customers.rows[0]?.count || 0),
          totalMaps: parseInt(maps.rows[0]?.count || 0),
          totalOrders: parseInt(orders.rows[0]?.count || 0),
          totalRevenue: parseFloat(revenue.rows[0]?.total || 0)
        }
      });
    }

    // Route: /api/admin/maps
    if (Array.isArray(path) && path[0] === 'maps') {
      if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
      }

      const result = await pool.query(`
        SELECT 
          m.map_id, m.title, m.description, m.created_at, m.country, m.active,
          m.customer_id,
          c.first_name || ' ' || c.last_name as customer_name,
          c.email as customer_email
        FROM map m
        LEFT JOIN customer c ON m.customer_id = c.customer_id
        ORDER BY m.created_at DESC
      `);

      return res.status(200).json({ success: true, maps: result.rows });
    }

    // Route: /api/admin/orders
    if (Array.isArray(path) && path[0] === 'orders') {
      if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
      }

      const result = await pool.query(`
        SELECT 
          o.id, o.customer_id, o.package_id, o.date_time, o.total, o.status, o.created_at,
          c.first_name || ' ' || c.last_name as customer_name,
          c.email as customer_email,
          p.name as package_name
        FROM orders o
        LEFT JOIN customer c ON o.customer_id = c.customer_id
        LEFT JOIN packages p ON o.package_id = p.package_id
        ORDER BY o.date_time DESC
      `);

      return res.status(200).json({ success: true, orders: result.rows });
    }

    console.log('[Admin API] No route matched. Path:', path);
    return res.status(404).json({ 
      success: false, 
      error: 'Route not found',
      debug: { path, method: req.method }
    });

  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ success: false, error: 'Server error', message: error.message });
  }
}
