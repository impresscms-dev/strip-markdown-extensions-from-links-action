/**
 * Tests for the Filesystem class
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'
import mockFs from 'mock-fs'
import Filesystem from '../../src/helpers/filesystem.js'
import mime from 'mime-types'

import fileTypeChecker from 'file-type-checker'

jest.spyOn(fileTypeChecker, 'detectFile')

describe('Filesystem', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockFs({
      'test-files': {
        'markdown.md': 'This is a markdown file',
        'text.txt': 'This is a text file',
        'image.png': Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        'unknown.xyz': 'Unknown file type',
        'with-query.md?param=value': 'File with query',
        'with-fragment.md#section': 'File with fragment',
        'with-both.md?param=value#section': 'File with query and fragment',
        'nested': {
          'nested-file.md': 'Nested markdown file'
        }
      }
    })
  })

  afterEach(() => {
    mockFs.restore()
  })

  describe('detectMimeType', () => {
    test('should use file-type-checker to detect MIME type when available', () => {
      fileTypeChecker.detectFile.mockImplementation(() => ({ mimeType: 'image/png' }))

      const mimeType = Filesystem.detectMimeType('test-files/image.png')

      expect(mimeType).toBe('image/png')
      expect(fileTypeChecker.detectFile).toHaveBeenCalled()
    })

    test('should fall back to mime-types lookup when file-type-checker returns no result', () => {
      fileTypeChecker.detectFile.mockImplementation(() => null)

      const mimeLookupSpy = jest.spyOn(mime, 'lookup')
      mimeLookupSpy.mockImplementation(() => 'text/plain')

      const mimeType = Filesystem.detectMimeType('test-files/text.txt')

      expect(mimeType).toBe('text/plain')
      expect(fileTypeChecker.detectFile).toHaveBeenCalled()
      expect(mimeLookupSpy).toHaveBeenCalledWith('test-files/text.txt')

      mimeLookupSpy.mockRestore()
    })

    test('should fall back to mime-types lookup when file-type-checker returns object without mimeType', () => {
      fileTypeChecker.detectFile.mockImplementation(() => ({ someOtherProperty: 'value' }))

      const mimeLookupSpy = jest.spyOn(mime, 'lookup')
      mimeLookupSpy.mockImplementation(() => 'text/markdown')

      const mimeType = Filesystem.detectMimeType('test-files/markdown.md')

      expect(mimeType).toBe('text/markdown')
      expect(fileTypeChecker.detectFile).toHaveBeenCalled()
      expect(mimeLookupSpy).toHaveBeenCalledWith('test-files/markdown.md')

      mimeLookupSpy.mockRestore()
    })

    test('should return application/octet-stream when mime-types lookup returns false', () => {
      fileTypeChecker.detectFile.mockImplementation(() => null)

      const mimeLookupSpy = jest.spyOn(mime, 'lookup')
      mimeLookupSpy.mockImplementation(() => false)

      const mimeType = Filesystem.detectMimeType('test-files/unknown.xyz')

      expect(mimeType).toBe('application/octet-stream')
      expect(fileTypeChecker.detectFile).toHaveBeenCalled()
      expect(mimeLookupSpy).toHaveBeenCalledWith('test-files/unknown.xyz')

      mimeLookupSpy.mockRestore()
    })

    test('should handle file read errors gracefully', () => {
      mockFs({})

      const mimeLookupSpy = jest.spyOn(mime, 'lookup')
      mimeLookupSpy.mockImplementation(() => 'text/plain')

      const mimeType = Filesystem.detectMimeType('non-existent-file.txt')

      expect(mimeType).toBe('text/plain')
      expect(fileTypeChecker.detectFile).not.toHaveBeenCalled()
      expect(mimeLookupSpy).toHaveBeenCalledWith('non-existent-file.txt')

      mimeLookupSpy.mockRestore()
    })
  })

  describe('getExtension', () => {
    test('should return the extension for a valid filename', () => {
      const extension = Filesystem.getExtension('test-files/markdown.md')
      expect(extension).toBe('md')
    })

    test('should return null for a filename without extension', () => {
      const extension = Filesystem.getExtension('test-files/noextension')
      expect(extension).toBeNull()
    })

    test('should return null for a filename with just a dot', () => {
      const extension = Filesystem.getExtension('test-files/justadot.')
      expect(extension).toBeNull()
    })

    test('should return null for null or empty filename', () => {
      expect(Filesystem.getExtension(null)).toBeNull()
      expect(Filesystem.getExtension('')).toBeNull()
      expect(Filesystem.getExtension(undefined)).toBeNull()
    })

    test('should return null for filenames with query parameters', () => {
      const extension = Filesystem.getExtension('test-files/file.md?param=value')
      expect(extension).toBeNull()
    })

    test('should return null for filenames with fragments', () => {
      const extension = Filesystem.getExtension('test-files/file.md#section')
      expect(extension).toBeNull()
    })

    test('should handle filenames with multiple dots correctly', () => {
      const extension = Filesystem.getExtension('test-files/file.with.multiple.dots.md')
      expect(extension).toBe('md')
    })
  })

  describe('stripExtensionFromLocalFilename', () => {
    test('should strip extension from a filename', () => {
      const result = Filesystem.stripExtensionFromLocalFilename('test-files/markdown.md', 'md', null, null, null)
      expect(result).toBe('test-files/markdown')
    })

    test('should return the original filename if no extension is provided', () => {
      const result = Filesystem.stripExtensionFromLocalFilename('test-files/markdown', null, null, null, null)
      expect(result).toBe('test-files/markdown')
    })

    test('should return the original filename if it is null or empty', () => {
      expect(Filesystem.stripExtensionFromLocalFilename(null, 'md', null, null, null)).toBeNull()
      expect(Filesystem.stripExtensionFromLocalFilename('', 'md', null, null, null)).toBe('')
    })

    test('should add query parameters if provided', () => {
      const result = Filesystem.stripExtensionFromLocalFilename('test-files/markdown.md', 'md', '?param=value', null, null)
      expect(result).toBe('test-files/markdown?param=value')
    })

    test('should add fragments if provided', () => {
      const result = Filesystem.stripExtensionFromLocalFilename('test-files/markdown.md', 'md', null, '#section', null)
      expect(result).toBe('test-files/markdown#section')
    })

    test('should add both query parameters and fragments if provided', () => {
      const result = Filesystem.stripExtensionFromLocalFilename('test-files/markdown.md', 'md', '?param=value', '#section', null)
      expect(result).toBe('test-files/markdown?param=value#section')
    })

    test('should handle base path correctly', () => {
      const result = Filesystem.stripExtensionFromLocalFilename('test-files/markdown.md', 'md', null, null, 'test-files')
      expect(result).toBe('markdown')
    })

    test('should handle base path with query parameters and fragments', () => {
      const result = Filesystem.stripExtensionFromLocalFilename('test-files/markdown.md', 'md', '?param=value', '#section', 'test-files')
      expect(result).toBe('markdown?param=value#section')
    })

    test('should handle nested paths with base path', () => {
      const result = Filesystem.stripExtensionFromLocalFilename('test-files/nested/nested-file.md', 'md', null, null, 'test-files')
      expect(result).toBe('nested/nested-file')
    })

    test('should properly URL encode the filename', () => {
      const result = Filesystem.stripExtensionFromLocalFilename('test-files/file with spaces.md', 'md', null, null, null)
      expect(result).toBe('test-files/file%20with%20spaces')
    })

    test('should preserve forward slashes in the path during URL encoding', () => {
      const result = Filesystem.stripExtensionFromLocalFilename('test-files/nested/file with spaces.md', 'md', null, null, null)
      expect(result).toBe('test-files/nested/file%20with%20spaces')
    })
  })

  describe('findBestFilenameFromLink', () => {
    test('should find the correct filename for a simple link', () => {
      const result = Filesystem.findBestFilenameFromLink('test-files/markdown.md', null)
      expect(result).toBe('test-files/markdown.md')
    })

    test('should find the correct filename with a base path', () => {
      const result = Filesystem.findBestFilenameFromLink('markdown.md', 'test-files')
      expect(result).toBe('test-files/markdown.md')
    })

    test('should handle links with query parameters', () => {
      const result = Filesystem.findBestFilenameFromLink('test-files/markdown.md?param=value', null)
      expect(result).toBe('test-files/markdown.md')
    })

    test('should handle links with fragments', () => {
      const result = Filesystem.findBestFilenameFromLink('test-files/markdown.md#section', null)
      expect(result).toBe('test-files/markdown.md')
    })

    test('should handle links with both query parameters and fragments', () => {
      const result = Filesystem.findBestFilenameFromLink('test-files/markdown.md?param=value#section', null)
      expect(result).toBe('test-files/markdown.md')
    })

    test('should handle URL encoded paths', () => {
      // Create a file with spaces in the name
      mockFs({
        'test-files': {
          'file with spaces.md': 'File with spaces in the name'
        }
      })

      const result = Filesystem.findBestFilenameFromLink('test-files/file%20with%20spaces.md', null)
      expect(result).toBe('test-files/file with spaces.md')
    })

    test('should return the original link if no file is found', () => {
      const result = Filesystem.findBestFilenameFromLink('test-files/non-existent.md', null)
      expect(result).toBe('test-files/non-existent.md')
    })

    test('should handle invalid URLs gracefully', () => {
      // Mock the URL constructor to throw an error
      const originalURL = global.URL
      global.URL = function() {
        throw new Error('Invalid URL')
      }

      try {
        const result = Filesystem.findBestFilenameFromLink('invalid-url', null)
        expect(result).toBeUndefined()
      } finally {
        // Restore the original URL constructor
        global.URL = originalURL
      }
    })

    test('should handle nested paths', () => {
      const result = Filesystem.findBestFilenameFromLink('test-files/nested/nested-file.md', null)
      expect(result).toBe('test-files/nested/nested-file.md')
    })

    test('should handle nested paths with base path', () => {
      const result = Filesystem.findBestFilenameFromLink('nested/nested-file.md', 'test-files')
      expect(result).toBe('test-files/nested/nested-file.md')
    })

    test('should handle URL decoding errors gracefully', () => {
      // Create an invalid percent-encoded URL that will cause decodeURIComponent to throw
      const result = Filesystem.findBestFilenameFromLink('test-files/invalid%2-encoding.md', null)
      expect(result).toBe('test-files/invalid%2-encoding.md')
    })
  })
})
