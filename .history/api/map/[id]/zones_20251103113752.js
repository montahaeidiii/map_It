// API endpoint for map zones (GET /api/map/[id]/zones)
import pool from '../../../_db.js';

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
    const map_id = parseInt(id, 10);

    if (!map_id || isNaN(map_id)) {
      return res.status(400).json({ success: false, error: 'Valid map ID required' });
    }

    console.log(`[GET /api/map/${map_id}/zones] Fetching zones...`);

    const result = await pool.query(`
      SELECT 
        id,
        map_id,
        name,
        color,
        coordinates,
        created_at
      FROM zones
      WHERE map_id = $1
      ORDER BY created_at ASC
    `, [map_id]);

    console.log(`[GET /api/map/${map_id}/zones] Found ${result.rows.length} zones`);

    return res.status(200).json({
      success: true,
      zones: result.rows
    });
  } catch (error) {
    console.error('[GET /api/map/:id/zones] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
