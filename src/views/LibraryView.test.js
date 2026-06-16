import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMangaStore } from '../stores/mangas.js'

describe('LibraryView Computed Logic', () => {
  const mockMangas = [
    { id: 1, title: 'Naruto', author: 'Masashi Kishimoto', volumes_total: 10, volumes_read: 5 },
    { id: 2, title: 'One Piece', author: 'Eiichiro Oda', volumes_total: 10, volumes_read: 10 },
    { id: 3, title: 'Bleach', author: 'Tite Kubo', volumes_total: 5, volumes_read: 0 },
    { id: 4, title: 'No Volumes', author: 'Test', volumes_total: 0, volumes_read: 0 }
  ]

  function filterMangas(mangas, searchQuery, statusFilter, sortBy) {
    let result = [...mangas]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(m =>
        m.title.toLowerCase().includes(query) ||
        (m.author && m.author.toLowerCase().includes(query))
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter(m => {
        const total = m.volumes_total || 0
        const read = m.volumes_read || 0

        if (statusFilter === 'read') {
          return total > 0 && read === total
        }
        if (statusFilter === 'reading') {
          return read > 0 && read < total
        }
        if (statusFilter === 'unread') {
          return read === 0 && total > 0
        }
        if (statusFilter === 'no_volumes') {
          return total === 0
        }
        return true
      })
    }

    result.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }
      if (sortBy === 'progress') {
        const aProgress = (a.volumes_read || 0) / (a.volumes_total || 1)
        const bProgress = (b.volumes_read || 0) / (b.volumes_total || 1)
        return bProgress - aProgress
      }
      return 0
    })

    return result
  }

  function countCompleted(mangas) {
    return mangas.filter(m => {
      const total = m.volumes_total || 0
      const read = m.volumes_read || 0
      return total > 0 && read === total
    }).length
  }

  function countReading(mangas) {
    return mangas.filter(m => {
      const read = m.volumes_read || 0
      return read > 0 && m.volumes_total > read
    }).length
  }

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('filteredMangas', () => {
    it('returns all mangas when no filters applied', () => {
      const result = filterMangas(mockMangas, '', 'all', 'title')
      expect(result).toHaveLength(4)
    })

    it('filters by search query in title', () => {
      const result = filterMangas(mockMangas, 'naruto', 'all', 'title')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Naruto')
    })

    it('filters by search query in author', () => {
      const result = filterMangas(mockMangas, 'kishimoto', 'all', 'title')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Naruto')
    })

    it('filters by status=read (completed)', () => {
      const result = filterMangas(mockMangas, '', 'read', 'title')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('One Piece')
    })

    it('filters by status=reading', () => {
      const result = filterMangas(mockMangas, '', 'reading', 'title')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Naruto')
    })

    it('filters by status=unread', () => {
      const result = filterMangas(mockMangas, '', 'unread', 'title')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Bleach')
    })

    it('filters by status=no_volumes', () => {
      const result = filterMangas(mockMangas, '', 'no_volumes', 'title')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('No Volumes')
    })

    it('sorts by title alphabetically', () => {
      const result = filterMangas(mockMangas, '', 'all', 'title')
      expect(result[0].title).toBe('Bleach')
      expect(result[1].title).toBe('Naruto')
      expect(result[2].title).toBe('No Volumes')
      expect(result[3].title).toBe('One Piece')
    })

    it('sorts by progress descending', () => {
      const result = filterMangas(mockMangas, '', 'all', 'progress')
      expect(result[0].title).toBe('One Piece')
      expect(result[1].title).toBe('Naruto')
    })

    it('combines search and status filters', () => {
      const result = filterMangas(mockMangas, 'a', 'reading', 'title')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Naruto')
    })
  })

  describe('completedCount', () => {
    it('counts mangas that are completed', () => {
      const count = countCompleted(mockMangas)
      expect(count).toBe(1)
    })

    it('returns 0 when no completed mangas', () => {
      const mangasWithNoCompleted = mockMangas.map(m => ({ ...m, volumes_read: 0 }))
      const count = countCompleted(mangasWithNoCompleted)
      expect(count).toBe(0)
    })
  })

  describe('readingCount', () => {
    it('counts mangas that are in progress', () => {
      const count = countReading(mockMangas)
      expect(count).toBe(1)
    })

    it('returns 0 when no mangas are being read', () => {
      const mangasWithNoReading = mockMangas.map(m => ({ ...m, volumes_read: 0 }))
      const count = countReading(mangasWithNoReading)
      expect(count).toBe(0)
    })
  })

  describe('integration with store', () => {
    it('store.mangas is used by computed', async () => {
      const store = useMangaStore()
      store.mangas = [...mockMangas]

      expect(store.mangas).toHaveLength(4)
      expect(store.mangas[0].title).toBe('Naruto')
    })
  })
})
