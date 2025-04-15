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
        'unknown.xyz': 'Unknown file type'
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
})
