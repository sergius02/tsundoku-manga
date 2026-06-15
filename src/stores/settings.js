import { defineStore } from 'pinia'
import { getApiConfig, updateApiConfig } from '../api/index.js'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    apis: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchApiConfig() {
      this.loading = true
      this.error = null
      try {
        this.apis = await getApiConfig()
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async toggleApi(name, enabled) {
      try {
        await updateApiConfig(name, enabled)
        const api = this.apis.find(a => a.name === name)
        if (api) api.enabled = enabled
      } catch (err) {
        this.error = err.message
        throw err
      }
    }
  }
})