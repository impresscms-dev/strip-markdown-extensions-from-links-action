import {describe, expect, test} from '@jest/globals'
import IgnoreFilter from '../../src/helpers/ignore-filter.js'

describe('IgnoreFilter', () => {
  test('should create an instance with no rules', () => {
    const filter = new IgnoreFilter()
    expect(filter.shouldIgnore('test.md', 'path/to/file.md')).toBe(false)
  })

  test('should ignore links based on exact match', () => {
    const rules = {
      'test.md': 'path/to/file.md'
    }
    const filter = new IgnoreFilter(rules)

    expect(filter.shouldIgnore('test.md', 'path/to/file.md')).toBe(true)
    expect(filter.shouldIgnore('other.md', 'path/to/file.md')).toBe(false)
    expect(filter.shouldIgnore('test.md', 'other/path.md')).toBe(false)
  })

  test('should ignore links based on glob patterns', () => {
    const rules = {
      '*.md': ['path/to/*.md'],
      'docs/*.md': ['src/**/*.js']
    }
    const filter = new IgnoreFilter(rules)

    expect(filter.shouldIgnore('test.md', 'path/to/file.md')).toBe(true)
    expect(filter.shouldIgnore('docs/api.md', 'src/components/Button.js')).toBe(true)
    expect(filter.shouldIgnore('docs/api.md', 'path/to/file.md')).toBe(false)
    expect(filter.shouldIgnore('test.txt', 'path/to/file.md')).toBe(false)
  })

  test('should handle array of file patterns', () => {
    const rules = {
      'test.md': ['path/to/file.md', 'other/path.md']
    }
    const filter = new IgnoreFilter(rules)

    expect(filter.shouldIgnore('test.md', 'path/to/file.md')).toBe(true)
    expect(filter.shouldIgnore('test.md', 'other/path.md')).toBe(true)
    expect(filter.shouldIgnore('test.md', 'different/path.md')).toBe(false)
  })

  test('should handle wildcard patterns correctly', () => {
    const rules = {
      '*': '*'
    }

    const filter = new IgnoreFilter(rules)
    // With minimatch, * matches any string without path separators
    expect(filter.shouldIgnore('test.md', '*')).toBe(true)
  })

  test('should handle wildcard patterns for markdown files', () => {
    const rules = {
      '*.md': '*.md'
    }

    const filter = new IgnoreFilter(rules)
    // With minimatch, *.md matches any string ending with .md without path separators
    expect(filter.shouldIgnore('test.md', 'test.md')).toBe(true)
  })

  test('should handle array of wildcard patterns', () => {
    const rules = {
      '*': ['some-file.md', '*']
    }

    const filter = new IgnoreFilter(rules)
    // With minimatch, * matches any string without path separators
    expect(filter.shouldIgnore('test.md', '*')).toBe(true)
  })
})
