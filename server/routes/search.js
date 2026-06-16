import express from 'express';
import { searchByISBN, searchByTitle, searchOpenLibraryISBNOnly } from '../services/openlibrary.js';
import { fetchGoogleBooksISBN } from '../services/googlebooks.js';
import db from '../db.js';

const router = express.Router();

function getGoogleBooksEnabled() {
  try {
    const row = db.prepare('SELECT enabled FROM api_config WHERE api_name = ?').get('googlebooks');
    return row ? row.enabled === 1 : true;
  } catch {
    return true;
  }
}

router.get('/', async (req, res) => {
  const { isbn, title } = req.query;

  if (!isbn && !title) {
    return res.status(400).json({ error: 'ISBN or title is required' });
  }

  if (isbn) {
    const cleanISBN = isbn.replace(/[-\s]/g, '');

    try {
      const openLibraryResult = await searchOpenLibraryISBNOnly(cleanISBN);

      if (openLibraryResult) {
        return res.json({ ...openLibraryResult, source: 'openlibrary' });
      }

      const openLibraryMissing = true;

      if (getGoogleBooksEnabled()) {
        try {
          const googleBooksResult = await fetchGoogleBooksISBN(cleanISBN);
          if (googleBooksResult) {
            return res.json({
              ...googleBooksResult,
              source: 'google',
              openLibraryMissing
            });
          }
        } catch (err) {
          console.warn('Google Books failed:', err.message);
        }
      }

      return res.status(404).json({
        error: 'No se encontraron resultados para este ISBN',
        openLibraryMissing,
        isbn: cleanISBN
      });
    } catch (err) {
      console.error('Search error:', err);
      return res.status(500).json({ error: 'Error al buscar en las APIs externas' });
    }
  }

  if (title) {
    try {
      const result = await searchByTitle(title, getGoogleBooksEnabled());

      if (!result) {
        return res.status(404).json({ error: 'No se encontraron resultados para este título' });
      }

      return res.json(result.data.map(item => ({ ...item, source: result.source })));
    } catch (err) {
      console.error('Search error:', err);
      return res.status(500).json({ error: 'Error al buscar en las APIs externas' });
    }
  }
});

export default router;