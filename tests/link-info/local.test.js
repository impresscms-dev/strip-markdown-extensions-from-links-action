import {describe, expect, test, afterAll, beforeAll} from '@jest/globals'
import LocalLinkInfo from '../../src/link-info/local.js'
import mock from 'mock-fs'

describe('local-link-info', () => {
  beforeAll(() => {
    mock({
      'test-dir': {
        'regular-file.md': 'This is a markdown file',
        'special:chars.md': 'File with special characters',
        'image.png': Buffer.from([8, 6, 7, 5, 3, 0, 9]),
        'nested': {
          'nested-file.md': 'Nested markdown file'
        }
      }
    })
  })

  test('isLocal always returns true', () => {
    const info = new LocalLinkInfo('test-dir/regular-file.md', null)
    expect(info.isLocal).toBe(true)
  })

  test.each([
    'test-dir/regular-file.md',
    'test-dir/special:chars.md',
    'test-dir/image.png',
    'test-dir/nested/nested-file.md'
  ])('exists returns true for existing file: %s', (path) => {
    const info = new LocalLinkInfo(path, null)
    expect(info.exists).toBe(true)
  })

  test.each([
    'test-dir/non-existent.md',
    'non-existent-dir/file.md'
  ])('exists returns false for non-existent file: %s', (path) => {
    const info = new LocalLinkInfo(path, null)
    expect(info.exists).toBe(false)
  })

  test('mimeType returns correct MIME type', () => {
    const info1 = new LocalLinkInfo('test-dir/regular-file.md', null)
    expect(info1.mimeType).toMatch(/^text\/markdown|text\/x-markdown|application\/markdown$/)

    const info2 = new LocalLinkInfo('test-dir/image.png', null)
    expect(info2.mimeType).toMatch(/^image\/png/)
  })

  test('isMarkdown returns true for markdown files', () => {
    const info = new LocalLinkInfo('test-dir/regular-file.md', null)
    expect(info.isMarkdown).toBe(true)
  })

  test('isMarkdown returns false for non-markdown files', () => {
    const info = new LocalLinkInfo('test-dir/image.png', null)
    expect(info.isMarkdown).toBe(false)
  })

  test('extension returns correct file extension', () => {
    const info1 = new LocalLinkInfo('test-dir/regular-file.md', null)
    expect(info1.extension).toBe('md')

    const info2 = new LocalLinkInfo('test-dir/image.png', null)
    expect(info2.extension).toBe('png')
  })

  test('query returns correct query string', () => {
    const info1 = new LocalLinkInfo('test-dir/regular-file.md?param=value', null)
    expect(info1.query).toBe('?param=value')

    const info2 = new LocalLinkInfo('test-dir/regular-file.md', null)
    expect(info2.query).toBeNull()
  })

  test('fragment returns correct fragment', () => {
    const info1 = new LocalLinkInfo('test-dir/regular-file.md#section', null)
    expect(info1.fragment).toBe('#section')

    const info2 = new LocalLinkInfo('test-dir/regular-file.md', null)
    expect(info2.fragment).toBeNull()
  })

  test('realFileName returns correct file name', () => {
    const info = new LocalLinkInfo('test-dir/regular-file.md', null)
    expect(info.realFileName).toBe('test-dir/regular-file.md')
  })

  test('fileNameWithoutExtension returns correct file name without extension', () => {
    const info = new LocalLinkInfo('test-dir/regular-file.md', null)
    expect(info.fileNameWithoutExtension).toBe('test-dir%2Fregular-file')
  })

  test('fileNameWithoutExtension handles query parameters and fragments', () => {
    const info = new LocalLinkInfo('test-dir/regular-file.md?param=value#section', null)
    expect(info.fileNameWithoutExtension).toBe('test-dir%2Fregular-file?param=value#section')
  })

  test('handles base path correctly', () => {
    const info = new LocalLinkInfo('regular-file.md', 'test-dir')
    expect(info.realFileName).toBe('test-dir/regular-file.md')
    expect(info.exists).toBe(true)
  })

  afterAll(() => {
    mock.restore()
  })
})
