// API endpoint for zone creation (POST /api/zone)
import pool from './_db.js';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { map_id, name, color, coordinates } = req.body;

    if (!map_id || !name || !color || !coordinates) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: map_id, name, color, coordinates' 
      });
    }

    console.log('[POST /api/zone] Creating zone:', { map_id, name });

    const result = await pool.query(
      'INSERT INTO zones (map_id, name, color, coordinates) VALUES ($1, $2, $3, $4) RETURNING *',
      [map_id, name, color, JSON.stringify(coordinates)]
    );

    console.log('[POST /api/zone] Zone created successfully:', result.rows[0].id);

    return res.status(201).json({
      success: true,
      zone: result.rows[0]
    });
  } catch (error) {
    console.error('[POST /api/zone] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
