/**
 * Helper class for handling ignore filter rules
 * Allows checking if a link in a specific file should be ignored
 */

import * as minimatch from 'minimatch'

class IgnoreFilter {
  /**
   * Map of ignore rules
   * @type {Map<string, string[]>}
   * @private
   */
  #rules = new Map()

  /**
   * Creates a new IgnoreFilter instance
   *
   * @param {Object|null} rulesObject - Object with rules where key is link pattern and value is file pattern
   */
  constructor(rulesObject = null) {
    if (rulesObject && typeof rulesObject === 'object') {
      for (const [linkPattern, filePatterns] of Object.entries(rulesObject)) {
        if (!this.#rules.has(linkPattern)) {
          this.#rules.set(linkPattern, [])
        }

        if (typeof filePatterns === 'string') {
          this.#rules.get(linkPattern).push(filePatterns)
        } else if (Array.isArray(filePatterns)) {
          this.#rules.get(linkPattern).push(...filePatterns)
        }
      }
    }
  }

  /**
   * Checks if a link in a specific file should be ignored
   *
   * @param {string} link - The link to check
   * @param {string} filePath - The file path where the link is located
   * @returns {boolean} - True if the link should be ignored, false otherwise
   */
  shouldIgnore(link, filePath) {
    for (const [linkPattern, filePatterns] of this.#rules.entries()) {
      if (minimatch.minimatch(link, linkPattern)) {
        for (const filePattern of filePatterns) {
          if (minimatch.minimatch(filePath, filePattern)) {
            return true
          }
        }
      }
    }

    return false
  }
}

export default IgnoreFilter
