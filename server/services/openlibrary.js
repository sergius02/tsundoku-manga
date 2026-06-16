import { fetchGoogleBooksISBN, searchGoogleBooksByTitle } from './googlebooks.js';

const BASE_URL = 'https://openlibrary.org/api/books';

const VOLUME_PATTERNS = [
  /,?\s*vol\.?\s*(\d+)/i,
  /,?\s*tomo?\s*(\d+)/i,
  /,?\s*volume?\s*(\d+)/i,
  /,?\s*chapter\s*(\d+)/i,
  /,?\s*cahier\s*(\d+)/i,
  /(\d+)\s*(?:of\s*the\s*)?(?:series)?$/i,
  /#(\d+)\s*$/,
  /第(\d+)卷/i,
  /(\d+)巻$/,
];

export async function searchByISBN(isbn, googleBooksEnabled = true) {
  try {
    const data = await fetchOpenLibraryISBN(isbn);
    if (data) return { source: 'openlibrary', data };
  } catch (err) {
    console.warn('OpenLibrary failed, trying Google Books:', err.message);
  }

  if (!googleBooksEnabled) {
    console.warn('Google Books is disabled, skipping fallback');
    return null;
  }

  try {
    const data = await fetchGoogleBooksISBN(isbn);
    if (data) return { source: 'google', data };
  } catch (err) {
    console.warn('Google Books failed:', err.message);
  }

  return null;
}

export async function searchOpenLibraryISBNOnly(isbn) {
  try {
    const data = await fetchOpenLibraryISBN(isbn);
    if (data) return data;
  } catch (err) {
    console.warn('OpenLibrary ISBN search failed:', err.message);
  }
  return null;
}

export async function searchByTitle(title, googleBooksEnabled = true) {
  try {
    const data = await searchOpenLibraryByTitle(title);
    if (data && data.length > 0) return { source: 'openlibrary', data };
  } catch (err) {
    console.warn('OpenLibrary title search failed, trying Google Books:', err.message);
  }

  if (!googleBooksEnabled) {
    console.warn('Google Books is disabled, skipping fallback');
    return null;
  }

  try {
    const data = await searchGoogleBooksByTitle(title);
    if (data && data.length > 0) return { source: 'google', data };
  } catch (err) {
    console.warn('Google Books title search failed:', err.message);
  }

  return null;
}

function extractSeriesInfo(title) {
  for (const pattern of VOLUME_PATTERNS) {
    const match = title.match(pattern);
    if (match) {
      const volumeNumber = parseInt(match[1], 10);
      const seriesName = title.replace(pattern, '').replace(/,?\s*$/, '').replace(/\s+/g, ' ').trim();
      return { seriesName: seriesName || title, volumeNumber };
    }
  }
  return { seriesName: title, volumeNumber: null };
}

async function fetchOpenLibraryISBN(isbn) {
  const url = `${BASE_URL}?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();
  const key = `ISBN:${isbn}`;

  if (!json[key]) return null;

  const book = json[key];
  const { seriesName, volumeNumber } = extractSeriesInfo(book.title);

  return {
    title: book.title,
    seriesName,
    volumeNumber,
    author: book.authors?.map(a => a.name) || [],
    publisher: book.publishers?.[0]?.name,
    isbn: isbn,
    cover_url: book.cover?.large || book.cover?.medium || book.cover?.small,
    pages: book.number_of_pages
  };
}

async function searchOpenLibraryByTitle(title) {
  const encodedTitle = encodeURIComponent(title);
  const url = `https://openlibrary.org/search.json?title=${encodedTitle}&limit=10`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();

  if (!json.docs || json.docs.length === 0) return null;

  const results = json.docs.slice(0, 10).map(doc => ({
    title: doc.title,
    seriesName: doc.title,
    volumeNumber: null,
    author: doc.author_name || [],
    publisher: doc.publisher?.[0],
    isbn: doc.isbn?.[0] || null,
    cover_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
    pages: doc.number_of_pages_median || null,
    firstPublishYear: doc.first_publish_year
  }));

  return results;
}