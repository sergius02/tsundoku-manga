import express from 'express'
import db from '../db.js'

const router = express.Router()

const BACKUP_VERSION = 1

router.get('/', (req, res) => {
  try {
    const mangas = db.prepare('SELECT * FROM mangas').all()
    const volumes = db.prepare('SELECT * FROM volumes').all()
    const apiConfig = db.prepare('SELECT * FROM api_config').all()

    res.json({
      version: BACKUP_VERSION,
      exported_at: new Date().toISOString(),
      data: {
        mangas,
        volumes,
        api_config: apiConfig,
      },
    })
  } catch (err) {
    console.error('Error exporting backup:', err)
    res.status(500).json({ error: 'Error al exportar backup' })
  }
})

router.post('/restore', (req, res) => {
  try {
    const { version, data } = req.body

    if (!version || !data) {
      return res.status(400).json({ error: 'Invalid backup format' })
    }

    if (version !== BACKUP_VERSION) {
      return res.status(400).json({ error: 'Unsupported backup version' })
    }

    const { mangas, volumes, api_config } = data

    if (!Array.isArray(mangas) || !Array.isArray(volumes) || !Array.isArray(api_config)) {
      return res.status(400).json({ error: 'Invalid backup data structure' })
    }

    const restoreTransaction = db.transaction(() => {
      db.prepare('DELETE FROM volumes').run()
      db.prepare('DELETE FROM mangas').run()
      db.prepare('DELETE FROM api_config').run()

      const insertManga = db.prepare(`
        INSERT INTO mangas (id, title, author, publisher, cover_url, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      for (const manga of mangas) {
        insertManga.run(
          manga.id,
          manga.title,
          manga.author,
          manga.publisher,
          manga.cover_url,
          manga.notes,
          manga.created_at,
          manga.updated_at
        )
      }

      const insertVolume = db.prepare(`
        INSERT INTO volumes (id, manga_id, isbn, title, volume_number, status, acquired, cover_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      for (const volume of volumes) {
        insertVolume.run(
          volume.id,
          volume.manga_id,
          volume.isbn,
          volume.title,
          volume.volume_number,
          volume.status,
          volume.acquired ? 1 : 0,
          volume.cover_url
        )
      }

      const insertApiConfig = db.prepare(`
        INSERT INTO api_config (id, api_name, enabled)
        VALUES (?, ?, ?)
      `)
      for (const api of api_config) {
        insertApiConfig.run(api.id, api.api_name, api.enabled)
      }

      db.prepare('INSERT OR IGNORE INTO api_config (api_name, enabled) VALUES (?, ?)').run(
        'openlibrary',
        1
      )
      db.prepare('INSERT OR IGNORE INTO api_config (api_name, enabled) VALUES (?, ?)').run(
        'googlebooks',
        1
      )
    })

    restoreTransaction()

    res.json({ success: true, message: 'Backup restored successfully' })
  } catch (err) {
    console.error('Error restoring backup:', err)
    res.status(500).json({ error: 'Error al restaurar backup' })
  }
})

export default router
