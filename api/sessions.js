import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    const { action, sessionId } = req.query;
    try {
      if (action === 'all') {
        const rows = await sql`SELECT row_data FROM training_sessions ORDER BY created_at ASC`;
        return res.status(200).json(rows.map(r => r.row_data));
      }
      if (action === 'meta') {
        const rows = await sql`SELECT session_id, created_at FROM training_sessions`;
        return res.status(200).json(rows);
      }
      if (action === 'exists') {
        const rows = await sql`SELECT id FROM training_sessions WHERE session_id = ${sessionId} LIMIT 1`;
        return res.status(200).json({ exists: rows.length > 0 });
      }
      return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { records } = req.body;
    try {
      // records is an array of { session_id, row_data }
      // We use json_to_recordset to efficiently bulk insert array data
      await sql`
        INSERT INTO training_sessions (session_id, row_data)
        SELECT * FROM json_to_recordset(${JSON.stringify(records)}::json) AS x(session_id text, row_data jsonb)
      `;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM training_sessions WHERE id > 0`;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
