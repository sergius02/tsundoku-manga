import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMangaStore } from './mangas.js'

const mockGetMangas = vi.fn()
const mockGetManga = vi.fn()
const mockCreateManga = vi.fn()
const mockUpdateManga = vi.fn()
const mockDeleteManga = vi.fn()

vi.mock('../api/index.js', () => ({
  getMangas: (...args) => mockGetMangas(...args),
  getManga: (...args) => mockGetManga(...args),
  createManga: (...args) => mockCreateManga(...args),
  updateManga: (...args) => mockUpdateManga(...args),
  deleteManga: (...args) => mockDeleteManga(...args)
}))

const mockMangas = [
  { id: 1, title: 'Naruto', author: 'Masashi Kishimoto', volumes_total: 10, volumes_read: 5 },
  { id: 2, title: 'One Piece', author: 'Eiichiro Oda', volumes_total: 10, volumes_read: 10 },
  { id: 3, title: 'Bleach', author: 'Tite Kubo', volumes_total: 5, volumes_read: 0 }
]

describe('useMangaStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('fetchMangas', () => {
    it('fetches mangas and updates state', async () => {
      mockGetMangas.mockResolvedValue(mockMangas)
      const store = useMangaStore()

      await store.fetchMangas()

      expect(mockGetMangas).toHaveBeenCalled()
      expect(store.mangas).toEqual(mockMangas)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('sets error on failure', async () => {
      mockGetMangas.mockRejectedValue(new Error('Network error'))
      const store = useMangaStore()

      await store.fetchMangas()

      expect(store.error).toBe('Network error')
      expect(store.loading).toBe(false)
    })

    it('sets loading state while fetching', async () => {
      mockGetMangas.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockMangas), 10)))
      const store = useMangaStore()

      const promise = store.fetchMangas()
      expect(store.loading).toBe(true)
      await promise
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchManga', () => {
    it('fetches single manga with volumes', async () => {
      const mangaWithVolumes = { ...mockMangas[0], volumes: [{ id: 1, volume_number: 1 }] }
      mockGetManga.mockResolvedValue(mangaWithVolumes)
      const store = useMangaStore()

      await store.fetchManga(1)

      expect(mockGetManga).toHaveBeenCalledWith(1, 'number')
      expect(store.currentManga).toEqual(mangaWithVolumes)
    })

    it('passes sort parameter to API', async () => {
      mockGetManga.mockResolvedValue({ id: 1, volumes: [] })
      const store = useMangaStore()

      await store.fetchManga(1, 'alphabetical')

      expect(mockGetManga).toHaveBeenCalledWith(1, 'alphabetical')
    })
  })

  describe('addManga', () => {
    it('creates manga and adds to beginning of list', async () => {
      const newManga = { id: 4, title: 'New Manga' }
      mockCreateManga.mockResolvedValue(newManga)
      const store = useMangaStore()
      store.mangas = [...mockMangas]

      const result = await store.addManga({ title: 'New Manga' })

      expect(mockCreateManga).toHaveBeenCalledWith({ title: 'New Manga' })
      expect(store.mangas[0]).toEqual(newManga)
      expect(result).toEqual(newManga)
    })
  })

  describe('editManga', () => {
    it('updates manga in the list', async () => {
      const updatedManga = { id: 1, title: 'Naruto Updated' }
      mockUpdateManga.mockResolvedValue(updatedManga)
      const store = useMangaStore()
      store.mangas = [...mockMangas]

      await store.editManga(1, { title: 'Naruto Updated' })

      expect(store.mangas[0].title).toBe('Naruto Updated')
    })

    it('updates currentManga if it matches', async () => {
      const updatedManga = { id: 1, title: 'Naruto Updated' }
      mockUpdateManga.mockResolvedValue(updatedManga)
      const store = useMangaStore()
      store.currentManga = { id: 1, title: 'Naruto' }

      await store.editManga(1, { title: 'Naruto Updated' })

      expect(store.currentManga.title).toBe('Naruto Updated')
    })

    it('does not update currentManga if different id', async () => {
      const updatedManga = { id: 2, title: 'One Piece Updated' }
      mockUpdateManga.mockResolvedValue(updatedManga)
      const store = useMangaStore()
      store.currentManga = { id: 1, title: 'Naruto' }

      await store.editManga(2, { title: 'One Piece Updated' })

      expect(store.currentManga.title).toBe('Naruto')
    })
  })

  describe('removeManga', () => {
    it('removes manga from list', async () => {
      mockDeleteManga.mockResolvedValue(undefined)
      const store = useMangaStore()
      store.mangas = [...mockMangas]

      await store.removeManga(1)

      expect(mockDeleteManga).toHaveBeenCalledWith(1)
      expect(store.mangas).toHaveLength(2)
      expect(store.mangas.find(m => m.id === 1)).toBeUndefined()
    })

    it('clears currentManga if deleted', async () => {
      mockDeleteManga.mockResolvedValue(undefined)
      const store = useMangaStore()
      store.currentManga = { id: 1, title: 'Naruto' }

      await store.removeManga(1)

      expect(store.currentManga).toBeNull()
    })
  })

  describe('updateVolumeState', () => {
    it('updates volume in currentManga', () => {
      const store = useMangaStore()
      store.currentManga = {
        id: 1,
        volumes: [
          { id: 1, status: 'unread' },
          { id: 2, status: 'read' }
        ]
      }

      store.updateVolumeState(1, { status: 'read' })

      expect(store.currentManga.volumes[0].status).toBe('read')
    })

    it('does nothing if no currentManga', () => {
      const store = useMangaStore()
      store.currentManga = null

      expect(() => store.updateVolumeState(1, { status: 'read' })).not.toThrow()
    })

    it('does nothing if volume not found', () => {
      const store = useMangaStore()
      store.currentManga = {
        id: 1,
        volumes: [{ id: 1, status: 'unread' }]
      }

      store.updateVolumeState(999, { status: 'read' })

      expect(store.currentManga.volumes[0].status).toBe('unread')
    })
  })

  describe('markAllVolumesReadLocal', () => {
    it('marks all volumes as read in currentManga', () => {
      const store = useMangaStore()
      store.currentManga = {
        id: 1,
        volumes: [
          { id: 1, status: 'unread' },
          { id: 2, status: 'reading' },
          { id: 3, status: 'unread' }
        ]
      }

      store.markAllVolumesReadLocal(1)

      expect(store.currentManga.volumes.every(v => v.status === 'read')).toBe(true)
    })

    it('updates manga in list', () => {
      const store = useMangaStore()
      store.mangas = [...mockMangas]

      store.markAllVolumesReadLocal(1)

      expect(store.mangas[0].volumes_read).toBe(store.mangas[0].volumes_total)
    })
  })

  describe('markAllVolumesUnreadLocal', () => {
    it('marks all volumes as unread in currentManga', () => {
      const store = useMangaStore()
      store.currentManga = {
        id: 1,
        volumes: [
          { id: 1, status: 'read' },
          { id: 2, status: 'read' }
        ]
      }

      store.markAllVolumesUnreadLocal(1)

      expect(store.currentManga.volumes.every(v => v.status === 'unread')).toBe(true)
    })

    it('sets volumes_read to 0 in list', () => {
      const store = useMangaStore()
      store.mangas = [...mockMangas]

      store.markAllVolumesUnreadLocal(1)

      expect(store.mangas[0].volumes_read).toBe(0)
    })
  })

  describe('setFilter', () => {
    it('updates filter and fetches mangas', async () => {
      mockGetMangas.mockResolvedValue([])
      const store = useMangaStore()

      store.setFilter('status', 'read')

      expect(store.filters.status).toBe('read')
      expect(mockGetMangas).toHaveBeenCalled()
    })
  })

  describe('setVolumeSort', () => {
    it('updates volumeSort', () => {
      const store = useMangaStore()

      store.setVolumeSort('alphabetical')

      expect(store.volumeSort).toBe('alphabetical')
    })
  })
})
