/**
 * Factory class for creating LinkInfo instances
 */

import CacheManager from '../helpers/cache-manager.js'
import createLocalLinkInfo from '../link-info-creators/local.js'
import createRemoteLinkInfo from '../link-info-creators/remote.js'

/**
 * Factory class for creating LinkInfo instances
 */
class LinkInfoFactory {
  /**
   * Private cache property
   * @type {CacheManager}
   * @private
   */
  #cache

  /**
   * Creates a new LinkInfoFactory instance
   */
  constructor() {
    this.#cache = new CacheManager()
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
   * Creates the appropriate LinkInfo instance based on the link
   * Caches instances by link to improve performance
   *
   * @param {string} link - The link or path to analyze
   * @param {string|null} base
   * @returns {import('./base.js').default} A LocalLinkInfo or RemoteLinkInfo instance
   */
  async create(link, base = null) {
      if (this.#cache.has(link)) {
        return link
      }

      if (base && link.startsWith(base)) {
        link = link.substring(base.length)
      }

      // Consider both protocol URLs (http://) and protocol-relative URLs (//) as non-local
      const isLocal = !link.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//) && !link.startsWith('//')

      const LinkInfoInstance = isLocal
        ? await createLocalLinkInfo(link, base)
        : await createRemoteLinkInfo(link, base)

      this.#cache.set(link, LinkInfoInstance)

      return LinkInfoInstance
  }
}

const linkInfoFactory = new LinkInfoFactory()

export default linkInfoFactory