import {describe, expect, test, jest} from '@jest/globals'
import CacheManager from '../../src/helpers/cache-manager.js'

describe('cache-manager', () => {
  test('new instance has empty cache', () => {
    const cacheManager = new CacheManager()
    expect(cacheManager.has('any-key')).toBe(false)
  })

  test('set and get values', () => {
    const cacheManager = new CacheManager()

    const returnedValue = cacheManager.set('key1', 'value1')
    expect(returnedValue).toBe('value1')
    expect(cacheManager.get('key1')).toBe('value1')

    cacheManager.set('number', 42)
    cacheManager.set('boolean', true)
    cacheManager.set('object', { foo: 'bar' })
    cacheManager.set('array', [1, 2, 3])
    expect(cacheManager.get('number')).toBe(42)
    expect(cacheManager.get('boolean')).toBe(true)
    expect(cacheManager.get('object')).toEqual({ foo: 'bar' })
    expect(cacheManager.get('array')).toEqual([1, 2, 3])
  })

  test('has checks key existence', () => {
    const cacheManager = new CacheManager()

    expect(cacheManager.has('key1')).toBe(false)
    cacheManager.set('key1', 'value1')

    expect(cacheManager.has('key1')).toBe(true)
    expect(cacheManager.has('nonexistent')).toBe(false)
  })

  test('remember returns cached value when available', () => {
    const cacheManager = new CacheManager()

    const callback = jest.fn(() => 'computed value')
    const result1 = cacheManager.remember('key1', callback)
    expect(result1).toBe('computed value')
    expect(callback).toHaveBeenCalledTimes(1)

    const result2 = cacheManager.remember('key1', callback)
    expect(result2).toBe('computed value')
    expect(callback).toHaveBeenCalledTimes(1)
  })

  test('remember works with Promise callbacks', async () => {
    const cacheManager = new CacheManager()

    const callback = jest.fn(() => Promise.resolve('async value'))
    const result1 = await cacheManager.remember('key1', callback)
    expect(result1).toBe('async value')
    expect(callback).toHaveBeenCalledTimes(1)

    const result2 = cacheManager.remember('key1', callback)
    expect(result2).toBe('async value')
    expect(callback).toHaveBeenCalledTimes(1)
  })

  test('clear empties the cache', () => {
    const cacheManager = new CacheManager()

    cacheManager.set('key1', 'value1')
    cacheManager.set('key2', 'value2')
    expect(cacheManager.has('key1')).toBe(true)
    expect(cacheManager.has('key2')).toBe(true)

    cacheManager.clear()
    expect(cacheManager.has('key1')).toBe(false)
    expect(cacheManager.has('key2')).toBe(false)
  })

  test('forget removes specific keys', () => {
    const cacheManager = new CacheManager()

    cacheManager.set('key1', 'value1')
    cacheManager.set('key2', 'value2')
    expect(cacheManager.has('key1')).toBe(true)
    expect(cacheManager.has('key2')).toBe(true)

    const result1 = cacheManager.forget('key1')
    expect(result1).toBe(true)
    expect(cacheManager.has('key1')).toBe(false)
    expect(cacheManager.has('key2')).toBe(true)

    const result2 = cacheManager.forget('nonexistent')
    expect(result2).toBe(false)
    expect(cacheManager.has('key2')).toBe(true)
  })
})
