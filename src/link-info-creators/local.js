/**
 * Functions for getting information about local files
 */

import {existsSync} from 'fs'
import {resolve, extname} from 'path'
import LinkInfoEntity from '../entities/link-info-entity.js'
import Filesystem from '../helpers/filesystem.js'

/**
 * Helper function to resolve the real filename from a link
 *
 * @param {string} link - The link to resolve
 * @param {string|null} base - The base path
 * @returns {string|null} The resolved filename or null if it can't be resolved
 */
function resolveRealFilenameFromLink(link, base) {
  if (existsSync(link)) {
    return link
  }

  let possibleFilename = makePossibleFilename(link, base)
  if (existsSync(possibleFilename)) {
    return possibleFilename
  }

  let url
  try {
    url = new URL(link, 'file://relative-url.localhost/')

    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return null
  }

  if (url.hash) {
    possibleFilename = makePossibleFilename(`${url.pathname}${url.search}`, base)
    if (existsSync(possibleFilename)) {
      return possibleFilename
    }
  }

  possibleFilename = makePossibleFilename(url.pathname, base)
  if (existsSync(possibleFilename)) {
    return possibleFilename
  }

  return null
}

/**
 * Helper function to make a possible filename from a path
 *
 * @param {string} path - The path to process
 * @param {string|null} base - The base path
 * @returns {string} The possible filename
 */
function makePossibleFilename(path, base) {
  let possibleFilename = path
  if (base && base.length > 0) {
    possibleFilename = `${base}/${possibleFilename}`
  }
  return possibleFilename
}

/**
 * Creates a LinkInfoEntity for a local file
 *
 * @param {string} link - The link or path to analyze
 * @param {string|null} base - The base path
 * @returns {Promise<LinkInfoEntity>} A Promise that resolves to a LinkInfoEntity
 */
export default async function createLocalLinkInfo(link, base = null) {

  // Get the real file name
  const getRealFileName = () => {
    let possibleFilename

    try {
      possibleFilename = resolveRealFilenameFromLink(
        decodeURIComponent(link),
        base
      )

      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      possibleFilename = null
    }

    if (possibleFilename) {
      return possibleFilename
    }

    return resolveRealFilenameFromLink(link, base) ?? makePossibleFilename(link, base)
  }

  const realFileName = getRealFileName()

  // Check if the file exists
  const exists = existsSync(realFileName)

  // Get the file extension
  const extension = extname(realFileName).substring(1) || null

  // Get the MIME type
  const mimeType = Filesystem.detectMimeType(realFileName)

  // Get the query string and fragment
  let query = null
  let fragment = null
  try {
    const url = new URL(link, 'file://relative-url.localhost/')
    query = url.search || null
    fragment = url.hash || null

    // eslint-disable-next-line no-unused-vars
  } catch (e) {

  }

  // Get the file name without extension
  let fileNameWithoutExtension = realFileName

  if (base && realFileName.startsWith(base)) {
    const realBase = resolve(base)
    fileNameWithoutExtension = resolve(realFileName).substring(realBase.length + 1)
  }

  if (extension) {
    fileNameWithoutExtension = fileNameWithoutExtension.substring(0, fileNameWithoutExtension.length - extension.length - 1)
  }

  fileNameWithoutExtension = encodeURIComponent(fileNameWithoutExtension)

  if (query) {
    fileNameWithoutExtension += query
  }
  if (fragment) {
    fileNameWithoutExtension += fragment
  }

  return new LinkInfoEntity({
    exists,
    mimeType,
    query,
    fragment,
    realFileName,
    extension,
    fileNameWithoutExtension,
  })
}
