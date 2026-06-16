import db from '../db.js';
import express from 'express';
const router = express.Router();

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.get('/', (req, res) => {
  const { status, q, sort } = req.query;

  let query = `
    SELECT m.*,
      (SELECT COUNT(*) FROM volumes WHERE manga_id = m.id AND status = 'read') as volumes_read,
      (SELECT COUNT(*) FROM volumes WHERE manga_id = m.id) as volumes_total,
      (SELECT v.isbn FROM volumes v WHERE v.manga_id = m.id ORDER BY v.volume_number ASC NULLS LAST, v.id ASC LIMIT 1) as first_volume_isbn
    FROM mangas m
    WHERE 1=1
  `;
  const params = [];

  if (q) {
    query += ' AND (m.title LIKE ? OR m.author LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  if (status && status !== 'all') {
    if (status === 'read') {
      query += ` AND (SELECT COUNT(*) FROM volumes WHERE manga_id = m.id AND status = 'read') = (SELECT COUNT(*) FROM volumes WHERE manga_id = m.id) AND (SELECT COUNT(*) FROM volumes WHERE manga_id = m.id) > 0`;
    } else if (status === 'reading') {
      query += ` AND (SELECT COUNT(*) FROM volumes WHERE manga_id = m.id AND status = 'reading') > 0`;
    } else if (status === 'unread') {
      query += ` AND (SELECT COUNT(*) FROM volumes WHERE manga_id = m.id AND status = 'read') = 0 AND (SELECT COUNT(*) FROM volumes WHERE manga_id = m.id) > 0`;
    } else if (status === 'no_volumes') {
      query += ` AND (SELECT COUNT(*) FROM volumes WHERE manga_id = m.id) = 0`;
    }
  }

  const orderMap = {
    title: 'm.title ASC',
    date: 'm.created_at DESC',
    progress: '(CAST((SELECT COUNT(*) FROM volumes WHERE manga_id = m.id AND status = "read") AS FLOAT) / NULLIF((SELECT COUNT(*) FROM volumes WHERE manga_id = m.id), 0)) DESC'
  };
  const VALID_SORTS = ['title', 'date', 'progress'];
  const sortOrder = VALID_SORTS.includes(sort) ? sort : 'date';
  query += ` ORDER BY ${orderMap[sortOrder]}`;

  const mangas = db.prepare(query).all(...params);
  res.json(mangas);
});

router.get('/:id', (req, res) => {
  const { sort } = req.query;

  const manga = db.prepare('SELECT * FROM mangas WHERE id = ?').get(req.params.id);
  if (!manga) return res.status(404).json({ error: 'Manga not found' });

  const VALID_VOLUME_SORTS = ['alphabetical', 'date'];
  const volumeSortOrder = VALID_VOLUME_SORTS.includes(sort) ? sort : null;

  let orderClause = 'ORDER BY volume_number ASC NULLS LAST, title ASC, id ASC';
  if (volumeSortOrder === 'alphabetical') {
    orderClause = 'ORDER BY title ASC, volume_number ASC NULLS LAST, id ASC';
  } else if (volumeSortOrder === 'date') {
    orderClause = 'ORDER BY id DESC';
  }

  const volumes = db.prepare(`SELECT * FROM volumes WHERE manga_id = ? ${orderClause}`).all(req.params.id);
  res.json({ ...manga, volumes });
});

router.post('/', (req, res) => {
  const { title, author, publisher, cover_url, notes } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const result = db.prepare(`
      INSERT INTO mangas (title, author, publisher, cover_url, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, author, publisher, cover_url, notes);

    const manga = db.prepare('SELECT * FROM mangas WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(manga);
  } catch (err) {
    console.error('Error creating manga:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM mangas WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Manga not found' });

  const fields = [];
  const values = [];

  if (req.body.title !== undefined) {
    fields.push('title = ?');
    values.push(req.body.title);
  }
  if (req.body.author !== undefined) {
    fields.push('author = ?');
    values.push(req.body.author);
  }
  if (req.body.publisher !== undefined) {
    fields.push('publisher = ?');
    values.push(req.body.publisher);
  }
  if (req.body.cover_url !== undefined) {
    fields.push('cover_url = ?');
    values.push(req.body.cover_url);
  }
  if (req.body.notes !== undefined) {
    fields.push('notes = ?');
    values.push(req.body.notes);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.params.id);

  db.prepare(`UPDATE mangas SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  const manga = db.prepare('SELECT * FROM mangas WHERE id = ?').get(req.params.id);
  res.json(manga);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM mangas WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Manga not found' });
  res.status(204).send();
});

router.post('/:id/volumes', (req, res) => {
  const { isbn, title, volume_number, status, acquired, cover_url } = req.body;

  try {
    const result = db.prepare(`
      INSERT INTO volumes (manga_id, isbn, title, volume_number, status, acquired, cover_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.params.id, isbn, title || null, volume_number !== undefined ? volume_number : null, status || 'unread', acquired ? 1 : 0, cover_url || null);

    const volume = db.prepare('SELECT * FROM volumes WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(volume);
  } catch (err) {
    console.error('Error creating volume:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/volumes', (req, res) => {
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: 'Status is required' });

  db.prepare('UPDATE volumes SET status = ? WHERE manga_id = ?').run(status, req.params.id);

  const volumes = db.prepare('SELECT * FROM volumes WHERE manga_id = ? ORDER BY volume_number ASC NULLS LAST, title ASC, id ASC').all(req.params.id);
  res.json(volumes);
});

router.put('/:id/volumes/:volumeId', (req, res) => {
  const existing = db.prepare('SELECT * FROM volumes WHERE id = ? AND manga_id = ?').get(req.params.volumeId, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Volume not found' });

  const fields = []
  const values = []

  if (req.body.isbn !== undefined) {
    fields.push('isbn = ?')
    values.push(req.body.isbn || null)
  }
  if (req.body.title !== undefined) {
    fields.push('title = ?')
    values.push(req.body.title || null)
  }
  if (req.body.volume_number !== undefined) {
    fields.push('volume_number = ?')
    values.push(req.body.volume_number)
  }
  if (req.body.status !== undefined) {
    fields.push('status = ?')
    values.push(req.body.status)
  }
  if (req.body.acquired !== undefined) {
    fields.push('acquired = ?')
    values.push(req.body.acquired ? 1 : 0)
  }

  if (fields.length > 0) {
    db.prepare(`UPDATE volumes SET ${fields.join(', ')} WHERE id = ?`).run(...values, req.params.volumeId);
  }

  const volume = db.prepare('SELECT * FROM volumes WHERE id = ?').get(req.params.volumeId);
  res.json(volume);
});

router.delete('/:id/volumes/:volumeId', (req, res) => {
  const result = db.prepare('DELETE FROM volumes WHERE id = ? AND manga_id = ?').run(req.params.volumeId, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Volume not found' });
  res.status(204).send();
});

export default router;