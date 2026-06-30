import express from 'express'
import db from '../db.js'

const router = express.Router()

router.get('/apis', (req, res) => {
  try {
    const apis = db.prepare('SELECT api_name, enabled FROM api_config').all()
    const result = apis.map(api => {
      const hasKey = api.api_name === 'googlebooks' ? !!process.env.GOOGLE_BOOKS_API_KEY : true
      const enabled = api.enabled === 1 && hasKey
      return {
        name: api.api_name,
        enabled,
        hasKey,
      }
    })
    res.json(result)
  } catch (err) {
    console.error('Error fetching API config:', err)
    res.status(500).json({ error: 'Error al obtener configuración' })
  }
})

router.put('/apis/:name', (req, res) => {
  const { name } = req.params
  const { enabled } = req.body

  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'enabled debe ser booleano' })
  }

  if (name === 'openlibrary') {
    return res.status(400).json({ error: 'OpenLibrary no puede desactivarse' })
  }

  if (name === 'googlebooks' && enabled && !process.env.GOOGLE_BOOKS_API_KEY) {
    return res.status(400).json({ error: 'Google Books API no puede activarse sin API Key' })
  }

  try {
    const result = db
      .prepare('UPDATE api_config SET enabled = ? WHERE api_name = ?')
      .run(enabled ? 1 : 0, name)
    if (result.changes === 0) {
      return res.status(404).json({ error: 'API no encontrada' })
    }
    res.json({ name, enabled })
  } catch (err) {
    console.error('Error updating API config:', err)
    res.status(500).json({ error: 'Error al actualizar configuración' })
  }
})

export default router
