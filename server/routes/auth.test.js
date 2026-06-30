import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import authRouter from './auth.js'

vi.mock('../db.js', () => ({
  default: {
    prepare: vi.fn(),
  },
}))

vi.mock('../auth.js', () => ({
  validateCredentials: vi.fn(),
  isAuthConfigured: vi.fn(),
}))

vi.mock('../middleware/auth.js', () => ({
  createSession: vi.fn().mockReturnValue({
    id: 'test-session-id',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }),
  deleteSession: vi.fn(),
  authMiddleware: vi.fn((req, res, next) => {
    if (!req.session) {
      req.session = { id: 'test-session' }
    }
    next()
  }),
  cleanupExpiredSessions: vi.fn(),
}))

import { validateCredentials, isAuthConfigured } from '../auth.js'
import { createSession, deleteSession, authMiddleware } from '../middleware/auth.js'

const app = express()
app.use(express.json())
app.use('/api/auth', authRouter)

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 503 when auth is not configured', async () => {
    isAuthConfigured.mockReturnValue(false)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test', password: 'test' })

    expect(res.status).toBe(503)
    expect(res.body.error).toBe('Authentication not configured on server')
  })

  it('returns 400 when username is missing', async () => {
    isAuthConfigured.mockReturnValue(true)
    validateCredentials.mockReturnValue(false)

    const res = await request(app).post('/api/auth/login').send({ password: 'test' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Username and password are required')
  })

  it('returns 400 when password is missing', async () => {
    isAuthConfigured.mockReturnValue(true)
    validateCredentials.mockReturnValue(false)

    const res = await request(app).post('/api/auth/login').send({ username: 'test' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Username and password are required')
  })

  it('returns 401 when credentials are invalid', async () => {
    isAuthConfigured.mockReturnValue(true)
    validateCredentials.mockReturnValue(false)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'wrong', password: 'wrong' })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid credentials')
  })

  it('returns 200 and session token when credentials are valid', async () => {
    isAuthConfigured.mockReturnValue(true)
    validateCredentials.mockReturnValue(true)
    createSession.mockReturnValue({
      id: 'valid-session-id',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBe('valid-session-id')
    expect(res.body.expires_at).toBeDefined()
    expect(res.headers['set-cookie']).toBeDefined()
  })
})

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when no session', async () => {
    authMiddleware.mockImplementation((req, res) => {
      res.status(401).json({ error: 'Unauthorized' })
    })

    const res = await request(app).post('/api/auth/logout')

    expect(res.status).toBe(401)
  })

  it('returns 200 when session is valid', async () => {
    authMiddleware.mockImplementation((req, res, next) => {
      req.session = { id: 'test-session' }
      next()
    })
    deleteSession.mockImplementation(() => {})

    const res = await request(app).post('/api/auth/logout')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})

describe('GET /api/auth/check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when no session', async () => {
    authMiddleware.mockImplementation((req, res) => {
      res.status(401).json({ error: 'Unauthorized' })
    })

    const res = await request(app).get('/api/auth/check')

    expect(res.status).toBe(401)
  })

  it('returns 200 when session is valid', async () => {
    authMiddleware.mockImplementation((req, res, next) => {
      req.session = { id: 'test-session' }
      next()
    })

    const res = await request(app).get('/api/auth/check')

    expect(res.status).toBe(200)
    expect(res.body.authenticated).toBe(true)
  })
})
