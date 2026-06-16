import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

const { mockDb, mockSearchOpenLibraryISBNOnly, mockSearchByTitle, mockFetchGoogleBooksISBN } = vi.hoisted(() => {
  return {
    mockDb: {
      prepare: vi.fn()
    },
    mockSearchOpenLibraryISBNOnly: vi.fn(),
    mockSearchByTitle: vi.fn(),
    mockFetchGoogleBooksISBN: vi.fn()
  }
})

vi.mock('../db.js', () => ({
  default: mockDb
}))

vi.mock('../services/openlibrary.js', () => ({
  searchByISBN: vi.fn(),
  searchByTitle: (...args) => mockSearchByTitle(...args),
  searchOpenLibraryISBNOnly: (...args) => mockSearchOpenLibraryISBNOnly(...args)
}))

vi.mock('../services/googlebooks.js', () => ({
  fetchGoogleBooksISBN: (...args) => mockFetchGoogleBooksISBN(...args),
  searchGoogleBooksByTitle: vi.fn()
}))

import mangasRouter from './mangas.js'
import searchRouter from './search.js'

const app = express()
app.use(express.json())
app.use('/api/mangas', mangasRouter)
app.use('/api/search', searchRouter)

const mockManga = {
  id: 1,
  title: 'Naruto',
  author: 'Masashi Kishimoto',
  publisher: 'Shueisha',
  cover_url: null,
  notes: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  volumes_read: 5,
  volumes_total: 10,
  first_volume_isbn: '978-1-2345-6789-0'
}

const mockVolume = {
  id: 1,
  manga_id: 1,
  isbn: '978-1-2345-6789-0',
  title: null,
  volume_number: 1,
  status: 'unread',
  acquired: false,
  cover_url: null
}

function createStmtMock(data) {
  return {
    all: vi.fn().mockReturnValue(data),
    get: vi.fn().mockReturnValue(data),
    run: vi.fn().mockReturnValue({ changes: 1, lastInsertRowid: 1 })
  }
}

function createRunMock(changes = 1) {
  return {
    all: vi.fn().mockReturnValue([]),
    get: vi.fn().mockReturnValue(null),
    run: vi.fn().mockReturnValue({ changes })
  }
}

function createApiConfigMock(enabled = 1) {
  return {
    all: vi.fn().mockReturnValue([{ enabled }]),
    get: vi.fn().mockReturnValue({ enabled })
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockDb.prepare.mockImplementation((query) => {
    if (query.includes('SELECT') && query.includes('COUNT')) {
      return createStmtMock([{ count: 0 }])
    }
    if (query.includes('SELECT') && query.includes('mangas')) {
      return createStmtMock([])
    }
    if (query.includes('SELECT') && query.includes('volumes')) {
      return createStmtMock([])
    }
    if (query.includes('INSERT') || query.includes('UPDATE') || query.includes('DELETE')) {
      return createRunMock(1)
    }
    return createStmtMock(null)
  })
})

describe('MANGAS - GET /api/mangas', () => {
  it('returns empty array when no mangas', async () => {
    mockDb.prepare.mockReturnValue(createStmtMock([]))

    const res = await request(app).get('/api/mangas')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns list of mangas', async () => {
    mockDb.prepare.mockReturnValue(createStmtMock([mockManga]))

    const res = await request(app).get('/api/mangas')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].title).toBe('Naruto')
  })

  it('filters by status=read', async () => {
    mockDb.prepare.mockReturnValue(createStmtMock([]))

    const res = await request(app).get('/api/mangas?status=read')

    expect(res.status).toBe(200)
  })

  it('filters by status=reading', async () => {
    mockDb.prepare.mockReturnValue(createStmtMock([]))

    const res = await request(app).get('/api/mangas?status=reading')

    expect(res.status).toBe(200)
  })

  it('filters by status=no_volumes', async () => {
    mockDb.prepare.mockReturnValue(createStmtMock([]))

    const res = await request(app).get('/api/mangas?status=no_volumes')

    expect(res.status).toBe(200)
  })

  it('filters by search query', async () => {
    mockDb.prepare.mockReturnValue(createStmtMock([mockManga]))

    const res = await request(app).get('/api/mangas?q=naruto')

    expect(res.status).toBe(200)
  })

  it('sorts by title', async () => {
    mockDb.prepare.mockReturnValue(createStmtMock([mockManga]))

    const res = await request(app).get('/api/mangas?sort=title')

    expect(res.status).toBe(200)
  })

  it('sorts by progress', async () => {
    mockDb.prepare.mockReturnValue(createStmtMock([mockManga]))

    const res = await request(app).get('/api/mangas?sort=progress')

    expect(res.status).toBe(200)
  })

  it('defaults to sort by date', async () => {
    mockDb.prepare.mockReturnValue(createStmtMock([mockManga]))

    const res = await request(app).get('/api/mangas')

    expect(res.status).toBe(200)
  })
})

describe('MANGAS - GET /api/mangas/:id', () => {
  it('returns manga with volumes', async () => {
    mockDb.prepare
      .mockReturnValueOnce(createStmtMock(mockManga))
      .mockReturnValueOnce(createStmtMock([mockVolume]))

    const res = await request(app).get('/api/mangas/1')

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Naruto')
    expect(res.body.volumes).toHaveLength(1)
  })

  it('returns 404 when manga not found', async () => {
    mockDb.prepare.mockReturnValue(createStmtMock(null))

    const res = await request(app).get('/api/mangas/999')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Manga not found')
  })

  it('returns manga with empty volumes', async () => {
    mockDb.prepare
      .mockReturnValueOnce(createStmtMock(mockManga))
      .mockReturnValueOnce(createStmtMock([]))

    const res = await request(app).get('/api/mangas/1')

    expect(res.status).toBe(200)
    expect(res.body.volumes).toHaveLength(0)
  })
})

describe('MANGAS - POST /api/mangas', () => {
  it('creates a new manga', async () => {
    mockDb.prepare
      .mockReturnValueOnce(createRunMock(1))
      .mockReturnValueOnce(createStmtMock({ ...mockManga, id: 2 }))

    const res = await request(app)
      .post('/api/mangas')
      .send({
        title: 'One Piece',
        author: 'Eiichiro Oda',
        publisher: 'Shueisha'
      })

    expect(res.status).toBe(201)
  })

  it('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/mangas')
      .send({ author: 'Test Author' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Title is required')
  })

  it('creates manga with only title', async () => {
    mockDb.prepare
      .mockReturnValueOnce(createRunMock(1))
      .mockReturnValueOnce(createStmtMock({ ...mockManga, id: 3, title: 'Solo Leveling' }))

    const res = await request(app)
      .post('/api/mangas')
      .send({ title: 'Solo Leveling' })

    expect(res.status).toBe(201)
  })

  it('returns 500 on database error', async () => {
    mockDb.prepare.mockImplementation(() => {
      throw new Error('Database error')
    })

    const res = await request(app)
      .post('/api/mangas')
      .send({ title: 'Test' })

    expect(res.status).toBe(500)
    expect(res.body.error).toBe('Internal server error')
  })
})

describe('MANGAS - PUT /api/mangas/:id', () => {
  it('updates manga title', async () => {
    mockDb.prepare
      .mockReturnValueOnce(createStmtMock(mockManga))
      .mockReturnValueOnce(createRunMock(1))
      .mockReturnValueOnce(createStmtMock({ ...mockManga, title: 'Naruto Updated' }))

    const res = await request(app)
      .put('/api/mangas/1')
      .send({ title: 'Naruto Updated' })

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Naruto Updated')
  })

  it('updates multiple fields', async () => {
    mockDb.prepare
      .mockReturnValueOnce(createStmtMock(mockManga))
      .mockReturnValueOnce(createRunMock(1))
      .mockReturnValueOnce(createStmtMock({ ...mockManga, author: 'New Author', publisher: 'New Publisher' }))

    const res = await request(app)
      .put('/api/mangas/1')
      .send({ author: 'New Author', publisher: 'New Publisher' })

    expect(res.status).toBe(200)
  })

  it('returns 404 when manga not found', async () => {
    mockDb.prepare.mockReturnValue(createStmtMock(null))

    const res = await request(app)
      .put('/api/mangas/999')
      .send({ title: 'Test' })

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Manga not found')
  })

  it('returns 400 when no fields to update', async () => {
    mockDb.prepare.mockReturnValueOnce(createStmtMock(mockManga))

    const res = await request(app)
      .put('/api/mangas/1')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('No fields to update')
  })
})

describe('MANGAS - DELETE /api/mangas/:id', () => {
  it('deletes manga', async () => {
    mockDb.prepare.mockReturnValue(createRunMock(1))

    const res = await request(app).delete('/api/mangas/1')

    expect(res.status).toBe(204)
  })

  it('returns 404 when manga not found', async () => {
    mockDb.prepare.mockReturnValue(createRunMock(0))

    const res = await request(app).delete('/api/mangas/999')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Manga not found')
  })
})

describe('MANGAS - POST /api/mangas/:id/volumes', () => {
  it('creates a volume', async () => {
    mockDb.prepare
      .mockReturnValueOnce(createRunMock(1))
      .mockReturnValueOnce(createStmtMock({ ...mockVolume, id: 2, volume_number: 2 }))

    const res = await request(app)
      .post('/api/mangas/1/volumes')
      .send({
        isbn: '978-1-2345-6789-1',
        volume_number: 2,
        status: 'unread',
        acquired: true
      })

    expect(res.status).toBe(201)
  })

  it('creates volume with defaults', async () => {
    mockDb.prepare
      .mockReturnValueOnce(createRunMock(1))
      .mockReturnValueOnce(createStmtMock({ ...mockVolume, id: 3, volume_number: 3, status: 'unread' }))

    const res = await request(app)
      .post('/api/mangas/1/volumes')
      .send({ volume_number: 3 })

    expect(res.status).toBe(201)
  })

  it('returns 500 on database error', async () => {
    mockDb.prepare.mockImplementation(() => {
      throw new Error('Database error')
    })

    const res = await request(app)
      .post('/api/mangas/1/volumes')
      .send({ volume_number: 1 })

    expect(res.status).toBe(500)
    expect(res.body.error).toBe('Internal server error')
  })
})

describe('MANGAS - PUT /api/mangas/:id/volumes', () => {
  it('updates all volumes status', async () => {
    mockDb.prepare.mockReturnValue(createStmtMock([mockVolume]))

    const res = await request(app)
      .put('/api/mangas/1/volumes')
      .send({ status: 'read' })

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('returns 400 when status is missing', async () => {
    const res = await request(app)
      .put('/api/mangas/1/volumes')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Status is required')
  })
})

describe('MANGAS - PUT /api/mangas/:id/volumes/:volumeId', () => {
  it('updates volume status', async () => {
    mockDb.prepare
      .mockReturnValueOnce(createStmtMock(mockVolume))
      .mockReturnValueOnce(createRunMock(1))
      .mockReturnValueOnce(createStmtMock({ ...mockVolume, status: 'read' }))

    const res = await request(app)
      .put('/api/mangas/1/volumes/1')
      .send({ status: 'read' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('read')
  })

  it('updates volume acquired status', async () => {
    mockDb.prepare
      .mockReturnValueOnce(createStmtMock(mockVolume))
      .mockReturnValueOnce(createRunMock(1))
      .mockReturnValueOnce(createStmtMock({ ...mockVolume, acquired: true }))

    const res = await request(app)
      .put('/api/mangas/1/volumes/1')
      .send({ acquired: true })

    expect(res.status).toBe(200)
    expect(res.body.acquired).toBe(true)
  })

  it('returns 404 when volume not found', async () => {
    mockDb.prepare.mockReturnValue(createStmtMock(null))

    const res = await request(app)
      .put('/api/mangas/1/volumes/999')
      .send({ status: 'read' })

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Volume not found')
  })
})

describe('MANGAS - DELETE /api/mangas/:id/volumes/:volumeId', () => {
  it('deletes volume', async () => {
    mockDb.prepare.mockReturnValue(createRunMock(1))

    const res = await request(app).delete('/api/mangas/1/volumes/1')

    expect(res.status).toBe(204)
  })

  it('returns 404 when volume not found', async () => {
    mockDb.prepare.mockReturnValue(createRunMock(0))

    const res = await request(app).delete('/api/mangas/1/volumes/999')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Volume not found')
  })
})

describe('SEARCH - GET /api/search', () => {
  it('returns 400 when no isbn or title provided', async () => {
    const res = await request(app).get('/api/search')

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('ISBN or title is required')
  })

  it('returns 400 with empty params', async () => {
    const res = await request(app).get('/api/search?isbn=&title=')

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('ISBN or title is required')
  })
})

describe('SEARCH - GET /api/search?isbn=', () => {
  const mockOpenLibraryResult = {
    title: 'Naruto, Volume 1',
    seriesName: 'Naruto',
    volumeNumber: 1,
    author: ['Masashi Kishimoto'],
    publisher: 'Shueisha',
    isbn: '978-1-2345-6789-0',
    cover_url: 'https://example.com/cover.jpg',
    pages: 200
  }

  const mockGoogleBooksResult = {
    title: 'Naruto: Volume 1',
    seriesName: 'Naruto',
    volumeNumber: 1,
    author: ['Masashi Kishimoto'],
    publisher: 'Viz Media',
    isbn: '978-1-2345-6789-0',
    cover_url: 'https://example.com/cover-gb.jpg',
    pages: 180
  }

  it('returns result from OpenLibrary', async () => {
    mockSearchOpenLibraryISBNOnly.mockResolvedValue(mockOpenLibraryResult)

    const res = await request(app).get('/api/search?isbn=978-1-2345-6789-0')

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Naruto, Volume 1')
    expect(res.body.source).toBe('openlibrary')
  })

  it('returns result from OpenLibrary (ISBN normalized)', async () => {
    mockSearchOpenLibraryISBNOnly.mockResolvedValue(mockOpenLibraryResult)

    const res = await request(app).get('/api/search?isbn=978-1-2345-6789-0')

    expect(res.status).toBe(200)
    expect(mockSearchOpenLibraryISBNOnly).toHaveBeenCalledWith('9781234567890')
  })

  it('falls back to Google Books when OpenLibrary returns null', async () => {
    mockSearchOpenLibraryISBNOnly.mockResolvedValue(null)
    mockFetchGoogleBooksISBN.mockResolvedValue(mockGoogleBooksResult)

    const res = await request(app).get('/api/search?isbn=978-1-2345-6789-0')

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Naruto: Volume 1')
    expect(res.body.source).toBe('google')
    expect(res.body.openLibraryMissing).toBe(true)
  })

  it('skips Google Books when disabled in config', async () => {
    mockSearchOpenLibraryISBNOnly.mockResolvedValue(null)
    mockFetchGoogleBooksISBN.mockResolvedValue(mockGoogleBooksResult)
    mockDb.prepare.mockReturnValue(createApiConfigMock(0))

    const res = await request(app).get('/api/search?isbn=978-1-2345-6789-0')

    expect(res.status).toBe(404)
    expect(mockFetchGoogleBooksISBN).not.toHaveBeenCalled()
  })

  it('returns 404 when not found in any API', async () => {
    mockSearchOpenLibraryISBNOnly.mockResolvedValue(null)
    mockFetchGoogleBooksISBN.mockResolvedValue(null)

    const res = await request(app).get('/api/search?isbn=9780000000000')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('No se encontraron resultados para este ISBN')
    expect(res.body.isbn).toBe('9780000000000')
    expect(res.body.openLibraryMissing).toBe(true)
  })

  it('handles Google Books API error gracefully', async () => {
    mockSearchOpenLibraryISBNOnly.mockResolvedValue(null)
    mockFetchGoogleBooksISBN.mockRejectedValue(new Error('Google API error'))

    const res = await request(app).get('/api/search?isbn=978-1-2345-6789-0')

    expect(res.status).toBe(404)
    expect(res.body.openLibraryMissing).toBe(true)
  })

  it('returns 500 when OpenLibrary API errors', async () => {
    mockSearchOpenLibraryISBNOnly.mockRejectedValue(new Error('OpenLibrary API error'))

    const res = await request(app).get('/api/search?isbn=978-1-2345-6789-0')

    expect(res.status).toBe(500)
    expect(res.body.error).toBe('Error al buscar en las APIs externas')
  })

  it('returns 500 when both APIs fail', async () => {
    mockSearchOpenLibraryISBNOnly.mockRejectedValue(new Error('OpenLibrary error'))
    mockFetchGoogleBooksISBN.mockRejectedValue(new Error('Google error'))

    const res = await request(app).get('/api/search?isbn=978-1-2345-6789-0')

    expect(res.status).toBe(500)
    expect(res.body.error).toBe('Error al buscar en las APIs externas')
  })
})

describe('SEARCH - GET /api/search?title=', () => {
  const mockTitleResults = [
    { title: 'Naruto', seriesName: 'Naruto', volumeNumber: null, author: ['Masashi Kishimoto'] },
    { title: 'Naruto Volume 1', seriesName: 'Naruto', volumeNumber: 1, author: ['Masashi Kishimoto'] }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.prepare.mockReturnValue(createApiConfigMock(1))
  })

  it('returns results from OpenLibrary', async () => {
    mockSearchByTitle.mockResolvedValue({ source: 'openlibrary', data: mockTitleResults })

    const res = await request(app).get('/api/search?title=Naruto')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(res.body[0].source).toBe('openlibrary')
  })

  it('returns 404 when title not found', async () => {
    mockSearchByTitle.mockResolvedValue(null)

    const res = await request(app).get('/api/search?title=NonExistentMangaXYZ123')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('No se encontraron resultados para este título')
  })

  it('returns 500 when API errors', async () => {
    mockSearchByTitle.mockRejectedValue(new Error('API error'))

    const res = await request(app).get('/api/search?title=Naruto')

    expect(res.status).toBe(500)
    expect(res.body.error).toBe('Error al buscar en las APIs externas')
  })
})
