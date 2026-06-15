<template>
  <div class="page-container">
    <div class="form-header">
      <h1>{{ $t('settings.title') }}</h1>
    </div>

    <section class="settings-section">
      <h2>{{ $t('settings.apis') }}</h2>
      <p class="section-description">{{ $t('settings.apisDescription') }}</p>

      <div v-if="settingsStore.loading" class="loading">{{ $t('common.loading') }}</div>
      <div v-else-if="settingsStore.error" class="error-message">{{ settingsStore.error }}</div>

      <div v-else class="api-list">
        <div v-for="api in settingsStore.apis" :key="api.name" class="api-card">
          <div class="api-info">
            <div class="api-header">
              <span class="api-name">{{ $t(`settings.${api.name}`) }}</span>
              <span v-if="api.name === 'openlibrary'" class="api-badge mandatory">{{ $t('settings.mandatory') }}</span>
            </div>
            <p class="api-status">
              <span v-if="api.name === 'googlebooks' && api.enabled && !api.hasKey" class="warning-text">
                {{ $t('settings.apiKeyNeeded') }}
              </span>
              <span v-else-if="api.enabled" class="enabled-text">{{ $t('settings.enabled') }}</span>
              <span v-else class="disabled-text">{{ $t('settings.disabled') }}</span>
            </p>
          </div>
          <label class="toggle-switch">
            <input
              type="checkbox"
              :checked="api.enabled"
              :disabled="api.name === 'openlibrary'"
              @change="handleToggle(api.name, $event.target.checked)"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../stores/settings.js'

const { t } = useI18n()
const settingsStore = useSettingsStore()

onMounted(() => {
  settingsStore.fetchApiConfig()
})

async function handleToggle(name, enabled) {
  try {
    await settingsStore.toggleApi(name, enabled)
  } catch (err) {
    console.error('Failed to toggle API:', err)
  }
}
</script>

<style scoped>
.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.form-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.settings-section {
  max-width: 600px;
  margin: 0 auto;
}

.settings-section h2 {
  font-size: 20px;
  margin-bottom: 8px;
}

.section-description {
  color: var(--text-secondary);
  margin-bottom: 24px;
  font-size: 14px;
}

.loading {
  text-align: center;
  padding: 24px;
  color: var(--text-secondary);
}

.error-message {
  padding: 12px;
  background: rgba(230, 57, 70, 0.1);
  border-radius: 6px;
  color: var(--accent);
  font-size: 14px;
}

.api-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.api-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.api-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.api-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.api-name {
  font-weight: 600;
  font-size: 15px;
}

.api-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.api-badge.mandatory {
  background: rgba(230, 57, 70, 0.15);
  color: var(--accent);
}

.api-status {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.warning-text {
  color: #f59e0b;
}

.enabled-text {
  color: #22c55e;
}

.disabled-text {
  color: var(--text-secondary);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border);
  transition: 0.3s;
  border-radius: 26px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: var(--accent);
}

.toggle-switch input:disabled + .toggle-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(22px);
}
</style>