import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import backupRouter from './backup.js'

vi.mock('../db.js', () => ({
  default: {
    prepare: vi.fn(),
    transaction: vi.fn(),
  },
}))

vi.mock('../middleware/auth.js', () => ({
  authMiddleware: vi.fn((req, res, next) => {
    req.session = { id: 'test-session' }
    next()
  }),
}))

import db from '../db.js'

const app = express()
app.use(express.json())
app.use('/api/backup', backupRouter)

describe('GET /api/backup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns backup data with correct structure', async () => {
    const mockMangas = [{ id: 1, title: 'Test Manga' }]
    const mockVolumes = [{ id: 1, manga_id: 1, volume_number: 1 }]
    const mockApiConfig = [{ id: 1, api_name: 'openlibrary', enabled: 1 }]

    db.prepare.mockImplementation(query => {
      if (query.includes('FROM mangas')) {
        return { all: () => mockMangas }
      }
      if (query.includes('FROM volumes')) {
        return { all: () => mockVolumes }
      }
      if (query.includes('FROM api_config')) {
        return { all: () => mockApiConfig }
      }
    })

    const res = await request(app).get('/api/backup')

    expect(res.status).toBe(200)
    expect(res.body.version).toBe(1)
    expect(res.body.exported_at).toBeDefined()
    expect(res.body.data.mangas).toEqual(mockMangas)
    expect(res.body.data.volumes).toEqual(mockVolumes)
    expect(res.body.data.api_config).toEqual(mockApiConfig)
  })

  it('returns empty arrays when no data exists', async () => {
    db.prepare.mockReturnValue({ all: () => [] })

    const res = await request(app).get('/api/backup')

    expect(res.status).toBe(200)
    expect(res.body.data.mangas).toEqual([])
    expect(res.body.data.volumes).toEqual([])
    expect(res.body.data.api_config).toEqual([])
  })
})

describe('POST /api/backup/restore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when backup format is invalid', async () => {
    const res = await request(app).post('/api/backup/restore').send({})

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid backup format')
  })

  it('returns 400 when backup version is unsupported', async () => {
    const res = await request(app).post('/api/backup/restore').send({ version: 999, data: {} })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Unsupported backup version')
  })

  it('returns 400 when data structure is invalid', async () => {
    const res = await request(app)
      .post('/api/backup/restore')
      .send({ version: 1, data: { mangas: 'not-array' } })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid backup data structure')
  })

  it('restores backup successfully with valid data', async () => {
    const mockBackup = {
      version: 1,
      exported_at: new Date().toISOString(),
      data: {
        mangas: [
          {
            id: 1,
            title: 'Test Manga',
            author: null,
            publisher: null,
            cover_url: null,
            notes: null,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
        ],
        volumes: [
          {
            id: 1,
            manga_id: 1,
            isbn: null,
            title: null,
            volume_number: 1,
            status: 'unread',
            acquired: 0,
            cover_url: null,
          },
        ],
        api_config: [{ id: 1, api_name: 'openlibrary', enabled: 1 }],
      },
    }

    const transactionMock = vi.fn()
    db.transaction.mockReturnValue(transactionMock)
    db.prepare.mockReturnValue({ run: vi.fn() })

    const res = await request(app).post('/api/backup/restore').send(mockBackup)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.message).toBe('Backup restored successfully')
    expect(transactionMock).toHaveBeenCalled()
  })
})
