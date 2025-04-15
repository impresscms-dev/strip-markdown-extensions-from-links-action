/**
 * Entity class for storing link information
 * Provides read-only access to all cache keys
 */
class LinkInfo {
  /**
   * Private data map
   * @type {Map<string, any>}
   * @private
   */
  #data

  /**
   * Creates a new LinkInfoEntity instance
   *
   * @param {Object} [initialData={}] - Optional initial data for the entity
   */
  constructor(initialData = {}) {
    this.#data = new Map()

    this.clear()

    Object.entries(initialData).forEach(([key, value]) => {
      if (this.#data.has(key)) {
        this.#data.set(key, value)
      }
    })
  }

  /**
   * Determines if the link is a local file or a remote URL
   *
   * @returns {boolean} True if the link is local, false if it's remote
   */
  get isLocal() {
    return this.#data.get('isLocal')
  }

  /**
   * Checks if a file/url exists
   *
   * @returns {boolean} True if the file exists, false otherwise
   */
  get exists() {
    return this.#data.get('exists')
  }

  /**
   * Gets the MIME type of the link
   *
   * @returns {string|null} The MIME type of the link, or null if it can't be determined
   */
  get mimeType() {
    return this.#data.get('mimeType')
  }

  /**
   * Gets the query string from the link (e.g., ?param=value)
   *
   * @returns {string|null} The query string (including the ? character), or null if there's no query string
   */
  get query() {
    return this.#data.get('query')
  }

  /**
   * Gets the fragment from the link (e.g., #section)
   *
   * @returns {string|null} The fragment (including the # character), or null if there's no fragment
   */
  get fragment() {
    return this.#data.get('fragment')
  }

  /**
   * Gets the real file name
   *
   * @returns {string|null} The real file name, or null if it can't be determined
   */
  get realFileName() {
    return this.#data.get('realFileName')
  }

  /**
   * Gets the file extension from the link
   *
   * @returns {string|null} The file extension (without the dot), or null if it can't be determined
   */
  get extension() {
    return this.#data.get('extension')
  }

  /**
   * Gets the real URL of the link
   *
   * @returns {string|null} The real URL, or null if it can't be determined
   */
  get realUrl() {
    return this.#data.get('realUrl')
  }

  /**
   * Gets the HTTP status code of the link
   *
   * @returns {number} The HTTP status code, or 0 if not available
   */
  get statusCode() {
    return this.#data.get('statusCode')
  }

  /**
   * Gets any error that occurred while processing the link
   *
   * @returns {string|null} The error message, or null if no error occurred
   */
  get error() {
    return this.#data.get('error')
  }

  /**
   * Gets the file name without the extension
   *
   * @returns {string|null} The file name without the extension, or null if it can't be determined
   */
  get fileNameWithoutExtension() {
    return this.#data.get('fileNameWithoutExtension')
  }

  /**
   * Clears all data in the internal data map
   * This method is intended for internal use only
   *
   * @private
   */
  clear() {
    this.#data.set('isLocal', false)
    this.#data.set('exists', false)
    this.#data.set('mimeType', null)
    this.#data.set('query', null)
    this.#data.set('fragment', null)
    this.#data.set('realFileName', null)
    this.#data.set('extension', null)
    this.#data.set('realUrl', null)
    this.#data.set('statusCode', 0)
    this.#data.set('error', null)
    this.#data.set('fileNameWithoutExtension', null)
  }

  /**
   * Checks if a link points to a markdown file based on MIME type
   *
   * @returns {boolean} True if the link points to a markdown file, false otherwise
   */
  get isMarkdown() {
    return ['text/markdown', 'text/x-markdown', 'application/markdown'].includes(this.mimeType)
  }
}

export default LinkInfo
