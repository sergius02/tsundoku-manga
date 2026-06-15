const FALLBACK_URL = 'https://www.googleapis.com/books/v1/volumes';

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

export async function fetchGoogleBooksISBN(isbn) {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = `${FALLBACK_URL}?q=isbn:${isbn}${apiKey ? `&key=${apiKey}` : ''}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();

  if (!json.items || json.items.length === 0) return null;

  const book = json.items[0].volumeInfo;
  const { seriesName, volumeNumber } = extractSeriesInfo(book.title);

  return {
    title: book.title,
    seriesName,
    volumeNumber,
    author: book.authors || [],
    publisher: book.publisher,
    isbn: isbn,
    cover_url: book.imageLinks?.extraLarge || book.imageLinks?.large || book.imageLinks?.medium,
    pages: book.pageCount
  };
}

export async function searchGoogleBooksByTitle(title) {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const encodedTitle = encodeURIComponent(title);
  const url = `${FALLBACK_URL}?q=intitle:${encodedTitle}&maxResults=10${apiKey ? `&key=${apiKey}` : ''}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();

  if (!json.items || json.items.length === 0) return null;

  const results = json.items.map(item => {
    const info = item.volumeInfo;
    const { seriesName, volumeNumber } = extractSeriesInfo(info.title);
    const isbnObj = info.industryIdentifiers?.find(i => i.type === 'ISBN_13' || i.type === 'ISBN_10');
    return {
      title: info.title,
      seriesName,
      volumeNumber,
      author: info.authors || [],
      publisher: info.publisher,
      isbn: isbnObj?.identifier || null,
      cover_url: info.imageLinks?.large || info.imageLinks?.medium,
      pages: info.pageCount
    };
  });

  return results;
}