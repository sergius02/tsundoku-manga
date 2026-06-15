import { defineStore } from 'pinia'
import { getMangas, getManga, createManga, updateManga, deleteManga } from '../api/index.js'

export const useMangaStore = defineStore('mangas', {
  state: () => ({
    mangas: [],
    currentManga: null,
    loading: false,
    error: null,
    filters: {
      status: 'all',
      q: '',
      sort: 'date'
    },
    volumeSort: 'number'
  }),

  actions: {
    async fetchMangas() {
      this.loading = true
      this.error = null
      try {
        this.mangas = await getMangas(this.filters)
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async fetchManga(id, sort = 'number') {
      this.loading = true
      this.error = null
      try {
        this.currentManga = await getManga(id, sort)
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async addManga(data) {
      const manga = await createManga(data)
      this.mangas.unshift(manga)
      return manga
    },

    async editManga(id, data) {
      const updated = await updateManga(id, data)
      const idx = this.mangas.findIndex(m => m.id === id)
      if (idx !== -1) this.mangas[idx] = { ...this.mangas[idx], ...updated }
      if (this.currentManga?.id === id) {
        this.currentManga = { ...this.currentManga, ...updated }
      }
      return updated
    },

    async removeManga(id) {
      await deleteManga(id)
      this.mangas = this.mangas.filter(m => m.id !== id)
      if (this.currentManga?.id === id) this.currentManga = null
    },

    updateVolumeState(volumeId, data) {
      if (!this.currentManga?.volumes) return
      const idx = this.currentManga.volumes.findIndex(v => v.id === volumeId)
      if (idx !== -1) {
        this.currentManga.volumes[idx] = { ...this.currentManga.volumes[idx], ...data }
      }
    },

    markAllVolumesReadLocal(mangaId) {
      const manga = this.mangas.find(m => m.id === mangaId)
      if (manga) {
        manga.volumes_read = manga.volumes_total
      }
      if (this.currentManga?.id === mangaId && this.currentManga?.volumes) {
        this.currentManga.volumes.forEach(v => {
          v.status = 'read'
        })
      }
    },

    markAllVolumesUnreadLocal(mangaId) {
      const manga = this.mangas.find(m => m.id === mangaId)
      if (manga) {
        manga.volumes_read = 0
      }
      if (this.currentManga?.id === mangaId && this.currentManga?.volumes) {
        this.currentManga.volumes.forEach(v => {
          v.status = 'unread'
        })
      }
    },

    setFilter(key, value) {
      this.filters[key] = value
      this.fetchMangas()
    },

    setVolumeSort(value) {
      this.volumeSort = value
    }
  }
})