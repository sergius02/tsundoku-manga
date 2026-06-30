import { ref, computed, watch } from 'vue'
import { getBookInfoByISBN } from '../api/covers.js'

export function useCoverFetch(props) {
  const bookInfo = ref(null)
  const loading = ref(false)
  const imageLoaded = ref(false)
  const imageError = ref(false)

  const hasDirectCover = computed(() => !!props.tomo?.cover_url)
  const hasCoverUrl = computed(() => props.tomo?.cover_url || bookInfo.value?.cover_url)
  const displayCover = computed(() => {
    if (props.tomo?.cover_url) return props.tomo.cover_url
    if (bookInfo.value?.cover_url) return bookInfo.value.cover_url
    return null
  })
  const displayTitle = computed(() => {
    if (props.tomo?.title) return props.tomo.title
    if (props.tomo?.volume_number) return `Volume ${props.tomo.volume_number}`
    if (bookInfo.value?.title) return bookInfo.value.title
    return `Volume ${props.index + 1}`
  })
  const displayAuthor = computed(() => {
    if (props.tomo?.author) return props.tomo.author
    if (bookInfo.value?.author) return bookInfo.value.author.join(', ')
    return null
  })

  async function fetchBookInfo() {
    if (!props.tomo?.isbn) return

    loading.value = true
    try {
      bookInfo.value = await getBookInfoByISBN(props.tomo.isbn)
    } finally {
      loading.value = false
    }
  }

  function resetImageLoaded() {
    imageLoaded.value = !!props.tomo?.cover_url
    imageError.value = false
    bookInfo.value = null
  }

  watch(() => props.tomo?.id, resetImageLoaded, { immediate: true })
  watch(
    () => props.tomo?.cover_url,
    newVal => {
      if (newVal !== undefined) {
        bookInfo.value = null
      }
    }
  )

  watch(bookInfo, newVal => {
    if (newVal?.cover_url) {
      imageLoaded.value = true
    }
  })

  return {
    bookInfo,
    loading,
    imageLoaded,
    imageError,
    hasDirectCover,
    hasCoverUrl,
    displayCover,
    displayTitle,
    displayAuthor,
    fetchBookInfo,
    resetImageLoaded,
  }
}
