// Consolidated map endpoints
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

  try {
    // In Vercel, URL will be like /api/map/36/zones or /api/map/36 or /api/map
    const urlPath = req.url || '';
    
    // Route: /api/map/:id/zones
    const zonesMatch = urlPath.match(/\/map\/(\d+)\/zones/);
    if (zonesMatch) {
      const map_id = parseInt(zonesMatch[1], 10);
      console.log('[Map API] Getting zones for map:', map_id);
      
      const result = await pool.query(`
        SELECT id, map_id, name, color, coordinates, created_at
        FROM zones
        WHERE map_id = $1
        ORDER BY created_at ASC
      `, [map_id]);

      return res.status(200).json({
        success: true,
        zones: result.rows
      });
    }

    // Route: /api/map/:id (GET single map)
    const idMatch = urlPath.match(/\/map\/(\d+)(?:$|\?)/);
    if (idMatch && req.method === 'GET') {
      const map_id = parseInt(idMatch[1], 10);
      console.log('[Map API] Getting map:', map_id);

      const mapResult = await pool.query(`
        SELECT 
          m.*,
          c.first_name || ' ' || c.last_name as customer_name,
          c.email as customer_email
        FROM map m
        LEFT JOIN customer c ON m.customer_id = c.customer_id
        WHERE m.map_id = $1
      `, [map_id]);

      if (mapResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Map not found' });
      }

      const zonesResult = await pool.query(`
        SELECT id, map_id, name, color, coordinates, created_at
        FROM zones
        WHERE map_id = $1
        ORDER BY created_at ASC
      `, [map_id]);

      const map = {
        ...mapResult.rows[0],
        zones: zonesResult.rows
      };

      return res.status(200).json({ success: true, map });
    }

    // Route: /api/map (POST - create new map)
    if (!idMatch && !zonesMatch && req.method === 'POST') {
      console.log('[Map API] Creating new map');
      const { title, description, country, customer_id, map_code, map_data, map_bounds } = req.body;

      if (!title || !customer_id) {
        return res.status(400).json({ success: false, error: 'Title and customer_id required' });
      }

      const result = await pool.query(
        'INSERT INTO map (title, description, country, customer_id, map_code, map_data, map_bounds) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [title, description, country, customer_id, map_code, map_data, map_bounds]
      );

      return res.status(201).json({
        success: true,
        map: result.rows[0]
      });
    }

    return res.status(404).json({ success: false, error: 'Route not found' });
  } catch (error) {
    console.error('[Map API] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
