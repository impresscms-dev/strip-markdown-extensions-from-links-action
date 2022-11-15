import {describe, expect, test, afterAll} from '@jest/globals'
import linkReplacer from "../../src/helpers/link-replacer"
import mock from "mock-fs"
mock({
  'test-dir': {
    'to-a-file.md' : '',
    'special:characters-included.md' : ''
  }
  
})
linkReplacer.setFilesPath("test-dir")
describe('link-replacer', () => {
  test('normal markdown file', () => {    
    const newContent = linkReplacer.transformMarkdownLinks("[link](to-a-file.md)")
    expect(newContent).toBe("[link](to-a-file)")
  })
  test('special characters', () => {
    const newContent = linkReplacer.transformMarkdownLinks("[link](special:characters-included.md)")
    expect(newContent).toBe("[link](special%3Acharacters-included)")
  })
  test('do handle already escaped characters correctly', () => {
    const newContent = linkReplacer.transformMarkdownLinks("[link](special%3Acharacters-included.md)")
    expect(newContent).toBe("[link](special%3Acharacters-included)")
  })
  test('web url not replaced', () => {    
    const original = "[link](https://search.example.com#somePointer)"
    expect(linkReplacer.transformMarkdownLinks(original)).toBe(original)
  })
  test('not existing file not replaced', () => {
    const original = "[link](does:-not-exist.md#some-heading)"
    expect(linkReplacer.transformMarkdownLinks(original)).toBe(original)
  })
  test('markdown file with fragment', () => {
    const newContent = linkReplacer.transformMarkdownLinks("[link](to-a-file.md#my-headline)")
    expect(newContent).toBe("[link](to-a-file#my-headline)")
  })
  // Does not work due to used transform-markdown-links dependency
  test('check that link references work', () => {
    const newContent = linkReplacer.transformMarkdownLinks(`
[link][some-reference]

[some-reference]: to-a-file.md#my-headline`)
    expect(newContent).toBe(`
[link][some-reference]

[some-reference]: to-a-file#my-headline`)})
  afterAll(() => {
    mock.restore()    
  })
  
})
