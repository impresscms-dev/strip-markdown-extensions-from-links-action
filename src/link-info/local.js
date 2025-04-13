/**
 * Class for getting information about local files
 */

import {existsSync, readFileSync} from 'fs'
import {extname} from 'path'
import fileTypeChecker from 'file-type-checker'
import mime from 'mime-types'
import LinkInfoBase from './base.js'

/**
 * Class for getting information about local files
 */
class LocalLinkInfo extends LinkInfoBase {
  /**
   * Determines if the link is a local file or a remote URL
   * Always returns true for LocalLinkInfo instances
   *
   * @returns {boolean} Always true
   */
  get isLocal() {
    return true
  }
  /**
   * Checks if a file exists
   *
   * @returns {boolean} True if the file exists, false otherwise
   */
  get exists() {
    return this.cache.remember('exists', () => {
      return existsSync(this.realFileName)
    })
  }

  /**
   * Gets the MIME type of the file
   *
   * @returns {string|null} The MIME type of the file, or null if it can't be determined
   */
  get mimeType() {
    return this.cache.remember('mimeType', () => {
      if (!this.exists) {
        return null
      }

      try {
        const buffer = readFileSync(this.realFileName)
        const fileType = fileTypeChecker.detectFile(buffer)

        if (fileType && fileType.mimeType) {
          return fileType.mimeType
        }
      } catch (error) {
        return 'application/octet-stream'
      }

      const mimeType = mime.lookup(this.realFileName)
      return mimeType || 'application/octet-stream'
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
        const url = new URL(this.link, 'file://relative-url.localhost/')
        return url.search || null
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
        const url = new URL(this.link, 'file://relative-url.localhost/')
        return url.hash || null
      } catch (e) {
        return null
      }
    })
  }

  /**
   * Resolves the real filename from the link
   *
   * @param {string} link
   *
   * @returns {string|null}
   */
  #resolveRealFilenameFromLink(link) {
    if (existsSync(link)) {
      return link
    }

    let url
    try {
      url = new URL(link, 'file://relative-url.localhost/')
    } catch (e) {
      return null
    }

    let possibleFilename
    if (url.hash) {
      possibleFilename = this.#makePossibleFilename(`${url.pathname}${url.search}`)
      if (existsSync(possibleFilename)) {
        return possibleFilename
      }
    }

    possibleFilename = this.#makePossibleFilename(url.pathname)
    if (existsSync(possibleFilename)) {
      return possibleFilename
    }

    return null
  }

  /**
   * Makes a possible filename from a path
   *
   * @param {string} path
   *
   * @returns {string}
   */
  #makePossibleFilename(path) {
    let possibleFilename = path
    if (this.base && this.base.length > 0) {
      possibleFilename = `${this.base}/${possibleFilename}`
    }
    return possibleFilename
  }

  /**
   * Gets the real file name without query parameters and fragments
   *
   * @returns {string} The real file name
   */
  get realFileName() {
    return this.cache.remember('realFileName', () => {
      let possibleFilename

      try {
        possibleFilename = this.#resolveRealFilenameFromLink(
          decodeURIComponent(this.link)
        )
      } catch (e) {
        possibleFilename = null
      }

      if (possibleFilename) {
        return possibleFilename
      }

      return this.#resolveRealFilenameFromLink(this.link) ?? this.link
    })
  }
}

export default LocalLinkInfo
