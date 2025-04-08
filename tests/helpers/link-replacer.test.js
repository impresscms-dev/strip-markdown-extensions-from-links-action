/**
 * Tests for the LinkReplacer class
 *
 * These tests verify that the LinkReplacer correctly processes Markdown links
 * by removing .md extensions from valid Markdown files while preserving other links.
 */

import {describe, expect, test, afterAll} from '@jest/globals'
import LinkReplacer from "../../src/helpers/link-replacer.js"
import mock from "mock-fs"

// Mock the file system with test Markdown files
mock({
  'test-dir': {
    'to-a-file.md' : '',
    'special:characters-included.md' : '',
  }

})

// Create a LinkReplacer instance for testing
const replacer = new LinkReplacer("test-dir")

/**
 * Test suite for the LinkReplacer class
 */
describe('link-replacer', () => {
  /**
   * Test that a normal Markdown file link has its .md extension removed
   */
  test('normal markdown file', () => {
    const newContent = replacer.transformMarkdownLinks("[link](to-a-file.md)")
    expect(newContent).toBe("[link](to-a-file)")
  })

  /**
   * Test that special characters in filenames are properly URL-encoded
   */
  test('special characters', () => {
    const newContent = replacer.transformMarkdownLinks("[link](special:characters-included.md)")
    expect(newContent).toBe("[link](special%3Acharacters-included)")
  })

  /**
   * Test that already escaped characters are handled correctly
   */
  test('do handle already escaped characters correctly', () => {
    const newContent = replacer.transformMarkdownLinks("[link](special%3Acharacters-included.md)")
    expect(newContent).toBe("[link](special%3Acharacters-included)")
  })

  /**
   * Test that links with incorrect URL encoding are not modified
   */
  test('incorrect special characters (non existing file)', () => {
    const newContent = replacer.transformMarkdownLinks("[link](incorrect-%E0%A4%A-special-characters-included.md)")
    expect(newContent).toBe("[link](incorrect-%E0%A4%A-special-characters-included.md)")
  })

  /**
   * Test that web URLs are not modified
   */
  test('web url not replaced', () => {
    const original = "[link](https://search.example.com#somePointer)"
    expect(replacer.transformMarkdownLinks(original)).toBe(original)
  })

  /**
   * Test that links to non-existent files are not modified
   */
  test('not existing file not replaced', () => {
    const original = "[link](does:-not-exist.md#some-heading)"
    expect(replacer.transformMarkdownLinks(original)).toBe(original)
  })

  /**
   * Test that Markdown links with fragments (anchors) are properly processed
   */
  test('markdown file with fragment', () => {
    const newContent = replacer.transformMarkdownLinks("[link](to-a-file.md#my-headline)")
    expect(newContent).toBe("[link](to-a-file#my-headline)")
  })

  /**
   * Test that Markdown reference-style links are properly processed
   * Note: This functionality depends on the transform-markdown-links package
   */
  test('check that link references work', () => {
    const newContent = replacer.transformMarkdownLinks(`
[link][some-reference]

[some-reference]: to-a-file.md#my-headline`)
    expect(newContent).toBe(`
[link][some-reference]

[some-reference]: to-a-file#my-headline`)})

  /**
   * Clean up the mock filesystem after all tests are complete
   */
  afterAll(() => {
    mock.restore()
  })

})
