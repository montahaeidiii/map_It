// Consolidated Maps API - handles all map operations
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

  const { id } = req.query;

  try {
    // Handle /api/map (no ID) - List all maps or create new map
    if (!id) {
      if (req.method === 'GET') {
        const result = await pool.query(`
          SELECT 
            m.map_id, m.title, m.description, m.country, m.active, m.created_at,
            m.customer_id,
            c.first_name || ' ' || c.last_name as customer_name,
            COUNT(z.id) as zone_count
          FROM map m
          LEFT JOIN customer c ON m.customer_id = c.customer_id
          LEFT JOIN zones z ON m.map_id = z.map_id
          GROUP BY m.map_id, c.first_name, c.last_name
          ORDER BY m.created_at DESC
        `);
        return res.status(200).json({ success: true, maps: result.rows });
      }

      if (req.method === 'POST') {
        const { title, description, country, customer_id, active, map_code, map_data, map_bounds } = req.body;
        if (!title || !customer_id) {
          return res.status(400).json({ success: false, error: 'Title and customer_id are required' });
        }
        const result = await pool.query(
          `INSERT INTO map (title, description, country, customer_id, active, map_code, map_data, map_bounds, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`,
          [
            title, 
            description || '', 
            country || null, 
            customer_id, 
            active !== false, 
            map_code || null,
            map_data ? JSON.stringify(map_data) : JSON.stringify({ lat: 20, lng: 0, zoom: 2 }),
            map_bounds ? JSON.stringify(map_bounds) : JSON.stringify({ center: [20, 0], zoom: 2 })
          ]
        );
        return res.status(201).json({ success: true, map: result.rows[0] });
      }

      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    // Handle /api/map/[id] - Get, Update, or Delete specific map
    if (req.method === 'GET') {
      // Get specific map with zones
      const mapResult = await pool.query(
        `SELECT 
          m.*,
          c.first_name || ' ' || c.last_name as customer_name,
          c.email as customer_email
         FROM map m
         LEFT JOIN customer c ON m.customer_id = c.customer_id
         WHERE m.map_id = $1`,
        [id]
      );

      if (mapResult.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Map not found' 
        });
      }

      // Get zones for this map
      const zonesResult = await pool.query(
        'SELECT * FROM zones WHERE map_id = $1 ORDER BY created_at DESC',
        [id]
      );

      const map = {
        ...mapResult.rows[0],
        zones: zonesResult.rows
      };

      return res.status(200).json({ 
        success: true, 
        map 
      });
    }

    if (req.method === 'PUT') {
      // Update map
      const { title, description, country, active, map_data, map_bounds } = req.body;

      const result = await pool.query(
        `UPDATE map 
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             country = COALESCE($3, country),
             active = COALESCE($4, active),
             map_data = COALESCE($5, map_data),
             map_bounds = COALESCE($6, map_bounds)
         WHERE map_id = $7
         RETURNING *`,
        [
          title || null, 
          description || null, 
          country || null, 
          active !== undefined ? active : null,
          map_data ? JSON.stringify(map_data) : null,
          map_bounds ? JSON.stringify(map_bounds) : null,
          id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Map not found' 
        });
      }

      return res.status(200).json({ 
        success: true, 
        map: result.rows[0],
        message: 'Map updated successfully'
      });
    }

    if (req.method === 'DELETE') {
      // Delete map and its zones (cascading)
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Delete zones first
        await client.query('DELETE FROM zones WHERE map_id = $1', [id]);
        
        // Delete customer_map relationships
        await client.query('DELETE FROM customer_map WHERE map_id = $1', [id]);
        
        // Delete map
        const result = await client.query(
          'DELETE FROM map WHERE map_id = $1 RETURNING map_id',
          [id]
        );

        if (result.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ 
            success: false, 
            error: 'Map not found' 
          });
        }

        await client.query('COMMIT');

        return res.status(200).json({ 
          success: true, 
          message: 'Map and associated data deleted successfully' 
        });

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }

    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });

  } catch (error) {
    console.error('Map API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
