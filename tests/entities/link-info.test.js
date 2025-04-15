/**
 * Tests for the LinkInfo class
 */

import { describe, test, expect, beforeEach } from '@jest/globals'
import LinkInfo from '../../src/entities/link-info.js'

describe('LinkInfo', () => {
  let linkInfo

  beforeEach(() => {
    // Create a fresh LinkInfo instance before each test
    linkInfo = new LinkInfo()
  })

  test('should initialize with default values when no data is provided', () => {
    expect(linkInfo.isLocal).toBe(false)
    expect(linkInfo.exists).toBe(false)
    expect(linkInfo.mimeType).toBeNull()
    expect(linkInfo.query).toBeNull()
    expect(linkInfo.fragment).toBeNull()
    expect(linkInfo.realFileName).toBeNull()
    expect(linkInfo.extension).toBeNull()
    expect(linkInfo.realUrl).toBeNull()
    expect(linkInfo.statusCode).toBe(0)
    expect(linkInfo.error).toBeNull()
    expect(linkInfo.fileNameWithoutExtension).toBeNull()
  })

  test('should initialize with provided values', () => {
    const initialData = {
      isLocal: true,
      exists: true,
      mimeType: 'text/markdown',
      query: '?param=value',
      fragment: '#section',
      realFileName: 'example.md',
      extension: 'md',
      realUrl: 'https://example.com/example.md',
      statusCode: 200,
      error: null,
      fileNameWithoutExtension: 'example'
    }

    const customLinkInfo = new LinkInfo(initialData)

    expect(customLinkInfo.isLocal).toBe(true)
    expect(customLinkInfo.exists).toBe(true)
    expect(customLinkInfo.mimeType).toBe('text/markdown')
    expect(customLinkInfo.query).toBe('?param=value')
    expect(customLinkInfo.fragment).toBe('#section')
    expect(customLinkInfo.realFileName).toBe('example.md')
    expect(customLinkInfo.extension).toBe('md')
    expect(customLinkInfo.realUrl).toBe('https://example.com/example.md')
    expect(customLinkInfo.statusCode).toBe(200)
    expect(customLinkInfo.error).toBeNull()
    expect(customLinkInfo.fileNameWithoutExtension).toBe('example')
  })

  test('should ignore properties that are not in the internal data map', () => {
    const initialData = {
      isLocal: true,
      nonExistentProperty: 'this should be ignored'
    }

    const customLinkInfo = new LinkInfo(initialData)

    expect(customLinkInfo.isLocal).toBe(true)
    // The nonExistentProperty should not be accessible
    expect(customLinkInfo['nonExistentProperty']).toBeUndefined()
  })

  test('should create a new instance with default values when reinitialized', () => {
    const initialData = {
      isLocal: true,
      exists: true,
      mimeType: 'text/markdown',
      query: '?param=value',
      fragment: '#section',
      realFileName: 'example.md',
      extension: 'md',
      realUrl: 'https://example.com/example.md',
      statusCode: 200,
      error: 'Some error',
      fileNameWithoutExtension: 'example'
    }

    // First create with initial data
    linkInfo = new LinkInfo(initialData)

    // Then create a new instance without data to test the default values
    linkInfo = new LinkInfo()

    expect(linkInfo.isLocal).toBe(false)
    expect(linkInfo.exists).toBe(false)
    expect(linkInfo.mimeType).toBeNull()
    expect(linkInfo.query).toBeNull()
    expect(linkInfo.fragment).toBeNull()
    expect(linkInfo.realFileName).toBeNull()
    expect(linkInfo.extension).toBeNull()
    expect(linkInfo.realUrl).toBeNull()
    expect(linkInfo.statusCode).toBe(0)
    expect(linkInfo.error).toBeNull()
    expect(linkInfo.fileNameWithoutExtension).toBeNull()
  })

  describe('isMarkdown', () => {
    test('should return true for markdown MIME types', () => {
      const markdownMimeTypes = [
        'text/markdown',
        'text/x-markdown',
        'application/markdown'
      ]

      markdownMimeTypes.forEach(mimeType => {
        const mdLinkInfo = new LinkInfo({ mimeType })
        expect(mdLinkInfo.isMarkdown).toBe(true)
      })
    })

    test('should return false for non-markdown MIME types', () => {
      const nonMarkdownMimeTypes = [
        'text/plain',
        'text/html',
        'application/json',
        null
      ]

      nonMarkdownMimeTypes.forEach(mimeType => {
        const nonMdLinkInfo = new LinkInfo({ mimeType })
        expect(nonMdLinkInfo.isMarkdown).toBe(false)
      })
    })
  })
})
