// Consolidated Zones API - handles all zone endpoints
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
    // Route: /api/zones/bulk - Bulk save zones
    if (Array.isArray(path) && path[0] === 'bulk') {
      if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
      }

      const { zones } = req.body;
      if (!zones || !Array.isArray(zones)) {
        return res.status(400).json({ success: false, error: 'Zones array is required' });
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const savedZones = [];

        for (const zone of zones) {
          const { id, map_id, name, color, coordinates, customer_id } = zone;

          if (id && id !== 'temp' && !id.startsWith('temp-')) {
            const result = await client.query(
              `UPDATE zones SET name = $1, color = $2, coordinates = $3, updated_at = NOW()
               WHERE id = $4 RETURNING *`,
              [name, color, JSON.stringify(coordinates), id]
            );
            if (result.rows.length > 0) savedZones.push(result.rows[0]);
          } else {
            const result = await client.query(
              `INSERT INTO zones (id, map_id, name, color, coordinates, customer_id, created_at, updated_at)
               VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
              [map_id, name, color, JSON.stringify(coordinates), customer_id || null]
            );
            savedZones.push(result.rows[0]);
          }
        }

        await client.query('COMMIT');
        return res.status(200).json({ success: true, zones: savedZones, message: `${savedZones.length} zones saved` });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }

    // Route: /api/zones/[id] - Get, Update, or Delete specific zone
    if (Array.isArray(path) && path.length === 1 && path[0] !== 'bulk') {
      const zoneId = path[0];

      if (req.method === 'GET') {
        const result = await pool.query('SELECT * FROM zones WHERE id = $1', [zoneId]);
        if (result.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Zone not found' });
        }
        return res.status(200).json({ success: true, zone: result.rows[0] });
      }

      if (req.method === 'PUT') {
        const { name, color, coordinates } = req.body;
        const result = await pool.query(
          `UPDATE zones SET name = COALESCE($1, name), color = COALESCE($2, color),
           coordinates = COALESCE($3, coordinates), updated_at = NOW()
           WHERE id = $4 RETURNING *`,
          [name || null, color || null, coordinates ? JSON.stringify(coordinates) : null, zoneId]
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Zone not found' });
        }
        return res.status(200).json({ success: true, zone: result.rows[0] });
      }

      if (req.method === 'DELETE') {
        const result = await pool.query('DELETE FROM zones WHERE id = $1 RETURNING id', [zoneId]);
        if (result.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Zone not found' });
        }
        return res.status(200).json({ success: true, message: 'Zone deleted successfully' });
      }
    }

    // Route: /api/zones - Get zones for a map or create new zone
    const { map_id } = req.query;

    if (req.method === 'GET') {
      if (!map_id) {
        return res.status(400).json({ success: false, error: 'map_id is required' });
      }
      const result = await pool.query(
        'SELECT id, map_id, name, color, coordinates, created_at, updated_at, customer_id FROM zones WHERE map_id = $1 ORDER BY created_at DESC',
        [map_id]
      );
      return res.status(200).json({ success: true, zones: result.rows });
    }

    if (req.method === 'POST') {
      const { map_id: zoneMapId, name, color, coordinates, customer_id } = req.body;
      if (!zoneMapId || !name || !color || !coordinates) {
        return res.status(400).json({ success: false, error: 'map_id, name, color, and coordinates are required' });
      }
      const result = await pool.query(
        `INSERT INTO zones (id, map_id, name, color, coordinates, customer_id, created_at, updated_at) 
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
        [zoneMapId, name, color, JSON.stringify(coordinates), customer_id || null]
      );
      return res.status(201).json({ success: true, zone: result.rows[0] });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error) {
    console.error('Zones API error:', error);
    return res.status(500).json({ success: false, error: 'Server error', message: error.message });
  }
}
