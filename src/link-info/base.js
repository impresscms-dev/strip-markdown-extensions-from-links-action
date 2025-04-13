/**
 * Base abstract class for link information
 * Provides common functionality for both local and remote links
 */

import CacheManager from '../helpers/cache-manager.js'
import AbstractMethodError from '../errors/abstract-method-error.js'
import AbstractClassError from '../errors/abstract-class-error.js'
import {extname} from 'path'

/**
 * Abstract base class for link information
 */
class LinkInfoBase {
  /**
   * Private link property
   * @type {string}
   * @private
   */
  #link

  /**
   * Private cache property
   * @type {CacheManager}
   * @private
   */
  #cache

  /**
   * Private base property
   * @type {string}
   * @private
   */
  #base

  /**
   * Creates a new LinkInfoBase instance
   *
   * @param {string} link - The link or path to analyze
   * @param {null|string} base Base Path
   */
  constructor(link, base) {
    if (this.constructor === LinkInfoBase) {
      throw new AbstractClassError('LinkInfoBase')
    }

    this.#link = link
    this.#base = base
    this.#cache = new CacheManager()
  }

  /**
   * Gets the base path property
   *
   * @returns {string}
   */
  get base() {
    return this.#base
  }

  /**
   * Gets the link property
   *
   * @returns {string} The link or path being analyzed
   */
  get link() {
    return this.#link
  }

  /**
   * Gets the cache manager
   *
   * @returns {CacheManager} The cache manager instance
   */
  get cache() {
    return this.#cache
  }

  /**
   * Determines if the link is a local file or a remote URL
   * This is an abstract method that should be overridden by subclasses
   *
   * @returns {boolean} True if the link is local, false if it's remote
   */
  get isLocal() {
    throw new AbstractMethodError('isLocal')
  }

  /**
   * Gets the MIME type of the link
   * This is an abstract method that should be overridden by subclasses
   *
   * @returns {string|null} The MIME type of the link, or null if it can't be determined
   */
  get mimeType() {
    throw new AbstractMethodError('mimeType')
  }

  /**
   * Checks if a link points to a markdown file based on MIME type
   *
   * @returns {boolean} True if the link points to a markdown file, false otherwise
   */
  get isMarkdown() {
    return this.cache.remember('isMarkdown', () => {
      return ['text/markdown', 'text/x-markdown', 'application/markdown'].includes(this.mimeType)
    })
  }

  /**
   * Checks if a file/url exists
   *
   * @returns {boolean} True if the file exists, false otherwise
   */
  get exists() {
    throw new AbstractMethodError('exists')
  }

  /**
   * Gets the query string from the link (e.g., ?param=value)
   * This is an abstract method that should be overridden by subclasses
   *
   * @returns {string|null} The query string (including the ? character), or null if there's no query string
   */
  get query() {
    throw new AbstractMethodError('query')
  }

  /**
   * Gets the fragment from the link (e.g., #section)
   * This is an abstract method that should be overridden by subclasses
   *
   * @returns {string|null} The fragment (including the # character), or null if there's no fragment
   */
  get fragment() {
    throw new AbstractMethodError('fragment')
  }

  /**
   * Gets the real file name
   *
   * @returns {string} The real file name
   */
  get realFileName() {
    throw new AbstractMethodError('realFileName')
  }

  /**
   * Gets the file name without the extension
   *
   * @returns {string} The file name without the extension
   */
  get fileNameWithoutExtension() {
    throw new AbstractMethodError('fileNameWithoutExtension')
  }

  /**
   * Gets the file extension from the link
   *
   * @returns {string|null} The file extension (without the dot), or null if it can't be determined
   */
  get extension() {
    return this.cache.remember('extension', () => {
      const ext = extname(this.realFileName)
      return ext ? ext.substring(1) : null
    })
  }
}

export default LinkInfoBase
