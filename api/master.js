import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Initialize the Neon HTTP connection
  const sql = neon(process.env.DATABASE_URL);
  
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    const { action } = req.query;
    try {
      if (action === 'lookup') {
        const rows = await sql`SELECT lookup FROM master_data WHERE id = 1`;
        return res.status(200).json(rows[0] || {});
      }
      if (action === 'meta') {
        const rows = await sql`SELECT row_count, uploaded_at FROM master_data WHERE id = 1`;
        return res.status(200).json(rows[0] || null);
      }
      return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { lookup, row_count, uploaded_at } = req.body;
    try {
      // Upsert the master data (always id = 1)
      await sql`
        INSERT INTO master_data (id, lookup, row_count, uploaded_at)
        VALUES (1, ${lookup}, ${row_count}, ${uploaded_at})
        ON CONFLICT (id) DO UPDATE SET 
          lookup = EXCLUDED.lookup, 
          row_count = EXCLUDED.row_count, 
          uploaded_at = EXCLUDED.uploaded_at
      `;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM master_data WHERE id = 1`;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
