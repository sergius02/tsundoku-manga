import { defineStore } from 'pinia'
import { getApiConfig, updateApiConfig, exportBackup, importBackup } from '../api/index.js'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    apis: [],
    loading: false,
    error: null,
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
    },

    async performExport() {
      const data = await exportBackup()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const date = new Date().toISOString().split('T')[0]
      a.href = url
      a.download = `tsundoku-backup-${date}.json`
      a.click()
      URL.revokeObjectURL(url)
    },

    async performImport(file) {
      await importBackup(file)
    },
  },
})
