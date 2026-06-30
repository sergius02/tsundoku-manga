<template>
  <div class="page-container">
    <div class="form-header">
      <h1>{{ $t('settings.title') }}</h1>
    </div>

    <section class="settings-section">
      <h2>{{ $t('settings.apis') }}</h2>
      <p class="section-description">
        {{ $t('settings.apisDescription') }}
      </p>

      <div v-if="settingsStore.loading" class="loading">
        {{ $t('common.loading') }}
      </div>
      <div v-else-if="settingsStore.error" class="error-message">
        {{ settingsStore.error }}
      </div>

      <div v-else class="api-list">
        <div v-for="api in settingsStore.apis" :key="api.name" class="api-card">
          <div class="api-info">
            <div class="api-header">
              <span class="api-name">{{ $t(`settings.${api.name}`) }}</span>
              <span v-if="api.name === 'openlibrary'" class="api-badge mandatory">{{
                $t('settings.mandatory')
              }}</span>
            </div>
            <p class="api-status">
              <span v-if="api.name === 'googlebooks' && !api.hasKey" class="warning-text">
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
              :disabled="api.name === 'openlibrary' || (api.name === 'googlebooks' && !api.hasKey)"
              @change="handleToggle(api.name, $event.target.checked)"
            />
            <span class="toggle-slider" />
          </label>
        </div>
      </div>
    </section>

    <section class="settings-section backup-section">
      <h2>{{ $t('settings.backup') }}</h2>
      <p class="section-description">
        {{ $t('settings.backupDescription') }}
      </p>

      <div class="backup-warning">
        <p>{{ $t('settings.backupWarning') }}</p>
      </div>

      <div class="backup-actions">
        <button class="btn btn-secondary" :disabled="exporting" @click="handleExport">
          {{ exporting ? $t('common.loading') : $t('settings.export') }}
        </button>
        <button class="btn btn-primary" :disabled="importing" @click="openImportModal">
          {{ $t('settings.import') }}
        </button>
      </div>
    </section>

    <section class="settings-section about-section">
      <h2>{{ $t('settings.about.title') }}</h2>
      <div class="about-content">
        <p class="about-version">{{ $t('settings.about.version') }}: {{ version }}</p>
        <p>{{ $t('settings.about.description') }}</p>
        <p>{{ $t('settings.about.openSource') }}</p>
        <p>{{ $t('settings.about.collaborate') }}</p>
        <div class="about-links">
          <a
            href="https://github.com/sergius02/tsundoku-manga"
            target="_blank"
            rel="noopener"
            class="about-link"
          >
            <IconGithub size="sm" /> {{ $t('settings.about.github') }}
          </a>
          <span class="license-info">{{ $t('settings.about.license') }}: AGPL-3.0</span>
        </div>
      </div>
    </section>

    <div v-if="showFileModal" class="modal-overlay" @click.self="closeFileModal">
      <div class="modal">
        <h3>{{ $t('settings.import') }}</h3>
        <div class="file-input-wrapper">
          <label for="backup-file">{{ $t('settings.backupFile') }}</label>
          <input id="backup-file" type="file" accept=".json" @change="handleFileSelect" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeFileModal">
            {{ $t('common.cancel') }}
          </button>
          <button class="btn btn-primary" :disabled="!selectedFile" @click="openConfirmModal">
            {{ $t('common.next') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showConfirmModal" class="modal-overlay" @click.self="closeConfirmModal">
      <div class="modal">
        <h3>{{ $t('settings.restoreConfirmTitle') }}</h3>
        <p class="confirm-text">
          {{ $t('settings.restoreConfirmText') }}
        </p>
        <div v-if="pendingBackup" class="backup-info">
          <p>
            <strong>{{ $t('settings.backupDate') }}:</strong>
            {{ formatDate(pendingBackup.exported_at) }}
          </p>
          <p>
            <strong>{{ pendingBackup.data.mangas.length }}</strong>
            {{ $t('settings.backupMangas') }}
          </p>
          <p>
            <strong>{{ pendingBackup.data.volumes.length }}</strong>
            {{ $t('settings.backupVolumes') }}
          </p>
        </div>
        <div class="restore-input-wrapper">
          <label for="restore-confirm">{{ $t('settings.restoreConfirmInput') }}</label>
          <input
            id="restore-confirm"
            v-model="restoreConfirmation"
            type="text"
            :placeholder="$t('settings.restoreConfirmInput')"
          />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeConfirmModal">
            {{ $t('common.cancel') }}
          </button>
          <button
            class="btn btn-danger"
            :disabled="restoreConfirmation !== 'Tsundoku'"
            @click="handleRestore"
          >
            {{ $t('settings.restore') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../stores/settings.js'
import { useRouter } from 'vue-router'
import IconGithub from '../components/icons/IconGithub.vue'
import pkg from '../../package.json'

const { t } = useI18n()
const settingsStore = useSettingsStore()
const router = useRouter()

const version = pkg.version
const exporting = ref(false)
const importing = ref(false)
const showFileModal = ref(false)
const showConfirmModal = ref(false)
const selectedFile = ref(null)
const pendingBackup = ref(null)
const restoreConfirmation = ref('')

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

async function handleExport() {
  exporting.value = true
  try {
    await settingsStore.performExport()
  } catch (err) {
    console.error('Failed to export:', err)
  } finally {
    exporting.value = false
  }
}

function openImportModal() {
  showFileModal.value = true
  selectedFile.value = null
  pendingBackup.value = null
}

function closeFileModal() {
  showFileModal.value = false
  selectedFile.value = null
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

async function openConfirmModal() {
  if (!selectedFile.value) return

  importing.value = true
  try {
    const text = await selectedFile.value.text()
    const data = JSON.parse(text)
    pendingBackup.value = data
    showFileModal.value = false
    showConfirmModal.value = true
    restoreConfirmation.value = ''
  } catch (err) {
    console.error('Failed to read file:', err)
    alert(t('settings.restoreError'))
  } finally {
    importing.value = false
  }
}

function closeConfirmModal() {
  showConfirmModal.value = false
  pendingBackup.value = null
  restoreConfirmation.value = ''
}

async function handleRestore() {
  if (restoreConfirmation.value !== 'Tsundoku') return

  importing.value = true
  try {
    await settingsStore.performImport(selectedFile.value)
    router.push('/')
    setTimeout(() => {
      window.location.reload()
    }, 100)
  } catch (err) {
    console.error('Failed to restore:', err)
    alert(t('settings.restoreError'))
  } finally {
    importing.value = false
  }
}

function formatDate(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleString()
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

.backup-section {
  margin-top: 48px;
}

.about-section {
  margin-top: 48px;
  margin-bottom: 48px;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.about-content p {
  margin: 0;
  line-height: 1.6;
  font-size: 14px;
  color: var(--text-secondary);
}

.about-version {
  font-weight: 600;
  font-size: 15px;
  color: var(--text);
}

.about-links {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  flex-wrap: wrap;
  gap: 12px;
}

.about-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition:
    background 0.2s,
    border-color 0.2s;
}

.about-link:hover {
  background: var(--bg-tertiary);
  border-color: var(--text-secondary);
}

.license-info {
  font-size: 13px;
  color: var(--text-secondary);
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
  content: '';
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

.backup-warning {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.backup-warning p {
  margin: 0;
  color: #f59e0b;
  font-size: 14px;
  line-height: 1.5;
}

.backup-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.2s,
    opacity 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-danger {
  background: #e63946;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  border: 1px solid var(--border);
}

.modal h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
}

.file-input-wrapper {
  margin-bottom: 20px;
}

.file-input-wrapper label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.file-input-wrapper input[type='file'] {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text);
  font-size: 14px;
}

.confirm-text {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  line-height: 1.5;
}

.backup-info {
  background: var(--bg-secondary);
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.backup-info p {
  margin: 4px 0;
  font-size: 13px;
}

.restore-input-wrapper {
  margin-bottom: 20px;
}

.restore-input-wrapper label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.restore-input-wrapper input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text);
  font-size: 14px;
  font-family: monospace;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
