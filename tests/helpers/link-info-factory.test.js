/**
 * Tests for the LinkInfoFactory class
 */

import { describe, test, expect } from '@jest/globals'
import LinkInfoFactory from '../../src/helpers/link-info-factory.js'
import CacheManager from '../../src/helpers/cache-manager.js'

describe('LinkInfoFactory', () => {
  test('should have a cache property that returns a CacheManager instance', () => {
    expect(LinkInfoFactory.cache).toBeInstanceOf(CacheManager)
  })

  test('should have a create method', () => {
    expect(typeof LinkInfoFactory.create).toBe('function')
  })

  test('should have a create method that returns a Promise', async () => {
    const link = 'test-file.md'
    const result = LinkInfoFactory.create(link)

    expect(result).toBeInstanceOf(Promise)
  })
})
