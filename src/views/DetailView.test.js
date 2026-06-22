import { describe, it, expect } from 'vitest'

describe('DetailView Computed Logic', () => {
  function getMissingVolumeNumbers(volumes) {
    const numbers = volumes
      .map(v => v.volume_number)
      .filter(n => n != null)
      .sort((a, b) => a - b)

    if (numbers.length < 2) return []

    const gaps = []
    for (let i = 0; i < numbers.length - 1; i++) {
      const current = numbers[i]
      const next = numbers[i + 1]
      for (let n = current + 1; n < next; n++) {
        gaps.push(n)
      }
    }
    return gaps
  }

  function getVolumesWithGaps(volumes, missingNumbers) {
    const placeholders = missingNumbers.map(num => ({
      id: `placeholder-${num}`,
      volume_number: num,
      placeholder: true,
    }))

    return [...volumes, ...placeholders].sort((a, b) => {
      const aNum = a.volume_number ?? 999999
      const bNum = b.volume_number ?? 999999
      return aNum - bNum
    })
  }

  function getInitials(title) {
    if (!title) return ''
    return title
      .split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase()
  }

  function getProgressPercent(volumesTotal, volumesRead) {
    if (volumesTotal === 0) return 0
    return Math.round((volumesRead / volumesTotal) * 100)
  }

  describe('missingVolumeNumbers', () => {
    it('returns empty array when no volumes', () => {
      const result = getMissingVolumeNumbers([])
      expect(result).toEqual([])
    })

    it('returns empty array when only one volume', () => {
      const result = getMissingVolumeNumbers([{ id: 1, volume_number: 1 }])
      expect(result).toEqual([])
    })

    it('returns empty array when volumes are consecutive', () => {
      const result = getMissingVolumeNumbers([
        { id: 1, volume_number: 1 },
        { id: 2, volume_number: 2 },
        { id: 3, volume_number: 3 },
      ])
      expect(result).toEqual([])
    })

    it('detects single missing volume', () => {
      const result = getMissingVolumeNumbers([
        { id: 1, volume_number: 1 },
        { id: 2, volume_number: 3 },
      ])
      expect(result).toEqual([2])
    })

    it('detects multiple missing volumes', () => {
      const result = getMissingVolumeNumbers([
        { id: 1, volume_number: 1 },
        { id: 2, volume_number: 2 },
        { id: 3, volume_number: 5 },
        { id: 4, volume_number: 7 },
      ])
      expect(result).toEqual([3, 4, 6])
    })

    it('handles missing volumes at the start', () => {
      const result = getMissingVolumeNumbers([
        { id: 1, volume_number: 3 },
        { id: 2, volume_number: 4 },
        { id: 3, volume_number: 5 },
      ])
      expect(result).toEqual([])
    })

    it('handles missing volumes at the end', () => {
      const result = getMissingVolumeNumbers([
        { id: 1, volume_number: 1 },
        { id: 2, volume_number: 2 },
        { id: 3, volume_number: 3 },
      ])
      expect(result).toEqual([])
    })

    it('filters out null volume numbers', () => {
      const result = getMissingVolumeNumbers([
        { id: 1, volume_number: 1 },
        { id: 2, volume_number: null },
        { id: 3, volume_number: 3 },
      ])
      expect(result).toEqual([2])
    })
  })

  describe('volumesWithGaps', () => {
    it('combines volumes and placeholders', () => {
      const volumes = [
        { id: 1, volume_number: 1, placeholder: false },
        { id: 2, volume_number: 2, placeholder: false },
      ]
      const missing = [3, 4]

      const result = getVolumesWithGaps(volumes, missing)

      expect(result).toHaveLength(4)
      expect(result[0].volume_number).toBe(1)
      expect(result[1].volume_number).toBe(2)
      expect(result[2].volume_number).toBe(3)
      expect(result[3].volume_number).toBe(4)
    })

    it('sorts by volume number', () => {
      const volumes = [
        { id: 3, volume_number: 5, placeholder: false },
        { id: 1, volume_number: 1, placeholder: false },
      ]
      const missing = [3]

      const result = getVolumesWithGaps(volumes, missing)

      expect(result[0].volume_number).toBe(1)
      expect(result[1].volume_number).toBe(3)
      expect(result[2].volume_number).toBe(5)
    })

    it('marks placeholders correctly', () => {
      const volumes = [{ id: 1, volume_number: 1, placeholder: false }]
      const missing = [2]

      const result = getVolumesWithGaps(volumes, missing)

      expect(result[0].placeholder).toBe(false)
      expect(result[1].placeholder).toBe(true)
      expect(result[1].id).toBe('placeholder-2')
    })

    it('handles empty volumes with missing', () => {
      const result = getVolumesWithGaps([], [1, 2, 3])

      expect(result).toHaveLength(3)
      expect(result.every(v => v.placeholder)).toBe(true)
    })
  })

  describe('initials', () => {
    it('extracts initials from single word title', () => {
      expect(getInitials('Naruto')).toBe('N')
    })

    it('extracts initials from two word title', () => {
      expect(getInitials('One Piece')).toBe('OP')
    })

    it('extracts initials from multi word title', () => {
      expect(getInitials('Attack on Titan')).toBe('AO')
    })

    it('returns empty string for empty title', () => {
      expect(getInitials('')).toBe('')
    })

    it('returns empty string for null title', () => {
      expect(getInitials(null)).toBe('')
    })
  })

  describe('progressPercent', () => {
    it('calculates 50% progress', () => {
      expect(getProgressPercent(10, 5)).toBe(50)
    })

    it('calculates 0% when no volumes', () => {
      expect(getProgressPercent(0, 0)).toBe(0)
    })

    it('calculates 100% when all read', () => {
      expect(getProgressPercent(10, 10)).toBe(100)
    })

    it('rounds to nearest integer', () => {
      expect(getProgressPercent(3, 1)).toBe(33)
      expect(getProgressPercent(3, 2)).toBe(67)
    })

    it('handles partial progress', () => {
      expect(getProgressPercent(7, 3)).toBe(43)
    })
  })
})
