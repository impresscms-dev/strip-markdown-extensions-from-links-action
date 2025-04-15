/**
 * Functions for getting information about local files
 */

import {existsSync} from 'fs'
import {resolve, extname} from 'path'
import LinkInfo from '../entities/link-info.js'
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

function getUrlParts(link, realFileName) {
  let url

  const tmpLink =  realFileName ? link.substring(realFileName.length) : link

  try {
    url = new URL(tmpLink, 'file://relative-url.localhost/')

    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return null
  }

  return [url.query ?? null, url.hash ?? null]
}

/**
 * Creates a LinkInfoEntity for a local file
 *
 * @param {string} link - The link or path to analyze
 * @param {string|null} base - The base path
 * @returns {Promise<LinkInfo>} A Promise that resolves to a LinkInfoEntity
 */
export default async function createLocalLinkInfo(link, base = null) {

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

  const exists = existsSync(realFileName)

  const extension = extname(realFileName).substring(1) || null

  const mimeType = Filesystem.detectMimeType(realFileName)

  const [query, fragment] = getUrlParts(link, realFileName)

  let fileNameWithoutExtension = realFileName

  if (base && realFileName.startsWith(base)) {
    const realBase = resolve(base)
    fileNameWithoutExtension = resolve(realFileName).substring(realBase.length + 1)
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

  return new LinkInfo({
    isLocal: true,
    exists,
    mimeType,
    query,
    fragment,
    realFileName,
    extension,
    fileNameWithoutExtension,
  })
}
