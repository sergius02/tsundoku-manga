import express from 'express'
import { validateCredentials, isAuthConfigured } from '../auth.js'
import {
  createSession,
  deleteSession,
  authMiddleware,
  cleanupExpiredSessions,
} from '../middleware/auth.js'

const router = express.Router()

router.post('/login', (req, res) => {
  if (!isAuthConfigured()) {
    return res.status(503).json({ error: 'Authentication not configured on server' })
  }

  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  if (!validateCredentials(username, password)) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const session = createSession(req.headers['user-agent'])

  const isSecure =
    process.env.NODE_ENV === 'production'
      ? req.protocol === 'https' || req.get('X-Forwarded-Proto') === 'https'
      : false

  res.cookie('session_id', session.id, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  })

  cleanupExpiredSessions()

  res.json({
    token: session.id,
    expires_at: session.expires_at,
  })
})

router.post('/logout', authMiddleware, (req, res) => {
  deleteSession(req.session.id)

  res.clearCookie('session_id', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  })

  res.json({ success: true })
})

router.get('/check', authMiddleware, (req, res) => {
  res.json({ authenticated: true })
})

export { authMiddleware }
export default router
