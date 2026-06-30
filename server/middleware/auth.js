import crypto from 'crypto'
import db from '../db.js'
import { isAuthConfigured } from '../auth.js'

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000

export function generateSessionId() {
  return crypto.randomBytes(32).toString('hex')
}

export function createSession(userAgent) {
  const session = {
    id: generateSessionId(),
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
    user_agent: userAgent || null,
  }

  db.prepare('INSERT INTO auth_sessions (id, expires_at, user_agent) VALUES (?, ?, ?)').run(
    session.id,
    session.expires_at,
    session.user_agent
  )

  return session
}

export function validateSession(sessionId) {
  if (!sessionId) return null

  const session = db
    .prepare("SELECT * FROM auth_sessions WHERE id = ? AND expires_at > datetime('now')")
    .get(sessionId)
  return session || null
}

export function deleteSession(sessionId) {
  db.prepare('DELETE FROM auth_sessions WHERE id = ?').run(sessionId)
}

export function cleanupExpiredSessions() {
  db.prepare("DELETE FROM auth_sessions WHERE expires_at <= datetime('now')").run()
}

export function authMiddleware(req, res, next) {
  if (!isAuthConfigured()) {
    return res.status(503).json({ error: 'Authentication not configured on server' })
  }

  let sessionId = null

  const cookieHeader = req.headers.cookie
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [key, ...val] = c.trim().split('=')
        return [key, val.join('=')]
      })
    )
    sessionId = cookies['session_id']
  }

  if (!sessionId) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionId = authHeader.slice(7)
    }
  }

  const session = validateSession(sessionId)

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  req.session = session
  next()
}
