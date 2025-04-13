/**
 * Factory class for creating LinkInfo instances
 */

import LocalLinkInfo from './local.js'
import RemoteLinkInfo from './remote.js'
import CacheManager from '../helpers/cache-manager.js'

/**
 * Factory class for creating LinkInfo instances
 */
class LinkInfoFactory {
  /**
   * Private cache property
   * @type {CacheManager}
   * @private
   */
  #cache;

  /**
   * Creates a new LinkInfoFactory instance
   */
  constructor() {
    // Create a cache manager for this instance
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
  create(link, base = null) {
    return this.cache.remember(link, () => {

      if (base && link.startsWith(base)) {
        link = link.substring(base.length)
      }

      const isLocal = !link.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//)

      return isLocal
        ? new LocalLinkInfo(link, base)
        : new RemoteLinkInfo(link, base)
    })
  }
}

const factory = new LinkInfoFactory()

export default factory