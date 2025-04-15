/**
 * Tests for the LinkReplacer class
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals'
import mockFs from 'mock-fs'
import LinkReplacer from '../../src/helpers/link-replacer.js'
import LinkInfoFactory from '../../src/helpers/link-info-factory.js'
import LinkInfo from '../../src/entities/link-info.js'

// Mock the markdown-it module
jest.mock('markdown-it', () => {
  return jest.fn().mockImplementation(() => {
    return {
      render: jest.fn().mockReturnValue(''),
      parse: jest.fn().mockReturnValue([]),
      renderer: {
        rules: {}
      }
    }
  })
})

// We'll mock the LinkInfoFactory.create method in the beforeEach block

describe('LinkReplacer', () => {
  let replacer

  beforeEach(() => {
    // Create a fresh LinkReplacer instance before each test
    replacer = new LinkReplacer('/test/path')

    // Reset mock call counts
    jest.clearAllMocks()

    // Setup mock file system
    mockFs({
      '/test/path': {
        'document.md': 'This is a markdown file',
        'another.md': 'Another markdown file',
        'index.html': '<html><body>Hello</body></html>'
      }
    })

    // Mock the LinkInfoFactory.create method
    jest.spyOn(LinkInfoFactory, 'create').mockImplementation(async (link, base) => {
      // Create a mock LinkInfo based on the link
      const isMarkdown = link.endsWith('.md')
      const isLocal = !link.includes('://')

      return new LinkInfo({
        isLocal,
        exists: true,
        mimeType: isMarkdown ? 'text/markdown' : 'text/html',
        realFileName: link,
        extension: isMarkdown ? 'md' : 'html',
        fileNameWithoutExtension: isMarkdown ? link.replace('.md', '') : link
      })
    })

    // We'll use the real processLink method for our tests
  })

  afterEach(() => {
    // Restore the real file system after each test
    mockFs.restore()

    // Restore all mocks
    jest.restoreAllMocks()
  })

  describe('constructor', () => {
    test('should set the filesPath property', () => {
      expect(replacer.filesPath).toBe('/test/path')
    })
  })

  describe('processLink', () => {
    test('should process a local markdown link by removing the .md extension', async () => {
      const link = 'document.md'

      const result = await replacer.processLink(link)

      expect(result).toBe('document')
      expect(LinkInfoFactory.create).toHaveBeenCalledWith(link, '/test/path')
    })

    test('should not modify non-markdown links', async () => {
      const link = 'index.html'

      const result = await replacer.processLink(link)

      expect(result).toBe(link)
      expect(LinkInfoFactory.create).toHaveBeenCalledWith(link, '/test/path')
    })

    test('should not modify remote links', async () => {
      const link = 'https://example.com/document.md'

      const result = await replacer.processLink(link)

      expect(result).toBe(link)
      expect(LinkInfoFactory.create).toHaveBeenCalledWith(link, '/test/path')
    })
  })

  describe('transformMarkdownLinks', () => {
    test('should transform all markdown links in the content', async () => {
      const content = 'Check out [this document](document.md) and [this one](another.md) too!'

      const result = await replacer.transformMarkdownLinks(content)

      expect(result).toBe('Check out [this document](document) and [this one](another) too!')
    })

    test('should not transform non-markdown links', async () => {
      const content = 'Check out [this page](index.html) and [this site](https://example.com/)'

      const result = await replacer.transformMarkdownLinks(content)

      expect(result).toBe('Check out [this page](index.html) and [this site](https://example.com/)')
    })

    test('should handle a mix of markdown and non-markdown links', async () => {
      const content = 'Check [markdown](document.md), [html](index.html), and [remote](https://example.com/)'

      const result = await replacer.transformMarkdownLinks(content)

      expect(result).toBe('Check [markdown](document), [html](index.html), and [remote](https://example.com/)')
    })
  })
})
