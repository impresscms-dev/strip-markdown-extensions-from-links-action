/**
 * Tests for the remote link-info-creator
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import createRemoteLinkInfo from '../../src/link-info-creators/remote.js'
import LinkInfo from '../../src/entities/link-info.js'

global.fetch = jest.fn()
global.AbortController = jest.fn().mockImplementation(() => ({
  signal: 'mock-signal',
  abort: jest.fn()
}))

jest.spyOn(global, 'setTimeout').mockImplementation((callback, timeout) => {
  return 'mock-timeout-id'
})

jest.spyOn(global, 'clearTimeout').mockImplementation((timeoutId) => {
  
})

describe('createRemoteLinkInfo', () => {
  beforeEach(() => {
    
    jest.clearAllMocks()
  })

  test('should create a LinkInfo instance for a successful HTTP request', async () => {
    
    global.fetch.mockResolvedValueOnce({
      status: 200,
      headers: new Map([
        ['content-type', 'text/html'],
        ['content-disposition', 'attachment; filename="example.html"']
      ])
    })
    
    const link = 'https://example.com/page.html'
    
    const linkInfo = await createRemoteLinkInfo(link)
    
    expect(linkInfo).toBeInstanceOf(LinkInfo)
    expect(linkInfo.isLocal).toBe(false)
    expect(linkInfo.exists).toBe(true)
    expect(linkInfo.mimeType).toBe('text/html')
    expect(linkInfo.realUrl).toBe(link)
    expect(linkInfo.statusCode).toBe(200)
    expect(linkInfo.realFileName).toBe('example.html')
    expect(linkInfo.error).toBeNull()
  })

  test('should create a LinkInfo instance for a failed HTTP request', async () => {
    
    global.fetch.mockRejectedValueOnce(new Error('Network error'))
    
    const link = 'https://example.com/page.html'
    
    const linkInfo = await createRemoteLinkInfo(link)
    
    expect(linkInfo).toBeInstanceOf(LinkInfo)
    expect(linkInfo.isLocal).toBe(false)
    expect(linkInfo.exists).toBe(false)
    expect(linkInfo.mimeType).toBeNull()
    expect(linkInfo.realUrl).toBe(link)
    expect(linkInfo.statusCode).toBe(0)
    expect(linkInfo.error).toBe('Network error')
  })

  test('should create a LinkInfo instance for a non-200 HTTP response', async () => {
    
    global.fetch.mockResolvedValueOnce({
      status: 404,
      headers: new Map([
        ['content-type', 'text/html']
      ])
    })
    
    const link = 'https://example.com/page.html'
    
    const linkInfo = await createRemoteLinkInfo(link)
    
    expect(linkInfo).toBeInstanceOf(LinkInfo)
    expect(linkInfo.isLocal).toBe(false)
    expect(linkInfo.exists).toBe(false)
    expect(linkInfo.mimeType).toBe('text/html')
    expect(linkInfo.realUrl).toBe(link)
    expect(linkInfo.statusCode).toBe(404)
    expect(linkInfo.error).toBeNull()
  })

  test('should extract filename from content-disposition header', async () => {
    
    global.fetch.mockResolvedValueOnce({
      status: 200,
      headers: new Map([
        ['content-type', 'text/markdown'],
        ['content-disposition', 'attachment; filename="document.md"']
      ])
    })
    
    const link = 'https://example.com/download'
    
    const linkInfo = await createRemoteLinkInfo(link)
    
    expect(linkInfo.realFileName).toBe('document.md')
  })

  test('should extract filename from URL if no content-disposition header', async () => {
    
    global.fetch.mockResolvedValueOnce({
      status: 200,
      headers: new Map([
        ['content-type', 'text/markdown']
      ])
    })
    
    const link = 'https://example.com/document.md'
    
    const linkInfo = await createRemoteLinkInfo(link)
    
    expect(linkInfo.realFileName).toBe('document.md')
  })

  test('should handle timeouts correctly', async () => {
    
    global.fetch.mockRejectedValueOnce(new DOMException('The operation was aborted', 'AbortError'))
    
    const link = 'https://example.com/slow-page.html'
    
    const linkInfo = await createRemoteLinkInfo(link)
    
    expect(linkInfo.exists).toBe(false)
    expect(linkInfo.error).toBe('The operation was aborted')
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000)
  })

  test('should handle unexpected errors during fetch', async () => {
    
    global.fetch = jest.fn().mockImplementationOnce(() => {
      throw new Error('Unexpected error')
    })
    
    const link = 'https://example.com/page.html'
    
    const linkInfo = await createRemoteLinkInfo(link)
    
    expect(linkInfo.exists).toBe(false)
    expect(linkInfo.error).toBe('Unexpected error')
  })
})
