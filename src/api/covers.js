const coverCache = new Map();
const bookInfoCache = new Map();

export async function getBookInfoByISBN(isbn) {
  if (!isbn) return null;

  if (bookInfoCache.has(isbn)) {
    return bookInfoCache.get(isbn);
  }

  try {
    const res = await fetch(`/api/search?isbn=${encodeURIComponent(isbn)}`)
    if (res.ok) {
      const data = await res.json()
      bookInfoCache.set(isbn, data)

      if (data.cover_url) {
        const stored = localStorage.getItem('tsundoku-covers')
        const covers = stored ? JSON.parse(stored) : {}
        covers[isbn] = data.cover_url
        localStorage.setItem('tsundoku-covers', JSON.stringify(covers))
      }

      const storedInfo = localStorage.getItem('tsundoku-book-info')
      const infos = storedInfo ? JSON.parse(storedInfo) : {}
      infos[isbn] = data
      localStorage.setItem('tsundoku-book-info', JSON.stringify(infos))

      return data
    }
  } catch (err) {
    console.warn('Error fetching book info:', err)
  }

  return null
}

export async function getCoverByISBN(isbn) {
  if (!isbn) return null;

  if (coverCache.has(isbn)) {
    return coverCache.get(isbn);
  }

  const stored = localStorage.getItem('tsundoku-covers')
  if (stored) {
    try {
      const covers = JSON.parse(stored)
      if (covers[isbn]) {
        coverCache.set(isbn, covers[isbn])
        return covers[isbn]
      }
    } catch (e) {}
  }

  try {
    const res = await fetch(`/api/search?isbn=${encodeURIComponent(isbn)}`)
    if (res.ok) {
      const data = await res.json()
      const coverUrl = data.cover_url || null
      coverCache.set(isbn, coverUrl)

      if (coverUrl) {
        const stored = localStorage.getItem('tsundoku-covers')
        const covers = stored ? JSON.parse(stored) : {}
        covers[isbn] = coverUrl
        localStorage.setItem('tsundoku-covers', JSON.stringify(covers))
      }

      return coverUrl
    }
  } catch (err) {
    console.warn('Error fetching cover:', err)
  }

  return null
}

function loadFromStorage() {
  const storedCovers = localStorage.getItem('tsundoku-covers')
  if (storedCovers) {
    try {
      const covers = JSON.parse(storedCovers)
      Object.entries(covers).forEach(([isbn, url]) => {
        coverCache.set(isbn, url)
      })
    } catch (e) {}
  }

  const storedInfo = localStorage.getItem('tsundoku-book-info')
  if (storedInfo) {
    try {
      const infos = JSON.parse(storedInfo)
      Object.entries(infos).forEach(([isbn, info]) => {
        bookInfoCache.set(isbn, info)
      })
    } catch (e) {}
  }
}

loadFromStorage()