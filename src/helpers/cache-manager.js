/**
 * Cache manager class for storing and retrieving cached values
 */
class CacheManager {
  /**
   * Private cache property
   * @type {Map}
   * @private
   */
  #cache;

  /**
   * Creates a new CacheManager instance
   */
  constructor() {
    this.#cache = new Map();
  }

  /**
   * Gets the cache map
   *
   * @returns {Map} The cache map
   */
  get cache() {
    return this.#cache;
  }

  /**
   * Sets a value in the cache
   *
   * @param {string} key - The cache key
   * @param {*} value - The value to store
   * @returns {*} The stored value
   */
  set(key, value) {
    this.#cache.set(key, value);
    return value;
  }

  /**
   * Gets a value from the cache
   *
   * @param {string} key - The cache key
   * @returns {*} The cached value or undefined if not found
   */
  get(key) {
    return this.#cache.get(key);
  }

  /**
   * Checks if a key exists in the cache
   *
   * @param {string} key - The cache key
   * @returns {boolean} True if the key exists, false otherwise
   */
  has(key) {
    return this.#cache.has(key);
  }

  /**
   * Gets a value from the cache or computes and stores it if not available
   * Similar to Laravel's remember function
   *
   * @param {string} key - The cache key
   * @param {Function} callback - The function to compute the value if not cached
   * @returns {*} The cached or computed value
   */
  remember(key, callback) {
    // Return cached value if available
    if (this.#cache.has(key)) {
      return this.#cache.get(key);
    }

    // Compute the value
    const result = callback();

    // If the result is a Promise, handle it specially
    if (result instanceof Promise) {
      return result.then(resolvedValue => {
        return this.set(key, resolvedValue);
      });
    }

    // Cache the result
    return this.set(key, result);
  }

  /**
   * Clears the cache
   */
  clear() {
    this.#cache.clear();
  }

  /**
   * Removes a specific key from the cache
   *
   * @param {string} key - The cache key to remove
   * @returns {boolean} True if the key was in the cache and has been removed, false otherwise
   */
  forget(key) {
    return this.#cache.delete(key);
  }
}

export default CacheManager;
