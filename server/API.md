# REST API

> 🔐 All API endpoints (except `/api/auth/login` and `/api/auth/check`) require authentication. Include the session cookie or `Authorization: Bearer <token>` header.

## Authentication

```
POST   /api/auth/login              # Login (username + password) → returns session token
POST   /api/auth/logout             # Logout (invalidates session)
GET    /api/auth/check              # Check if session is valid
```

## Mangas

```
GET    /api/mangas                  # List (accepts ?status=&q=&sort=)
GET    /api/mangas/:id              # Detail with volumes
POST   /api/mangas                  # Create
PUT    /api/mangas/:id              # Update
DELETE /api/mangas/:id              # Delete
```

## Volumes

```
POST   /api/mangas/:id/tomos        # Add volume
PUT    /api/mangas/:id/tomos/:tomoId     # Change a volume's status
DELETE /api/mangas/:id/tomos/:tomoId     # Delete a volume
```

## Search

```
GET    /api/search?isbn=XXX         # Search OpenLibrary/Google Books
GET    /api/search?title=XXX        # Search by title
```

## Configuration

```
GET    /api/config/apis             # Get API configuration
PUT    /api/config/apis/:name       # Update API enabled state
```
