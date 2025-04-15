/**
 * Tests for the local link-info-creator
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals'
import mockFs from 'mock-fs'
import createLocalLinkInfo from '../../src/link-info-creators/local.js'
import LinkInfo from '../../src/entities/link-info.js'
import Filesystem from '../../src/helpers/filesystem.js'

jest.spyOn(Filesystem, 'detectMimeType').mockImplementation((filename) => {
  if (filename.endsWith('.md')) {
    return 'text/markdown'
  } else if (filename.endsWith('.txt')) {
    return 'text/plain'
  } else if (filename.endsWith('.html')) {
    return 'text/html'
  } else {
    return 'application/octet-stream'
  }
})

describe('createLocalLinkInfo', () => {
  beforeEach(() => {
    
    mockFs({
      'test-files': {
        'markdown.md': 'This is a markdown file',
        'text.txt': 'This is a text file',
        'nested': {
          'nested-markdown.md': 'This is a nested markdown file'
        }
      }
    })
  })

  afterEach(() => {
    
    mockFs.restore()
  })

  test('should create a LinkInfo instance for an existing file', async () => {
    const link = 'test-files/markdown.md'

    const linkInfo = await createLocalLinkInfo(link)

    expect(linkInfo).toBeInstanceOf(LinkInfo)
    
    expect(linkInfo.exists).toBe(true)
    expect(linkInfo.mimeType).toBe('text/markdown')
    expect(linkInfo.realFileName).toBe(link)
    expect(linkInfo.extension).toBe('md')
    expect(linkInfo.isMarkdown).toBe(true)
  })

  test('should create a LinkInfo instance for a non-existent file', async () => {
    const link = 'test-files/non-existent.md'

    const linkInfo = await createLocalLinkInfo(link)

    expect(linkInfo).toBeInstanceOf(LinkInfo)
    
    expect(linkInfo.exists).toBe(false)
    expect(linkInfo.realFileName).toBe(link)
  })

  test('should handle links with query strings', async () => {
    const link = 'test-files/markdown.md?param=value'

    const linkInfo = await createLocalLinkInfo(link)

    expect(linkInfo.query).toBe('?param=value')
    expect(linkInfo.fileNameWithoutExtension).toContain('?param=value')
  })

  test('should handle links with fragments', async () => {
    const link = 'test-files/markdown.md#section'

    const linkInfo = await createLocalLinkInfo(link)

    expect(linkInfo.fragment).toBe('#section')
    expect(linkInfo.fileNameWithoutExtension).toContain('#section')
  })

  test('should handle links with both query strings and fragments', async () => {
    const link = 'test-files/markdown.md?param=value#section'

    const linkInfo = await createLocalLinkInfo(link)

    expect(linkInfo.query).toBe('?param=value')
    expect(linkInfo.fragment).toBe('#section')
    expect(linkInfo.fileNameWithoutExtension).toContain('?param=value')
    expect(linkInfo.fileNameWithoutExtension).toContain('#section')
  })

  test('should handle links with URL-encoded characters', async () => {
    const link = 'test-files/markdown.md?param=value%20with%20spaces'

    const linkInfo = await createLocalLinkInfo(link)

    expect(linkInfo.query).toBe('?param=value%20with%20spaces')
  })

  test('should handle nested paths', async () => {
    const link = 'test-files/nested/nested-markdown.md'

    const linkInfo = await createLocalLinkInfo(link)

    expect(linkInfo.exists).toBe(true)
    expect(linkInfo.realFileName).toBe(link)
    expect(linkInfo.extension).toBe('md')
  })

  test('should handle base path correctly', async () => {
    const base = 'test-files'
    const link = 'nested/nested-markdown.md'

    const linkInfo = await createLocalLinkInfo(link, base)

    expect(linkInfo.exists).toBe(true)
    expect(linkInfo.realFileName).toBe('test-files/nested/nested-markdown.md')
    expect(linkInfo.extension).toBe('md')
    expect(linkInfo.fileNameWithoutExtension).not.toContain(base)
  })

  test('should set fileNameWithoutExtension correctly', async () => {
    const link = 'test-files/markdown.md'

    const linkInfo = await createLocalLinkInfo(link)

    expect(linkInfo.fileNameWithoutExtension).toBe('test-files%2Fmarkdown')
  })

  test('should set fileNameWithoutExtension correctly with base path', async () => {
    const base = 'test-files'
    const link = 'markdown.md'

    const linkInfo = await createLocalLinkInfo(link, base)

    expect(linkInfo.fileNameWithoutExtension).toBe('markdown')
  })
})
