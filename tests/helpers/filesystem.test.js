/**
 * Tests for the Filesystem class
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'
import mockFs from 'mock-fs'
import Filesystem from '../../src/helpers/filesystem.js'
import fs from 'fs'
import mime from 'mime-types'

// Import the module to mock
import fileTypeChecker from 'file-type-checker'

// Mock specific methods
jest.spyOn(fileTypeChecker, 'detectFile')

describe('Filesystem', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    // Setup mock file system
    mockFs({
      'test-files': {
        'markdown.md': 'This is a markdown file',
        'text.txt': 'This is a text file',
        'image.png': Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG header
        'unknown.xyz': 'Unknown file type'
      }
    })
  })

  afterEach(() => {
    // Restore the real file system after each test
    mockFs.restore()
  })

  describe('detectMimeType', () => {
    test('should use file-type-checker to detect MIME type when available', () => {
      // Setup the mock to return a specific MIME type
      fileTypeChecker.detectFile.mockImplementation(() => ({ mimeType: 'image/png' }))

      const mimeType = Filesystem.detectMimeType('test-files/image.png')

      expect(mimeType).toBe('image/png')
      expect(fileTypeChecker.detectFile).toHaveBeenCalled()
    })

    test('should fall back to mime-types lookup when file-type-checker returns no result', () => {
      // Setup the mock to return null (no detection)
      fileTypeChecker.detectFile.mockImplementation(() => null)

      // Spy on mime.lookup
      const mimeLookupSpy = jest.spyOn(mime, 'lookup')
      mimeLookupSpy.mockImplementation(() => 'text/plain')

      const mimeType = Filesystem.detectMimeType('test-files/text.txt')

      expect(mimeType).toBe('text/plain')
      expect(fileTypeChecker.detectFile).toHaveBeenCalled()
      expect(mimeLookupSpy).toHaveBeenCalledWith('test-files/text.txt')

      // Restore the original implementation
      mimeLookupSpy.mockRestore()
    })

    test('should fall back to mime-types lookup when file-type-checker returns object without mimeType', () => {
      // Setup the mock to return an object without mimeType
      fileTypeChecker.detectFile.mockImplementation(() => ({ someOtherProperty: 'value' }))

      // Spy on mime.lookup
      const mimeLookupSpy = jest.spyOn(mime, 'lookup')
      mimeLookupSpy.mockImplementation(() => 'text/markdown')

      const mimeType = Filesystem.detectMimeType('test-files/markdown.md')

      expect(mimeType).toBe('text/markdown')
      expect(fileTypeChecker.detectFile).toHaveBeenCalled()
      expect(mimeLookupSpy).toHaveBeenCalledWith('test-files/markdown.md')

      // Restore the original implementation
      mimeLookupSpy.mockRestore()
    })

    test('should return application/octet-stream when mime-types lookup returns false', () => {
      // Setup the mocks
      fileTypeChecker.detectFile.mockImplementation(() => null)

      // Spy on mime.lookup
      const mimeLookupSpy = jest.spyOn(mime, 'lookup')
      mimeLookupSpy.mockImplementation(() => false)

      const mimeType = Filesystem.detectMimeType('test-files/unknown.xyz')

      expect(mimeType).toBe('application/octet-stream')
      expect(fileTypeChecker.detectFile).toHaveBeenCalled()
      expect(mimeLookupSpy).toHaveBeenCalledWith('test-files/unknown.xyz')

      // Restore the original implementation
      mimeLookupSpy.mockRestore()
    })

    test('should handle file read errors gracefully', () => {
      // Mock the file system to not include the file we're trying to read
      mockFs({})

      // Spy on mime.lookup
      const mimeLookupSpy = jest.spyOn(mime, 'lookup')
      mimeLookupSpy.mockImplementation(() => 'text/plain')

      const mimeType = Filesystem.detectMimeType('non-existent-file.txt')

      expect(mimeType).toBe('text/plain')
      expect(fileTypeChecker.detectFile).not.toHaveBeenCalled()
      expect(mimeLookupSpy).toHaveBeenCalledWith('non-existent-file.txt')

      // Restore the original implementation
      mimeLookupSpy.mockRestore()
    })
  })
})
