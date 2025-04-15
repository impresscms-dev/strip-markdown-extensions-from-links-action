/**
 * Functions for getting information about remote links
 */

import LinkInfo from '../entities/link-info.js'

/**
 * Creates a LinkInfoEntity for a remote link
 *
 * @param {string} link - The link to analyze
 * @param {string|null} base - The base path (ignored for remote links)
 * @returns {Promise<LinkInfo>} A Promise that resolves to a LinkInfoEntity
 */
async function createRemoteLinkInfo(link, base = null) {
  const data = {}

  try {
    const controller = new AbortController()
    let timeoutId = null

    try {
      timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(link, {
        method: 'HEAD',
        signal: controller.signal
      })

      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }

      data.realUrl = link
      data.statusCode = response.status
      data.mimeType = response.headers.get('content-type') || null

      const contentDisposition = response.headers.get('content-disposition')
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
        if (filenameMatch && filenameMatch[1]) {
          data.realFileName = filenameMatch[1]
        } else {
          data.realFileName = null
        }
      } else {
        data.realFileName = link.split('/').pop() || link
      }
      data.error = null
    } catch (error) {
      data.realUrl = link
      data.statusCode = 0
      data.mimeType = null
      data.realFileName = null
      data.error = error.message
    } finally {
      timeoutId && clearTimeout(timeoutId)
    }
  } catch (error) {
    data.realUrl = link
    data.statusCode = 0
    data.mimeType = null
    data.realFileName = null
    data.error = error.message
  }

  data.query = null
  data.fragment = null
  data.exists = data.statusCode >= 200 && data.statusCode < 300 && !data.error
  data.filenameWithoutExtension = link

  return new LinkInfo(data)
}

export default createRemoteLinkInfo
