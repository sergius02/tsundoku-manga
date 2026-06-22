<template>
  <div class="page-container">
    <div class="form-header">
      <h1>{{ $t('add.title') }}</h1>
      <p>{{ $t('add.subtitle') }}</p>
    </div>

    <form class="manga-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title">{{ $t('manga.title') }} *</label>
        <input id="title" v-model="form.title" type="text" required />
      </div>

      <div class="form-group">
        <label for="author">{{ $t('manga.author') }}</label>
        <input id="author" v-model="form.author" type="text" />
      </div>

      <div class="form-group">
        <label for="publisher">{{ $t('manga.publisher') }}</label>
        <input id="publisher" v-model="form.publisher" type="text" />
      </div>

      <div class="form-group">
        <label for="cover_url">{{ $t('manga.coverUrl') }}</label>
        <input id="cover_url" v-model="form.cover_url" type="text" placeholder="https://..." />
      </div>

      <div class="form-group">
        <label for="notes">{{ $t('manga.notes') }}</label>
        <textarea
          id="notes"
          v-model="form.notes"
          rows="3"
          :placeholder="$t('add.notesPlaceholder')"
        />
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="form-actions">
        <router-link to="/" class="btn btn-ghost">
          {{ $t('common.cancel') }}
        </router-link>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          <span v-if="submitting" class="spinner-sm" />
          {{ $t('add.addManga') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { createManga } from '../api/index.js'

const { t } = useI18n()
const router = useRouter()

const form = ref({
  title: '',
  author: '',
  publisher: '',
  cover_url: '',
  notes: '',
})

const submitting = ref(false)
const error = ref('')

async function handleSubmit() {
  if (!form.value.title.trim()) {
    error.value = t('add.titleRequired')
    return
  }

  submitting.value = true
  error.value = ''

  try {
    const manga = await createManga(form.value)
    router.push(`/manga/${manga.id}`)
  } catch (err) {
    error.value = err.message || t('add.addError')
  } finally {
    submitting.value = false
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

.form-header p {
  color: var(--text-secondary);
}

.manga-form {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
}

.error-message {
  padding: 12px;
  background: rgba(230, 57, 70, 0.1);
  border-radius: 6px;
  color: var(--accent);
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
