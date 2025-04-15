/**
 * Tests for the LinkReplacer class
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals'
import mockFs from 'mock-fs'
import LinkReplacer from '../../src/helpers/link-replacer.js'
import LinkInfoFactory from '../../src/helpers/link-info-factory.js'
import LinkInfo from '../../src/entities/link-info.js'

describe('LinkReplacer', () => {
  let replacer

  beforeEach(() => {
    
    replacer = new LinkReplacer('/test/path')

    jest.clearAllMocks()

    mockFs({
      '/test/path': {
        'document.md': 'This is a markdown file',
        'another.md': 'Another markdown file',
        'index.html': '<html><body>Hello</body></html>'
      }
    })

    jest.spyOn(LinkInfoFactory, 'create').mockImplementation(async (link, base) => {
      
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

  })

  afterEach(() => {
    
    mockFs.restore()

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
