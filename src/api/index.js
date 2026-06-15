const BASE_URL = '/api'

export async function getMangas(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.q) params.set('q', filters.q)
  if (filters.sort) params.set('sort', filters.sort)

  const res = await fetch(`${BASE_URL}/mangas?${params}`)
  if (!res.ok) throw new Error('Error fetching mangas')
  return res.json()
}

export async function getManga(id, sort = 'number') {
  const params = new URLSearchParams()
  if (sort) params.set('sort', sort)
  const queryString = params.toString()
  const res = await fetch(`${BASE_URL}/mangas/${id}${queryString ? '?' + queryString : ''}`)
  if (!res.ok) throw new Error('Error fetching manga')
  return res.json()
}

export async function createManga(data) {
  const res = await fetch(`${BASE_URL}/mangas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Error creating manga')
  }
  return res.json()
}

export async function updateManga(id, data) {
  const res = await fetch(`${BASE_URL}/mangas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Error updating manga')
  return res.json()
}

export async function deleteManga(id) {
  const res = await fetch(`${BASE_URL}/mangas/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Error deleting manga')
}

export async function addVolume(mangaId, data) {
  const res = await fetch(`${BASE_URL}/mangas/${mangaId}/volumes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Error adding volume')
  }
  return res.json()
}

export async function updateVolume(mangaId, volumeId, data) {
  const res = await fetch(`${BASE_URL}/mangas/${mangaId}/volumes/${volumeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Error updating volume')
  return res.json()
}

export async function deleteVolume(mangaId, volumeId) {
  const res = await fetch(`${BASE_URL}/mangas/${mangaId}/volumes/${volumeId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Error deleting volume')
}

export async function markAllVolumesRead(mangaId) {
  const res = await fetch(`${BASE_URL}/mangas/${mangaId}/volumes`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'read' })
  })
  if (!res.ok) throw new Error('Error marking volumes as read')
  return res.json()
}

export async function markAllVolumesUnread(mangaId) {
  const res = await fetch(`${BASE_URL}/mangas/${mangaId}/volumes`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'unread' })
  })
  if (!res.ok) throw new Error('Error marking volumes as unread')
  return res.json()
}

export async function searchByISBN(isbn) {
  const res = await fetch(`${BASE_URL}/search?isbn=${encodeURIComponent(isbn)}`)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Error searching')
  }
  return res.json()
}

export async function searchByTitle(title) {
  const res = await fetch(`${BASE_URL}/search?title=${encodeURIComponent(title)}`)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Error searching')
  }
  return res.json()
}

export async function getApiConfig() {
  const res = await fetch(`${BASE_URL}/config/apis`)
  if (!res.ok) throw new Error('Error fetching API config')
  return res.json()
}

export async function updateApiConfig(name, enabled) {
  const res = await fetch(`${BASE_URL}/config/apis/${name}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Error updating API config')
  }
  return res.json()
}