import mime from 'mime-types'
import {readFileSync} from 'fs'
import fileTypeChecker from 'file-type-checker'

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

}