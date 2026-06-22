import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth.js'

const mockFetch = vi.fn()

global.fetch = mockFetch

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('checkAuth', () => {
    it('returns true and sets isAuthenticated when auth check succeeds', async () => {
      mockFetch.mockResolvedValue({ ok: true })
      const store = useAuthStore()

      const result = await store.checkAuth()

      expect(result).toBe(true)
      expect(store.isAuthenticated).toBe(true)
      expect(store.loading).toBe(false)
    })

    it('returns false when auth check fails', async () => {
      mockFetch.mockResolvedValue({ ok: false })
      const store = useAuthStore()

      const result = await store.checkAuth()

      expect(result).toBe(false)
      expect(store.isAuthenticated).toBe(false)
    })

    it('returns false on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      const store = useAuthStore()

      const result = await store.checkAuth()

      expect(result).toBe(false)
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('login', () => {
    it('logs in successfully and sets isAuthenticated', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
      const store = useAuthStore()

      const result = await store.login('admin', 'password')

      expect(result).toBe(true)
      expect(store.isAuthenticated).toBe(true)
      expect(store.loading).toBe(false)
    })

    it('throws error on login failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid credentials' }),
      })
      const store = useAuthStore()

      await expect(store.login('admin', 'wrong')).rejects.toThrow('Invalid credentials')
      expect(store.error).toBe('Invalid credentials')
    })

    it('throws generic error when no error message in response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      })
      const store = useAuthStore()

      await expect(store.login('admin', 'wrong')).rejects.toThrow('Login failed')
    })

    it('sets loading while logging in', async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ ok: true, json: () => Promise.resolve({}) }), 10)
          )
      )
      const store = useAuthStore()

      const promise = store.login('admin', 'password')
      expect(store.loading).toBe(true)
      await promise
      expect(store.loading).toBe(false)
    })
  })

  describe('logout', () => {
    it('always sets isAuthenticated to false', async () => {
      mockFetch.mockResolvedValue({ ok: true })
      const store = useAuthStore()
      store.isAuthenticated = true

      await store.logout()

      expect(store.isAuthenticated).toBe(false)
    })

    it('does not throw on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      const store = useAuthStore()

      await expect(store.logout()).resolves.toBeUndefined()
      expect(store.isAuthenticated).toBe(false)
    })

    it('sets loading while logging out', async () => {
      mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({}), 10)))
      const store = useAuthStore()

      const promise = store.logout()
      expect(store.loading).toBe(true)
      await promise
      expect(store.loading).toBe(false)
    })
  })
})
