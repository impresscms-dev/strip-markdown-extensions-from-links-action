/**
 * Tests for the CacheManager class
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import CacheManager from '../../src/helpers/cache-manager.js'

describe('CacheManager', () => {
  let cacheManager

  beforeEach(() => {
    
    cacheManager = new CacheManager()
  })

  test('should initialize with an empty cache', () => {
    
    expect(cacheManager.has('any-key')).toBe(false)
  })

  describe('set and get methods', () => {
    test('should store and retrieve string values', () => {
      const key = 'test-key'
      const value = 'test-value'
      
      cacheManager.set(key, value)
      
      expect(cacheManager.get(key)).toBe(value)
    })

    test('should store and retrieve object values', () => {
      const key = 'object-key'
      const value = { name: 'test', value: 123 }
      
      cacheManager.set(key, value)
      
      expect(cacheManager.get(key)).toEqual(value)
    })

    test('should store and retrieve array values', () => {
      const key = 'array-key'
      const value = [1, 2, 3, 'test']
      
      cacheManager.set(key, value)
      
      expect(cacheManager.get(key)).toEqual(value)
    })

    test('should store and retrieve null values', () => {
      const key = 'null-key'
      const value = null
      
      cacheManager.set(key, value)
      
      expect(cacheManager.get(key)).toBeNull()
    })

    test('should return undefined for non-existent keys', () => {
      expect(cacheManager.get('non-existent-key')).toBeUndefined()
    })

    test('should return the stored value from set method', () => {
      const key = 'return-key'
      const value = 'return-value'
      
      const returnedValue = cacheManager.set(key, value)
      
      expect(returnedValue).toBe(value)
    })
  })

  describe('has method', () => {
    test('should return true for existing keys', () => {
      const key = 'existing-key'
      
      cacheManager.set(key, 'some-value')
      
      expect(cacheManager.has(key)).toBe(true)
    })

    test('should return false for non-existent keys', () => {
      expect(cacheManager.has('non-existent-key')).toBe(false)
    })
  })

  describe('remember method', () => {
    test('should compute and store value if key does not exist', () => {
      const key = 'compute-key'
      const value = 'computed-value'
      const callback = jest.fn().mockReturnValue(value)
      
      const result = cacheManager.remember(key, callback)
      
      expect(result).toBe(value)
      expect(callback).toHaveBeenCalledTimes(1)
      expect(cacheManager.get(key)).toBe(value)
    })

    test('should return cached value without calling callback if key exists', () => {
      const key = 'cached-key'
      const value = 'cached-value'

      cacheManager.set(key, value)

      const callback = jest.fn()
      const result = cacheManager.remember(key, callback)
      
      expect(result).toBe(value)
      expect(callback).not.toHaveBeenCalled()
    })

    test('should handle promises returned by callback', async () => {
      const key = 'promise-key'
      const value = 'promise-value'
      const callback = jest.fn().mockReturnValue(Promise.resolve(value))
      
      const resultPromise = cacheManager.remember(key, callback)

      expect(resultPromise instanceof Promise).toBe(true)

      const result = await resultPromise
      
      expect(result).toBe(value)
      expect(callback).toHaveBeenCalledTimes(1)

      expect(cacheManager.get(key)).toBe(value)
    })
  })

  describe('clear method', () => {
    test('should remove all entries from the cache', () => {
      
      cacheManager.set('key1', 'value1')
      cacheManager.set('key2', 'value2')

      expect(cacheManager.has('key1')).toBe(true)
      expect(cacheManager.has('key2')).toBe(true)

      cacheManager.clear()

      expect(cacheManager.has('key1')).toBe(false)
      expect(cacheManager.has('key2')).toBe(false)
    })
  })

  describe('forget method', () => {
    test('should remove a specific key from the cache', () => {
      
      cacheManager.set('key1', 'value1')
      cacheManager.set('key2', 'value2')

      const result = cacheManager.forget('key1')

      expect(result).toBe(true)
      expect(cacheManager.has('key1')).toBe(false)
      expect(cacheManager.has('key2')).toBe(true)
    })

    test('should return false when trying to remove a non-existent key', () => {
      const result = cacheManager.forget('non-existent-key')
      
      expect(result).toBe(false)
    })
  })
})
