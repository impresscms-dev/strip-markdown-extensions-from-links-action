/**
 * Class for getting information about remote links
 */

import LinkInfoBase from './base.js'

/**
 * Class for getting information about remote links
 */
class RemoteLinkInfo extends LinkInfoBase {
  /**
   * Determines if the link is a local file or a remote URL
   * Always returns false for RemoteLinkInfo instances
   *
   * @returns {boolean} Always false
   */
  get isLocal() {
    return false
  }

  /**
   * Checks if a remote link exists (always returns false without making a request)
   * To actually check if a remote link exists, use info.fetch()
   *
   * @returns {boolean} Always false without making a request
   */
  get exists() {
    return this.cache.remember('exists', () => {
      return this.cache.get('statusCode') >= 200 && this.cache.get('statusCode') < 300 && !this.cache.get('error')
    })
  }

  /**
   * Gets the MIME type of the remote link (always returns null without making a request)
   * To actually get the MIME type, use info.fetch()
   *
   * @returns {string|null} Always null without making a request
   */
  get mimeType() {
    return this.cache.remember('mimeType', () => {
      return this.cache.get('mimeType')
    })
  }

  /**
   * Gets the query string from the link (e.g., ?param=value)
   *
   * @returns {string|null} The query string (including the ? character), or null if there's no query string
   */
  get query() {
    return this.cache.remember('query', () => {
      try {
        const url = new URL(this.link)
        return url.search || null

        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        return null
      }
    })
  }

  /**
   * Gets the fragment from the link (e.g., #section)
   *
   * @returns {string|null} The fragment (including the # character), or null if there's no fragment
   */
  get fragment() {
    return this.cache.remember('fragment', () => {
      try {
        const url = new URL(this.link)
        return url.hash || null

        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        return null
      }
    })
  }

  /**
   * Updates the cache with detailed information about a remote link by making an HTTP request
   * This is a private method that should not be called directly
   *
   * @returns {Promise<void>} Promise that resolves when the cache has been updated
   * @private
   */
  async #updateInfo() {
    if (this.cache.has('realUrl')) {
      return
    }

    try {
      const controller = new AbortController()
      let timeoutId = null

      try {
        timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(this.link, {
          method: 'HEAD',
          signal: controller.signal
        })

        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        this.cache.set('realUrl', this.link)
        this.cache.set('statusCode', response.status)
        this.cache.set('mimeType', response.headers.get('content-type') || null)

        const contentDisposition = response.headers.get('content-disposition')
        let filename = null
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1]
          }
        } else {
          filename = `${this.link.split('/').pop()}.${this.extension}`
        }
        this.cache.set('realFileName', filename)
        this.cache.set('error', null)
      } catch (error) {
        this.cache.set('realUrl', this.link)
        this.cache.set('statusCode', 0)
        this.cache.set('mimeType', null)
        this.cache.set('realFileName', null)
        this.cache.set('error', error.message)
      } finally {
        timeoutId && clearTimeout(timeoutId)
      }
    } catch (error) {
      this.cache.set('realUrl', this.link)
      this.cache.set('statusCode', 0)
      this.cache.set('mimeType', null)
      this.cache.set('realFileName', null)
      this.cache.set('error', error.message)
    }
  }

}

export default RemoteLinkInfo
