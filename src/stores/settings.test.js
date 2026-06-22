import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from './settings.js'

const mockGetApiConfig = vi.fn()
const mockUpdateApiConfig = vi.fn()

vi.mock('../api/index.js', () => ({
  getApiConfig: (...args) => mockGetApiConfig(...args),
  updateApiConfig: (...args) => mockUpdateApiConfig(...args),
}))

const mockApis = [
  { name: 'openlibrary', enabled: true, hasKey: true },
  { name: 'googlebooks', enabled: false, hasKey: false },
]

describe('useSettingsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('fetchApiConfig', () => {
    it('fetches API config and updates state', async () => {
      mockGetApiConfig.mockResolvedValue(mockApis)
      const store = useSettingsStore()

      await store.fetchApiConfig()

      expect(mockGetApiConfig).toHaveBeenCalled()
      expect(store.apis).toEqual(mockApis)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('sets error on failure', async () => {
      mockGetApiConfig.mockRejectedValue(new Error('Failed to fetch'))
      const store = useSettingsStore()

      await store.fetchApiConfig()

      expect(store.error).toBe('Failed to fetch')
      expect(store.loading).toBe(false)
    })
  })

  describe('toggleApi', () => {
    it('updates API enabled state', async () => {
      mockUpdateApiConfig.mockResolvedValue(undefined)
      const store = useSettingsStore()
      store.apis = [...mockApis]

      await store.toggleApi('googlebooks', true)

      expect(mockUpdateApiConfig).toHaveBeenCalledWith('googlebooks', true)
      const googleApi = store.apis.find(a => a.name === 'googlebooks')
      expect(googleApi.enabled).toBe(true)
    })

    it('throws error on failure', async () => {
      mockUpdateApiConfig.mockRejectedValue(new Error('Update failed'))
      const store = useSettingsStore()
      store.apis = [...mockApis]

      await expect(store.toggleApi('googlebooks', true)).rejects.toThrow('Update failed')
    })

    it('does nothing if API not found', async () => {
      mockUpdateApiConfig.mockResolvedValue(undefined)
      const store = useSettingsStore()
      store.apis = [...mockApis]

      await store.toggleApi('nonexistent', true)

      expect(mockUpdateApiConfig).toHaveBeenCalledWith('nonexistent', true)
    })
  })
})
