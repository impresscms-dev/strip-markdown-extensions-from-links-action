import {existsSync} from 'fs'
import {extname} from 'path'
import transformLinks from 'transform-markdown-links'

/**
 * Class responsible for replacing Markdown file extensions in links
 * Used to make links work with GitHub wiki
 */
class LinkReplacer {
  /**
   * Creates a new LinkReplacer instance
   *
   * @param {string} filesPath - The base path where Markdown files are located
   */
  constructor(filesPath) {
    this.filesPath = filesPath
  }

  /**
   * Safely decodes a URI component, returning the original string if decoding fails
   *
   * @param {string} str - The string to decode
   * @returns {string} The decoded string or the original string if decoding fails
   */
  safeDecodeURIComponent(str) {
    try {
      return decodeURIComponent(str)
    } catch (e) {
      return str
    }
  }

  /**
   * Transforms all Markdown links in the content by removing .md extensions
   *
   * @param {string} oldContent - The original Markdown content
   * @returns {string} The transformed Markdown content with processed links
   */
  transformMarkdownLinks(oldContent) {
    return transformLinks(
        oldContent,
        (link) => this.processLink(link)
    )
  }

  /**
   * Extracts the file path and fragment (anchor) parts from a link
   *
   * @param {string} link - The link to extract parts from
   * @returns {string[]} An array containing the file path and fragment
   */
  extractLinkParts(link) {
    if (!link.includes('#')) {
      return [link, ""]
    }

    return link.split("#", 2)
  }

  /**
   * Processes a single link, removing the .md extension if it's a valid Markdown file
   *
   * @param {string} link - The link to process
   * @returns {string} The processed link with .md extension removed if applicable
   */
  processLink(link) {
    const [potentialEncodedFile, fragment] = this.extractLinkParts(link)
    const potentialFile = this.safeDecodeURIComponent(potentialEncodedFile)
    const fullPath = this.filesPath + '/' + potentialFile

    if (!existsSync(fullPath)) {
      return link
    }

    if (extname(fullPath) !== '.md') {
      return link
    }

    const uriPath = encodeURIComponent(potentialFile.substring(0, potentialFile.length - 3))
    if(!fragment){
      return uriPath
    }
    return uriPath + "#"+ encodeURIComponent(fragment)
  }
}

export default LinkReplacer
