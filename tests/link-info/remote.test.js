import {describe, expect, test, jest} from '@jest/globals'
import RemoteLinkInfo from '../../src/link-info/remote.js'

describe('remote-link-info', () => {
  test('isLocal always returns false', () => {
    const info = new RemoteLinkInfo('https://example.com/file.md', null)
    expect(info.isLocal).toBe(false)
  })

  test('exists returns false without making a request', () => {
    const info = new RemoteLinkInfo('https://example.com/file.md', null)
    expect(info.exists).toBe(false)
  })

  test('mimeType returns undefined without making a request', () => {
    const info = new RemoteLinkInfo('https://example.com/file.md', null)
    expect(info.mimeType).toBeUndefined()
  })

  test('isMarkdown returns false without making a request', () => {
    const info = new RemoteLinkInfo('https://example.com/file.md', null)
    expect(info.isMarkdown).toBe(false)
  })

  test('query returns correct query string', () => {
    const info1 = new RemoteLinkInfo('https://example.com/file.md?param=value', null)
    expect(info1.query).toBe('?param=value')

    const info2 = new RemoteLinkInfo('https://example.com/file.md', null)
    expect(info2.query).toBeNull()
  })

  test('fragment returns correct fragment', () => {
    const info1 = new RemoteLinkInfo('https://example.com/file.md#section', null)
    expect(info1.fragment).toBe('#section')

    const info2 = new RemoteLinkInfo('https://example.com/file.md', null)
    expect(info2.fragment).toBeNull()
  })

  test('query and fragment work with complex URLs', () => {
    const info = new RemoteLinkInfo('https://example.com/path/to/file.md?param1=value1&param2=value2#section-1', null)
    expect(info.query).toBe('?param1=value1&param2=value2')
    expect(info.fragment).toBe('#section-1')
  })

  test('extension throws an error for remote links', () => {
    const info = new RemoteLinkInfo('https://example.com/file.md', null)
    expect(() => info.extension).toThrow()
  })

  test('base path is ignored for remote links', () => {
    const info = new RemoteLinkInfo('https://example.com/file.md', 'base/path')
    expect(info.link).toBe('https://example.com/file.md')
    expect(info.base).toBe('base/path')
  })

  test('invalid URLs are handled gracefully', () => {
    const info = new RemoteLinkInfo('not-a-valid-url', null)
    expect(info.query).toBeNull()
    expect(info.fragment).toBeNull()
  })
})
