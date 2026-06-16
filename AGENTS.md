# Tsundoku - AGENTS

## Stack
- **Frontend**: Vue 3 + Vite + Vue Router + Pinia + vue-i18n
- **Backend**: Express (Node.js) + better-sqlite3 (SQLite)
- **Testing**: Vitest (unit + integration tests)
- **No TypeScript, no linting**

## Dev Commands
```bash
npm run dev      # Runs both client (port 5173) + server (port 3000) concurrently
npm run build    # Builds Vue app → dist/
npm run client   # Vite dev server only (port 5173)
npm run server   # Express server only (port 3000)
npm run preview # Preview production build from dist/
npm run test    # Run all tests (Vitest)
npm run test:watch  # Watch mode for development
```

## Testing
Tests use Vitest + Supertest (backend) y @vue/test-utils + happy-dom (frontend).

Test files:
- `server/routes/*.test.js` - Backend API tests (54 tests)
- `src/stores/*.test.js` - Pinia store tests (31 tests)
- `src/views/*.test.js` - View computed logic tests (41 tests)

## Key Quirks

### API Proxy
Vite config proxies `/api/*` to `http://localhost:3000`. Don't prefix API calls with full URL during dev.

### Database Location
- **Dev**: `server/tsundoku.db` (relative to project root)
- **Docker/Prod**: `$DATA_DIR/tsundoku.db` (default `/app/data`)
- SQLite is created automatically on first run; `db.js` handles migrations via `ALTER TABLE`.

### Authentication
- **Required env vars**: `AUTH_USERNAME` and `AUTH_PASSWORD`
- **Web**: Cookie HttpOnly with session ID (7 day expiry)
- **Android**: Bearer token stored in DataStore
- All API endpoints require auth except `/api/auth/login` and `/api/auth/check`
- If env vars are not set, server returns 503

### Routes (Frontend)
- `/` → BibliotecaView (main library grid)
- `/manga/:id` → DetalleView (manga + volume details)
- `/search` → SearchView (ISBN search via OpenLibrary/Google Books)
- `/add` → AddView (manual manga entry)
- `/settings` → SettingsView (API config and preferences) [planned]

### i18n
- Auto-detects browser locale (prefers `es`)
- Persists choice in `localStorage` key `tsundoku-locale`
- Locales: `src/i18n/locales/{en,es}.json`

### Theme
- CSS variables in `src/assets/main.css`
- Dark mode via `data-theme="dark"` attribute on `<html>`
- Preference stored in `localStorage`

## Project Structure
```
/                       # Vue frontend (src/)
  /api                  # API client functions (index.js, covers.js)
  /assets               # CSS (main.css)
  /components           # Reusable Vue components
  /i18n                 # vue-i18n setup + locales
  /router               # Vue Router config
  /stores               # Pinia stores (mangas.js, auth.js, settings.js)
  /views                # Page components

/server/                # Express backend
  /middleware           # auth.js (authentication middleware)
  /routes               # mangas.js, search.js, auth.js, config.js
  /services             # openlibrary.js, googlebooks.js
  auth.js               # Credential validation
  db.js                 # SQLite connection + schema
  index.js              # Express entry (port 3000)

```

## Docker
- Multi-stage build
- `VOLUME /app/data` for persistent SQLite storage
- `PORT=3000` env var, listens on `0.0.0.0`
- Required env vars: `AUTH_USERNAME`, `AUTH_PASSWORD`
- Optional env vars: `GOOGLE_BOOKS_API_KEY`
- No dev mode in container; uses `npm run build` then `node server/index.js`
- **Registry**: `ghcr.io/sergius02/tsundoku` (GitHub Container Registry)
- **Auto-publish**: GitHub Actions builds and pushes image on each GitHub release
- **Tags**: `latest` + version tag (e.g., `0.1.0-a`)

## API Endpoints

### Authentication (no auth required)
```
POST /api/auth/login     # Login with { username, password } → returns { token, expires_at }
POST /api/auth/logout    # Logout (requires auth)
GET  /api/auth/check     # Check if session valid (requires auth)
```

### Mangas (requires auth)
```
GET    /api/mangas              # List with ?status=&q=&sort= filters
GET    /api/mangas/:id          # Single manga with volumes
POST   /api/mangas              # Create manga
PUT    /api/mangas/:id          # Update manga
DELETE /api/mangas/:id          # Delete manga
POST   /api/mangas/:id/tomos    # Add volume
PUT    /api/mangas/:id/tomos/:tomoId  # Update volume
DELETE /api/mangas/:id/tomos/:tomoId  # Delete volume
```

### Search (requires auth)
```
GET /api/search?isbn=XXX        # Search by ISBN
GET /api/search?title=XXX       # Search by title
```

### Config (requires auth)
```
GET  /api/config/apis           # Get API configuration
PUT  /api/config/apis/:name     # Update API (enabled state)
```

## External APIs
- OpenLibrary: `https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=data`
- Google Books: `https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}`
- Google Books requires `GOOGLE_BOOKS_API_KEY` env var for higher quota (optional)
- APIs can be enabled/disabled via `/api/config/apis`

## Commit Conventions
- **Format**: Gitmoji (e.g., `🐛`, `✨`, `🔥`, `📝`, `🎨`)
- **Language**: All commit messages **must be in English**, unless the user explicitly requests another language.
- **Messages**: Generated by AI, but require user confirmation before committing

### Commit & Push Workflow
Before any `git commit` or `git push`:
1. Show `git status` and `git diff`
2. Present the exact commit message
3. Wait for explicit user confirmation
4. **Commit** → only commit (do NOT push)
5. **Push** → requires a separate, explicit confirmation after the commit is done