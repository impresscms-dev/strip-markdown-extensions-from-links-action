/**
 * Functions for getting information about local files
 */

import {existsSync} from 'fs'
import LinkInfo from '../entities/link-info.js'
import Filesystem from '../helpers/filesystem.js'

function getUrlParts(link, realFileName) {
  let url

  const tmpLink =  realFileName ? link.substring(realFileName.length) : link

  try {
    url = new URL(tmpLink, 'file://relative-url.localhost/')

    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return null
  }

  return [url.search ?? null, url.hash ?? null]
}

/**
 * Creates a LinkInfoEntity for a local file
 *
 * @param {string} link - The link or path to analyze
 * @param {string|null} base - The base path
 * @returns {Promise<LinkInfo>} A Promise that resolves to a LinkInfoEntity
 */
export default async function createLocalLinkInfo(link, base = null) {

  const realFileName = Filesystem.findBestFilenameFromLink(link, base)
  const extension = Filesystem.getExtension(realFileName)
  const [query, fragment] = getUrlParts(link, realFileName)

  return new LinkInfo({
    isLocal: true,
    exists: existsSync(realFileName),
    mimeType: Filesystem.detectMimeType(realFileName),
    query,
    fragment,
    realFileName,
    extension,
    fileNameWithoutExtension: Filesystem.stripExtensionFromLocalFilename(
      realFileName,
      extension,
      query,
      fragment,
      base
    ),
  })
}
