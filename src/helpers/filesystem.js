import mime from 'mime-types'
import {existsSync, readFileSync} from 'fs'
import fileTypeChecker from 'file-type-checker'
import {extname, resolve} from 'path'

export default class Filesystem {
  /**
   * Detects the MIME type of file
   *
   * @param {string} filename - The path to the file
   * @returns {string} The MIME type of the file
   */
  static detectMimeType(filename) {
    try {
      const buffer = readFileSync(filename)
      const fileType = fileTypeChecker.detectFile(buffer)

      if (fileType && fileType.mimeType) {
        return fileType.mimeType
      }

      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      // ignore error
    }

    const mimeType = mime.lookup(filename)
    return mimeType || 'application/octet-stream'
  }

  /**
   * Gets the extension of a filename
   *
   * @param {string} filename
   *
   * @returns {string|null}
   */
  static getExtension(filename) {
    if (!filename) {
      return null
    }

    let extension = extname(filename)
    if (!extension || extension === '.') {
      return null
    }

    extension = extension.substring(1)
    if (extension.includes('?') || extension.includes('#')) {
      return null
    }

    return extension
  }

  /**
   * Strips the extension from a local filename
   *
   * @param {string} filename
   * @param {string|null} extension
   * @param {string|null} query
   * @param {string|null} fragment
   * @param {string|null} basePath
   *
   * @returns {string}
   */
  static stripExtensionFromLocalFilename(filename, extension, query, fragment, basePath) {
    if (!filename) {
      return filename
    }

    let fileNameWithoutExtension = filename

    if (basePath && filename.startsWith(basePath)) {
      const realBase = resolve(basePath)
      fileNameWithoutExtension = resolve(filename).substring(realBase.length + 1)
    }

    if (extension) {
      fileNameWithoutExtension = fileNameWithoutExtension.substring(0, fileNameWithoutExtension.length - extension.length - 1)
    }

    fileNameWithoutExtension = encodeURIComponent(fileNameWithoutExtension).replace(/%2F/g, '/')

    if (query) {
      fileNameWithoutExtension += query
    }
    if (fragment) {
      fileNameWithoutExtension += fragment
    }

    return fileNameWithoutExtension
  }

  /**
   * Helper function to make a possible filename from a path
   *
   * @param {string} path - The path to process
   * @param {string|null} base - The base path
   * @returns {string} The possible filename
   */
  static #makePossibleFilename(path, base) {
    let possibleFilename = path
    if (base && base.length > 0) {
      possibleFilename = `${base}/${possibleFilename}`
    }
    return possibleFilename
  }

  static findBestFilenameFromLink(link, base) {
    let url
    try {
      url = new URL(link, 'file://relative-url.localhost/')

      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      return
    }

    let parsedPath = url.pathname
    if (parsedPath.startsWith('/')) {
      parsedPath = parsedPath.substring(1)
    }

    let decodedPath
    try {
      decodedPath = decodeURIComponent(parsedPath)
      // eslint-disable-next-line no-unused-vars
    } catch (_e) {
      decodedPath = null
    }

    const possibleFilenames = [
      Filesystem.#makePossibleFilename(parsedPath, base),
    ]

    if (decodedPath) {
      possibleFilenames.push(
        Filesystem.#makePossibleFilename(decodedPath, base)
      )
    }

    if (url.search) {
      possibleFilenames.push(
        Filesystem.#makePossibleFilename(`${parsedPath}${url.search}`, base)
      )
    } else if (url.hash) {
      possibleFilenames.push(
        Filesystem.#makePossibleFilename(`${parsedPath}${url.hash}`, base)
      )
    }

    if (decodedPath) {
      if (url.search) {
        possibleFilenames.push(
          Filesystem.#makePossibleFilename(`${decodedPath}${url.search}`, base)
        )
      } else if (url.hash) {
        possibleFilenames.push(
          Filesystem.#makePossibleFilename(`${decodedPath}${url.hash}`, base)
        )
      }
    }

    for (const possibleFilename of possibleFilenames) {
      if (existsSync(possibleFilename)) {
        return possibleFilename
      }
    }

    return link
  }

}