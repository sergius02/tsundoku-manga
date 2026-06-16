const bookDataCache = new Map();
const pendingRequests = new Map();

const STORAGE_KEY_COVERS = 'tsundoku-covers';
const STORAGE_KEY_BOOK_INFO = 'tsundoku-book-info';

async function fetchBookData(isbn) {
  if (!isbn) return null;

  if (bookDataCache.has(isbn)) {
    return bookDataCache.get(isbn);
  }

  if (pendingRequests.has(isbn)) {
    return pendingRequests.get(isbn);
  }

  const requestPromise = (async () => {
    try {
      const res = await fetch(`/api/search?isbn=${encodeURIComponent(isbn)}`);
      if (!res.ok) return null;

      const data = await res.json();
      if (!data || data.notFound) return null;

      bookDataCache.set(isbn, data);

      if (data.cover_url) {
        const stored = localStorage.getItem(STORAGE_KEY_COVERS);
        const covers = stored ? JSON.parse(stored) : {};
        covers[isbn] = data.cover_url;
        localStorage.setItem(STORAGE_KEY_COVERS, JSON.stringify(covers));
      }

      const storedInfo = localStorage.getItem(STORAGE_KEY_BOOK_INFO);
      const infos = storedInfo ? JSON.parse(storedInfo) : {};
      infos[isbn] = data;
      localStorage.setItem(STORAGE_KEY_BOOK_INFO, JSON.stringify(infos));

      return data;
    } catch (err) {
      console.warn('Error fetching book data:', err);
      return null;
    } finally {
      pendingRequests.delete(isbn);
    }
  })();

  pendingRequests.set(isbn, requestPromise);
  return requestPromise;
}

export async function getBookInfoByISBN(isbn) {
  if (!isbn) return null;

  if (bookDataCache.has(isbn)) {
    return bookDataCache.get(isbn);
  }

  const storedInfo = localStorage.getItem(STORAGE_KEY_BOOK_INFO);
  if (storedInfo) {
    try {
      const infos = JSON.parse(storedInfo);
      if (infos[isbn]) {
        bookDataCache.set(isbn, infos[isbn]);
        return infos[isbn];
      }
    } catch (e) {}
  }

  return fetchBookData(isbn);
}

export async function getCoverByISBN(isbn) {
  if (!isbn) return null;

  if (bookDataCache.has(isbn)) {
    return bookDataCache.get(isbn)?.cover_url || null;
  }

  const stored = localStorage.getItem(STORAGE_KEY_COVERS);
  if (stored) {
    try {
      const covers = JSON.parse(stored);
      if (covers[isbn]) {
        return covers[isbn];
      }
    } catch (e) {}
  }

  const data = await fetchBookData(isbn);
  return data?.cover_url || null;
}

export function cacheBookData(isbn, data) {
  if (!isbn || !data) return;

  bookDataCache.set(isbn, data);

  if (data.cover_url) {
    const stored = localStorage.getItem(STORAGE_KEY_COVERS);
    const covers = stored ? JSON.parse(stored) : {};
    covers[isbn] = data.cover_url;
    localStorage.setItem(STORAGE_KEY_COVERS, JSON.stringify(covers));
  }

  const storedInfo = localStorage.getItem(STORAGE_KEY_BOOK_INFO);
  const infos = storedInfo ? JSON.parse(storedInfo) : {};
  infos[isbn] = data;
  localStorage.setItem(STORAGE_KEY_BOOK_INFO, JSON.stringify(infos));
}

function loadFromStorage() {
  const storedCovers = localStorage.getItem(STORAGE_KEY_COVERS);
  if (storedCovers) {
    try {
      const covers = JSON.parse(storedCovers);
      Object.entries(covers).forEach(([isbn, url]) => {
        const existing = bookDataCache.get(isbn);
        if (!existing) {
          bookDataCache.set(isbn, { cover_url: url });
        }
      });
    } catch (e) {}
  }

  const storedInfo = localStorage.getItem(STORAGE_KEY_BOOK_INFO);
  if (storedInfo) {
    try {
      const infos = JSON.parse(storedInfo);
      Object.entries(infos).forEach(([isbn, info]) => {
        if (!bookDataCache.has(isbn)) {
          bookDataCache.set(isbn, info);
        }
      });
    } catch (e) {}
  }
}

loadFromStorage();
