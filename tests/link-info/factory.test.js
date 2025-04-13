import {describe, expect, test, beforeEach} from '@jest/globals'
import LinkInfoFactory from '../../src/link-info/factory.js'
import LocalLinkInfo from '../../src/link-info/local.js'
import RemoteLinkInfo from '../../src/link-info/remote.js'

describe('link-info-factory', () => {
  beforeEach(() => {
    if (LinkInfoFactory.cache) {
      LinkInfoFactory.cache.clear()
    }
  })

  test.each([
    'file.md',
    'path/to/file.md',
    '/absolute/path/file.md',
    './relative/path/file.md',
    '../parent/path/file.md'
  ])('creates LocalLinkInfo for local path: %s', (path) => {
    const info = LinkInfoFactory.create(path)
    expect(info).toBeInstanceOf(LocalLinkInfo)
    expect(info.isLocal).toBe(true)
    expect(info.link).toBe(path)
  })

  test.each([
    'http://example.com/file.md',
    'https://example.com/path/to/file.md',
    'ftp://example.com/file.md',
    'mailto:user@example.com'
  ])('creates correct LinkInfo for URL: %s', (url) => {
    const info = LinkInfoFactory.create(url)
    const isRemote = !!url.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//)

    if (isRemote) {
      expect(info).toBeInstanceOf(RemoteLinkInfo)
      expect(info.isLocal).toBe(false)
    } else {
      expect(info).toBeInstanceOf(LocalLinkInfo)
      expect(info.isLocal).toBe(true)
    }

    expect(info.link).toBe(url)
  })

  test('caches instances by link', () => {
    const link = 'path/to/file.md'

    const info1 = LinkInfoFactory.create(link)
    const info2 = LinkInfoFactory.create(link)

    expect(info1).toBe(info2)
  })

  test('handles base paths correctly', () => {
    const basePath = 'base/path'
    const fullPath = 'base/path/to/file.md'
    const relativePath = '/to/file.md'

    const info = LinkInfoFactory.create(fullPath, basePath)
    expect(info).toBeInstanceOf(LocalLinkInfo)
    expect(info.link).toBe(relativePath)
    expect(info.base).toBe(basePath)
  })
})
