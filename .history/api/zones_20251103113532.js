// API endpoint for zones list (GET /api/zones)
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
    return res.status(405).json({ success: false, error: 'Method not allowed - use POST' });
  }

  try {
    const { map_id, zones } = req.body;

    if (!map_id || !zones || !Array.isArray(zones)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing or invalid fields: map_id and zones array required' 
      });
    }

    console.log(`[POST /api/zones] Bulk saving ${zones.length} zones for map ${map_id}`);

    const results = [];
    
    for (const zone of zones) {
      const { name, color, coordinates } = zone;
      
      if (!name || !color || !coordinates) {
        console.error('[POST /api/zones] Invalid zone data:', zone);
        continue;
      }

      const result = await pool.query(
        'INSERT INTO zones (map_id, name, color, coordinates) VALUES ($1, $2, $3, $4) RETURNING *',
        [map_id, name, color, JSON.stringify(coordinates)]
      );

      results.push(result.rows[0]);
    }

    console.log(`[POST /api/zones] Successfully saved ${results.length} zones`);

    return res.status(201).json({
      success: true,
      zones: results,
      count: results.length
    });
  } catch (error) {
    console.error('[POST /api/zones] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
