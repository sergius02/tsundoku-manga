# Tsundoku

> 積読 — *tsundoku*: la costumbre japonesa de comprar libros (o mangas) y dejarlos acumulados sin leer.

**Tsundoku** es un gestor personal de colección de mangas con estética minimalista inspirada en las estanterías de librerías japonesas. Te permite catalogar, buscar y seguir el progreso de lectura de tus tomos de forma rápida, limpia y sin fricciones.

> [English](README.md) · [Español](README-es.md)

![Status](https://img.shields.io/badge/status-Alpha-yellow)
![License](https://img.shields.io/badge/license-AGPL--3.0-blue)
![Version](https://img.shields.io/badge/version-0.1.0--a-ff69b4)

---

## ✨ Características

- 📚 **Biblioteca personal**: grid con todos tus mangas, con filtros por estado y búsqueda por título.
- 📖 **Detalle de manga y tomos**: cada tomo tiene su propio ISBN y un estado individual (*no leído*, *leyendo*, *leído*).
- 🔍 **Búsqueda externa por ISBN**: integración con [OpenLibrary](https://openlibrary.org) (prioridad) y [Google Books](https://books.google.com) como fallback.
- ⚙️ **APIs configurables**: activa o desactiva las APIs de búsqueda externa desde los ajustes.
- ➕ **Añadir manualmente**: para esos mangas que no aparecen en las APIs públicas.
- 🌗 **Modo claro y oscuro**: con un toque de bermellón japonés (`#e63946`) como color de acento.
- 🌍 **Multi-idioma**: español e inglés, con detección automática del navegador.
- 🔐 **Autenticación**: acceso protegido con nombre de usuario y contraseña.
- 🗄️ **Base de datos local SQLite**: sin servicios externos, sin cuentas, sin nubes. Tus datos son tuyos.
- 🐳 **Listo para Docker**: una sola imagen, un solo volumen.

---

## 🧰 Stack técnico

| Capa         | Tecnología                                  |
|--------------|---------------------------------------------|
| Frontend     | Vue 3 · Vite · Vue Router · Pinia · vue-i18n |
| Backend      | Node.js · Express                           |
| Base de datos| SQLite (vía `better-sqlite3`)               |
| Empaquetado  | Multi-stage Docker                          |

No hay TypeScript, no hay tests, no hay linter — es un proyecto pequeño y directo.

---

## 🚀 Compilación e instalación

### Requisitos

- **Node.js** ≥ 22
- **npm** (incluido con Node)
- En Linux, `better-sqlite3` necesita `python3`, `make` y `g++` para compilar el binding nativo.

### Desarrollo local

```bash
npm install
npm run dev
```

Esto levanta concurrentemente:

- 🖥️ Cliente Vite en `http://localhost:5173`
- 🛠️ Servidor Express en `http://localhost:3000`

Las llamadas a `/api/*` se redirigen automáticamente al backend gracias al proxy de Vite, así que en el código no hace falta prefijar la URL completa.

### Build de producción

```bash
npm run build         # genera dist/
npm run preview       # previsualiza el build
node server/index.js  # sirve la app completa en el puerto 3000
```

El servidor Express sirve los estáticos de `dist/` y expone la API REST en `/api/*`.

### Docker

```bash
docker build -t tsundoku .
docker run -d \
  --name tsundoku \
  -p 3000:3000 \
  -v tsundoku-data:/app/data \
  -e AUTH_USERNAME=tu_usuario \
  -e AUTH_PASSWORD=tu_contraseña_segura \
  -e GOOGLE_BOOKS_API_KEY=tu_api_key \
  tsundoku
```

> ⚠️ **Importante:** Debes establecer las variables de entorno `AUTH_USERNAME` y `AUTH_PASSWORD`. Sin ellas, el servidor no arrancará (devuelve 503). Elige una contraseña segura para despliegues en producción.

La base de datos SQLite se persiste en el volumen `/app/data`. La imagen expone el puerto `3000` y escucha en `0.0.0.0`.

Variables de entorno reconocidas:

| Variable              | Por defecto    | Descripción                                      |
|-----------------------|----------------|--------------------------------------------------|
| `PORT`                | `3000`         | Puerto del servidor Express                      |
| `DATA_DIR`            | `/app/data`    | Directorio donde se almacena `tsundoku.db`       |
| `NODE_ENV`            | `production`   | Modo de ejecución                                |
| `AUTH_USERNAME`       | (requerido)    | Nombre de usuario para autenticación             |
| `AUTH_PASSWORD`       | (requerido)    | Contraseña para autenticación                    |
| `GOOGLE_BOOKS_API_KEY`| (opcional)     | API key para búsqueda de fallback en Google Books|

---

## 📡 API REST (resumen)

> 🔐 Todos los endpoints de la API (excepto `/api/auth/login` y `/api/auth/check`) requieren autenticación. Incluye la cookie de sesión o el header `Authorization: Bearer <token>`.

```
POST   /api/auth/login              # Login (username + password) → devuelve token de sesión
POST   /api/auth/logout             # Logout (invalida la sesión)
GET    /api/auth/check              # Verificar si la sesión es válida

GET    /api/mangas                  # Lista (acepta ?status=&q=&sort=)
GET    /api/mangas/:id              # Detalle con tomos
POST   /api/mangas                  # Crear
PUT    /api/mangas/:id              # Actualizar
DELETE /api/mangas/:id              # Eliminar
POST   /api/mangas/:id/tomos        # Añadir tomo
PUT    /api/mangas/:id/tomos/:tomoId     # Cambiar estado de un tomo
DELETE /api/mangas/:id/tomos/:tomoId     # Eliminar un tomo
GET    /api/search?isbn=XXX         # Buscar en OpenLibrary/Google Books
GET    /api/search?title=XXX        # Buscar por título

GET    /api/config/apis             # Obtener configuración de APIs
PUT    /api/config/apis/:name       # Actualizar estado de una API
```

---

## 📁 Estructura del proyecto

```
/
├── server/           # Backend Express + SQLite
│   ├── index.js
│   ├── db.js
│   ├── auth.js
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
├── src/              # Frontend Vue
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── composables/
│   ├── i18n/
│   ├── router/
│   ├── stores/
│   └── views/
├── public/           # Assets estáticos servidos por Express
├── Dockerfile
├── vite.config.js
└── package.json
```

---

## ⚠️ Sobre este proyecto y Vibe Coding

Este proyecto ha sido desarrollado íntegramente mediante **Vibe Coding**: la práctica de construir software guiando a un modelo de lenguaje (LLM) a través de descripciones, iteraciones y refinamientos en lenguaje natural, en lugar de escribir cada línea de código a mano.

¿Qué implica esto para ti?

- 🤖 **El código puede contener errores, inconsistencias, decisiones de diseño cuestionables o "malas prácticas"** que pasaron los filtros del autor y del modelo. Si encuentras algo raro, es probable que sea *realmente* raro.
- 🧪 **No hay suite de tests** (todavía). Si tocas algo crítico, prueba a fondo antes de hacer deploy.
- 🧹 **Hay áreas que un desarrollador experimentado probablemente haría de otra forma**: nombres, estructura, validaciones, accesibilidad, etc. Se aceptan sugerencias educadas en forma de PR.
- ❤️ **Pero funciona** — y se ha construido con cariño.

### 🤝 Contribuciones bienvenidas

**Los Pull Requests están siempre abiertos.** Si quieres:

- Corregir un bug,
- Refactorizar algo que te duela al mirarlo,
- Añadir tests (que faltan),
- Mejorar la accesibilidad, la i18n, el rendimiento, lo que sea,

…abre un PR sin miedo. No hay guía de estilo estricta, así que sé razonable y explica brevemente el *porqué* de tu cambio.

Si encuentras un bug pero no quieres/puedes arreglarlo, abre un *issue* describiendo cómo reproducirlo.

---

## 📜 Licencia

Este proyecto se distribuye bajo la **GNU Affero General Public License v3.0 o posterior** ([LICENSE](LICENSE)).

Copyright © 2026 Sergio Fernández Celorio.

En resumen, eres libre de usar, estudiar, modificar y redistribuir el código, **siempre que cualquier versión modificada que pongas a disposición a través de una red se publique también bajo AGPL v3 con su código fuente accesible para sus usuarios** (esta es la diferencia clave frente a la GPL ordinaria, y es lo que exige la sección 13 de la AGPL para software de servidor en red).

Consulta el [texto completo de la licencia](LICENSE) para conocer los términos exactos. Para un resumen legible, visita <https://www.gnu.org/licenses/agpl-3.0.html>.

---

<div align="center">

Hecho con 🫶, mucho café y un poco de IA.

</div>