import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  actions: {
    async checkAuth() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch('/api/auth/check', {
          credentials: 'include'
        })
        if (res.ok) {
          this.isAuthenticated = true
          return true
        }
        this.isAuthenticated = false
        return false
      } catch (err) {
        this.isAuthenticated = false
        return false
      } finally {
        this.loading = false
      }
    },

    async login(username, password) {
      this.loading = true
      this.error = null
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, password })
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Login failed')
        }

        this.isAuthenticated = true
        return true
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })
      } catch (err) {
        console.error('Logout error:', err)
      } finally {
        this.isAuthenticated = false
        this.loading = false
      }
    }
  }
})