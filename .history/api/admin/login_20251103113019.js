// API endpoint for admin login
import pool from '../_db.js';
import bcrypt from 'bcryptjs';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    console.log('[Admin Login] Attempting login for:', email);

    // Query database
    const result = await pool.query(
      'SELECT admin_id, email, first_name, last_name, password_hash FROM admin WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('[Admin Login] No admin found with email:', email);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatch) {
      console.log('[Admin Login] Invalid password for:', email);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Update last login
    await pool.query('UPDATE admin SET last_login = NOW() WHERE admin_id = $1', [admin.admin_id]);

    console.log('[Admin Login] Successful login for:', email);

    return res.status(200).json({
      success: true,
      admin: {
        admin_id: admin.admin_id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name
      }
    });
  } catch (error) {
    console.error('[Admin Login] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
