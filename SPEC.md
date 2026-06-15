# Tsundoku - Gestor de Colección de Mangas

## 1. Concepto & Visión

Tsundoku es un gestor de colección de mangas personal con estética minimalista japonesa. La interfaz evoca la sensación de una estantería de manga bien organizada: limpia, silenciosa, con detalles sutiles que solo un aficionado reconocería. El objetivo es catalogar, buscar y seguir el progreso de lectura de tu colección de forma rápida y sin fricciones.

Soporta modo claro y oscuro.

## 2. Design Language

### Aesthetic Direction
Inspirado en las estanterías de librerías japonesas y el diseño editorial de manga. Minimalismo funcional con toques de calidez en los colores.

### Color Palette - Modo Claro
```
--bg-primary: #faf9f7       (paper white)
--bg-secondary: #f0eeeb     (light cream)
--bg-card: #ffffff          (pure white for cards)
--text-primary: #1a1a1a     (near black)
--text-secondary: #6b6b6b   (warm gray)
--accent: #e63946           (vermilion red - manga accent)
--accent-hover: #d62839     (darker red)
--success: #2d6a4f          (forest green)
--warning: #f4a261          (amber)
--border: #e5e5e5           (light border)
--shadow: rgba(0,0,0,0.08)
```

### Color Palette - Modo Oscuro
```
--bg-primary: #1a1a1a       (dark surface)
--bg-secondary: #2a2a2a     (elevated surface)
--bg-card: #242424          (card surface)
--text-primary: #f5f5f5     (near white)
--text-secondary: #a0a0a0   (muted gray)
--accent: #e63946           (vermilion red - same)
--accent-hover: #ff4d5a     (lighter red for dark mode)
--success: #4ade80          (bright green)
--warning: #fbbf24          (amber)
--border: #3a3a3a           (subtle border)
--shadow: rgba(0,0,0,0.3)
```

### Typography
- **Headings**: "Noto Serif JP", serif - elegante, legible
- **Body**: "Inter", sans-serif - moderna, limpia
- **Monospace**: "JetBrains Mono" - para ISBN/ISSN

### Spatial System
- Base unit: 8px
- Card padding: 24px
- Section gaps: 32px
- Border radius: 8px (cards), 4px (inputs)

### Motion Philosophy
- Transiciones suaves de 200ms ease-out
- Hover states con lift sutil (translateY -2px + shadow)
- Focus states claros con outline vermelho
- Skeleton loaders durante búsquedas

## 3. Layout & Structure

### Páginas
1. **Biblioteca** (`/`) - Grid de manga con filtros
2. **Detalle** (`/manga/:id`) - Información completa y tomos
3. **Búsqueda** (`/search`) - Buscador externo ISBN/ISSN
4. **Añadir** (`/add`) - Formulario manual

### Estructura de Página (Biblioteca)
```
┌─────────────────────────────────────────────┐
│  Header: Logo + Nav + Theme Toggle          │
├─────────────────────────────────────────────┤
│  Filters: Estado │ Títulos │ Ordenar        │
├─────────────────────────────────────────────┤
│  Stats Bar: Total │ Leídos │ Leyendo        │
├─────────────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│  │Card │ │Card │ │Card │ │Card │           │
│  └─────┘ └─────┘ └─────┘ └─────┘           │
└─────────────────────────────────────────────┘
```

### Responsive Strategy
- Desktop: Grid 4-5 columnas
- Tablet: Grid 3 columnas
- Mobile: Grid 2 columnas, filtros colapsables

## 4. Features & Interactions

### Core Features

#### 4.1 Biblioteca Personal
- Lista todos los mangas con cover, título, estado
- Filtros: Por estado (todos/leídos/leyendo/sin leer/sin tomos), por título (búsqueda)
- Ordenar: Por título, fecha añadido, progreso
- Click en card → ver detalle

#### 4.2 Detalle de Manga
- Cover grande, metadata (título, autor, ISSN, editorial)
- Lista de tomos con estado individual
- Cada tomo tiene su propio ISBN
- Marcar tomo como leído/no leído
- Selector de tomo actual (¿Por cuál voy?)
- Notas personales (textarea)

#### 4.3 Búsqueda Externa
- Input para ISBN/ISSN
- Selector de fuente: OpenLibrary (prioridad) / Google Books
- Resultados con preview → "Añadir a biblioteca"
- Si ya existe, mostrar opción de ver

#### 4.4 Añadir Manual
- Campos: Título, Autor, ISSN, Editorial, Cover URL
- Validación en tiempo real
- Guardar → redirige a detalle

### Estados de Tomo
```
no_leido    → Toma en posesión, sin leer (gris)
leyendo     → Actualmente leyendo (amber/warning)
leido       → Completado (green/success)
```

### Modo Oscuro
- Toggle en el header (icono sol/luna)
- Se guarda preferencia en localStorage
- Transición suave entre modos (200ms)

### Edge Cases
- Búsqueda sin resultados: mensaje amigable + opción de añadir manual
- ISBN no encontrado: fallback a Google Books
- Cover no carga: placeholder con iniciales del título
- Base de datos vacía: onboarding con botón de búsqueda

## 5. Component Inventory

### MangaCard
- **Default**: Cover + título + badge de estado
- **Hover**: Lift sutil + shadow, cover con zoom leve
- **Loading**: Skeleton con aspect ratio de manga

### StatusBadge
- Pill con color según estado
- Icono + texto

### SearchInput
- Input con icono de lupa
- Debounce de 300ms
- Clear button cuando hay texto
- Loading spinner durante búsqueda

### TomoRow
- Número de tomo + ISBN + checkbox estado
- Hover: background sutil
- Click en checkbox: toggle estado

### Button
- **Primary**: Fondo rojo, texto blanco
- **Secondary**: Borde rojo, texto rojo
- **Ghost**: Solo texto
- **Disabled**: Opacidad 50%

### Modal
- Overlay oscuro (opacity 50%)
- Card centrada con animación scale-in
- Close con X o click fuera

### ThemeToggle
- Icono sol (modo claro) / luna (modo oscuro)
- Animación de rotación al cambiar

## 6. Technical Approach

### Stack
- **Backend**: Node.js + Express + better-sqlite3
- **Frontend**: Vue 3 + Vite + Vue Router + Pinia
- **API**: RESTful JSON en `/api/*`

### Estructura de Proyecto
```
/
├── server/
│   ├── index.js          # Entry point Express
│   ├── db.js             # Config SQLite
│   ├── routes/
│   │   ├── mangas.js     # CRUD mangas
│   │   └── search.js     # Búsqueda externa
│   └── services/
│       └── openlibrary.js
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── router/
│   ├── stores/           # Pinia stores
│   ├── views/
│   ├── components/
│   └── api/              # Llamadas al backend
├── package.json
└── vite.config.js
```

### API Endpoints

#### Mangas
```
GET    /api/mangas              # Lista todos (con filtros ?estado=&q=&ordenar=)
GET    /api/mangas/:id          # Detalle completo
POST   /api/mangas              # Crear nuevo
PUT    /api/mangas/:id          # Actualizar
DELETE /api/mangas/:id          # Eliminar
```

#### Tomos
```
POST   /api/mangas/:id/tomos              # Añadir tomo
PUT    /api/mangas/:id/tomos/:tomoId      # Actualizar estado tomo
DELETE /api/mangas/:id/tomos/:tomoId      # Eliminar tomo
```

#### Búsqueda
```
GET    /api/search?isbn=XXX&source=openlibrary  # Buscar en API externa
```

### Data Model

#### Manga
```sql
CREATE TABLE mangas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT,
  issn TEXT,
  publisher TEXT,
  cover_url TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tomo
```sql
CREATE TABLE tomos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  manga_id INTEGER NOT NULL,
  isbn TEXT,
  status TEXT DEFAULT 'no_leido' CHECK(status IN ('no_leido', 'leyendo', 'leido')),
  acquired BOOLEAN DEFAULT false,
  FOREIGN KEY (manga_id) REFERENCES mangas(id) ON DELETE CASCADE
);
```

### Búsqueda Externa

#### OpenLibrary API (prioridad)
```
GET https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=data
```

#### Google Books API (fallback)
```
GET https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}
```

Respuesta normalizada:
```json
{
  "title": "string",
  "author": ["string"],
  "publisher": "string",
  "isbn": "string",
  "cover_url": "string (URL)"
}
```