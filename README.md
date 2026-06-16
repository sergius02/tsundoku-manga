# Tsundoku

> 積読 — *tsundoku*: the Japanese habit of buying books (or manga) and letting them pile up unread.

**Tsundoku** is a personal manga collection manager with a minimalist aesthetic inspired by Japanese bookshop shelves. It lets you catalog, search, and track the reading progress of your volumes quickly, cleanly, and without friction.

> [English](README.md) · [Español](README-es.md)

![Status](https://img.shields.io/badge/status-Alpha-yellow)
![License](https://img.shields.io/badge/license-AGPL--3.0-blue)
![Version](https://img.shields.io/badge/version-0.1.0--a-ff69b4)

---

## ✨ Features

- 📚 **Personal library**: a grid with all your manga, with status filters and title search.
- 📖 **Manga and volume details**: each volume has its own ISBN and an individual status (*unread*, *reading*, *read*).
- 🔍 **External ISBN search**: integration with [OpenLibrary](https://openlibrary.org) (priority) and [Google Books](https://books.google.com) as fallback.
- ⚙️ **Configurable APIs**: enable or disable external search APIs from the settings.
- ➕ **Add manually**: for those manga that don't show up in public APIs.
- 🌗 **Light and dark mode**: with a touch of Japanese vermilion (`#e63946`) as accent color.
- 🌍 **Multi-language**: Spanish and English, with automatic browser detection.
- 🔐 **Authentication**: protected access with username and password.
- 🗄️ **Local SQLite database**: no external services, no accounts, no clouds. Your data is yours.
- 🐳 **Docker-ready**: a single image, a single volume.

---

## 🧰 Tech stack

| Layer        | Technology                                   |
|--------------|----------------------------------------------|
| Frontend     | Vue 3 · Vite · Vue Router · Pinia · vue-i18n |
| Backend      | Node.js · Express                            |
| Database     | SQLite (via `better-sqlite3`)                |
| Packaging    | Multi-stage Docker                           |

No TypeScript, no linter — it's a small, straightforward project. Tests: 126 passing.

---

## 🚀 Build & installation

### Requirements

- **Node.js** ≥ 22
- **npm** (bundled with Node)
- On Linux, `better-sqlite3` needs `python3`, `make`, and `g++` to compile the native binding.

### Local development

```bash
npm install
npm run dev
```

This runs concurrently:

- 🖥️ Vite client at `http://localhost:5173`
- 🛠️ Express server at `http://localhost:3000`

Calls to `/api/*` are automatically proxied to the backend by Vite, so you don't need to prefix the full URL in your code.

### Production build

```bash
npm run build         # generates dist/
npm run preview       # previews the build
node server/index.js  # serves the full app on port 3000
```

The Express server serves the static assets from `dist/` and exposes the REST API at `/api/*`.

### Docker

```bash
docker build -t tsundoku .
docker run -d \
  --name tsundoku \
  -p 3000:3000 \
  -v tsundoku-data:/app/data \
  -e AUTH_USERNAME=your_username \
  -e AUTH_PASSWORD=your_secure_password \
  -e GOOGLE_BOOKS_API_KEY=your_api_key \
  tsundoku
```

> ⚠️ **Important:** You must set `AUTH_USERNAME` and `AUTH_PASSWORD` environment variables. Without them, the server will not start (returns 503). Choose a secure password for production deployments.

The SQLite database is persisted in the `/app/data` volume. The image exposes port `3000` and listens on `0.0.0.0`.

Recognized environment variables:

| Variable              | Default       | Description                                      |
|-----------------------|---------------|--------------------------------------------------|
| `PORT`                | `3000`        | Express server port                              |
| `DATA_DIR`            | `/app/data`   | Directory where `tsundoku.db` is stored          |
| `NODE_ENV`            | `production`  | Runtime mode                                     |
| `AUTH_USERNAME`       | (required)    | Username for authentication                      |
| `AUTH_PASSWORD`       | (required)    | Password for authentication                      |
| `GOOGLE_BOOKS_API_KEY`| (optional)    | API key for Google Books fallback search         |

---

## 📡 REST API

See [server/API.md](server/API.md) for the full API documentation.

---

## 📁 Project structure

```
/
├── server/           # Express + SQLite backend
│   ├── index.js
│   ├── db.js
│   ├── auth.js
│   ├── API.md        # REST API documentation
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── mangas.js
│   │   ├── search.js
│   │   ├── auth.js
│   │   └── config.js
│   └── services/
│       ├── openlibrary.js
│       └── googlebooks.js
├── src/              # Vue frontend
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── composables/
│   ├── i18n/
│   ├── router/
│   ├── stores/
│   └── views/
├── public/           # Static assets served by Express
├── Dockerfile
├── vite.config.js
└── package.json
```

---

## 🧪 Testing

```bash
npm test          # Run all tests (Vitest)
npm test:watch    # Watch mode
npm test -- --coverage  # With coverage report
```

**Test coverage:**

| Layer | Framework | Tests |
|-------|-----------|-------|
| Backend API | Vitest + Supertest | 54 |
| Frontend stores | Vitest + Pinia | 31 |
| Frontend views | Vitest (logic) | 41 |

See [vitest.config.js](vitest.config.js) for configuration.

---

## ⚠️ About this project and Vibe Coding

This project has been built entirely through **Vibe Coding**: the practice of building software by guiding a large language model (LLM) through descriptions, iterations, and refinements in natural language, rather than writing every line of code by hand.

What does this mean for you?

- 🤖 **The code may contain bugs, inconsistencies, questionable design decisions, or "bad practices"** that slipped past both the author and the model. If something looks weird, it probably *is* weird.
- 🧪 **Test suite included** (126 tests). Run with `npm test`.
- 🧹 **There are areas an experienced developer would probably do differently**: naming, structure, validation, accessibility, etc. Polite suggestions are welcome in the form of a PR.
- ❤️ **But it works** — and it was built with care.

### 🤝 Contributions welcome

**Pull Requests are always open.** If you want to:

- Fix a bug,
- Refactor something that hurts to look at,
- Improve test coverage,
- Improve accessibility, i18n, performance, anything,

…open a PR without fear. There's no strict style guide, so just be reasonable and briefly explain the *why* behind your change.

If you find a bug but don't want to (or can't) fix it, open an *issue* describing how to reproduce it.

---

## 📜 License

This project is licensed under the **GNU Affero General Public License v3.0 or later** ([LICENSE](LICENSE)).

Copyright © 2026 Sergio Fernández Celorio.

In short, you are free to use, study, modify and redistribute the code, **provided that any modified version that you make available over a network is also released under the AGPL v3 with its source code accessible to its users** (this is the key difference from the regular GPL, required by the AGPL's section 13 for network server software).

See the [full license text](LICENSE) for the exact terms. For a human-readable summary, see <https://www.gnu.org/licenses/agpl-3.0.html>.

---

<div align="center">

Made with 🫶, lots of coffee, and a bit of AI.

</div>