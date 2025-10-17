import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatNumber, debounce, deepClone } from '../helpers'

describe('helpers.js', () => {
  describe('formatNumber', () => {
    it('formats number with thousand separators', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1000000)).toBe('1,000,000')
      expect(formatNumber(123456789)).toBe('123,456,789')
    })

    it('handles small numbers', () => {
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(100)).toBe('100')
      expect(formatNumber(999)).toBe('999')
    })

    it('handles negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000')
      expect(formatNumber(-123456)).toBe('-123,456')
    })

    it('handles non-number input', () => {
      expect(formatNumber('abc')).toBe('0')
      expect(formatNumber(null)).toBe('0')
      expect(formatNumber(undefined)).toBe('0')
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('delays function execution', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 500)

      debouncedFn()
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(500)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('cancels previous call when called multiple times', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 500)

      debouncedFn()
      vi.advanceTimersByTime(200)
      debouncedFn()
      vi.advanceTimersByTime(200)
      debouncedFn()

      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(500)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('passes arguments correctly', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 300)

      debouncedFn('hello', 'world')
      vi.advanceTimersByTime(300)

      expect(fn).toHaveBeenCalledWith('hello', 'world')
    })
  })

  describe('deepClone', () => {
    it('clones primitive values', () => {
      expect(deepClone(null)).toBe(null)
      expect(deepClone(42)).toBe(42)
      expect(deepClone('string')).toBe('string')
      expect(deepClone(true)).toBe(true)
    })

    it('clones arrays', () => {
      const arr = [1, 2, 3, [4, 5]]
      const cloned = deepClone(arr)
      
      expect(cloned).toEqual(arr)
      expect(cloned).not.toBe(arr)
      expect(cloned[3]).not.toBe(arr[3])
    })

    it('clones objects', () => {
      const obj = {
        a: 1,
        b: {
          c: 2,
          d: [3, 4]
        }
      }
      const cloned = deepClone(obj)
      
      expect(cloned).toEqual(obj)
      expect(cloned).not.toBe(obj)
      expect(cloned.b).not.toBe(obj.b)
      expect(cloned.b.d).not.toBe(obj.b.d)
    })

    it('clones Date objects', () => {
      const date = new Date('2024-01-01')
      const cloned = deepClone(date)
      
      expect(cloned).toEqual(date)
      expect(cloned).not.toBe(date)
      expect(cloned.getTime()).toBe(date.getTime())
    })

    it('modifying cloned object does not affect original', () => {
      const original = { a: 1, b: { c: 2 } }
      const cloned = deepClone(original)
      
      cloned.a = 999
      cloned.b.c = 888
      
      expect(original.a).toBe(1)
      expect(original.b.c).toBe(2)
    })
  })
})

