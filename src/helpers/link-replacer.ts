import {existsSync} from "fs"
import {extname} from "path"

let filesPath: string

export function setFilesPath(path: string): void {
  filesPath = path
}

export function processLink (link: string): string {
  const fullPath: string = filesPath + '/' + link

  if (!existsSync(fullPath)) {
    return link
  }

  if (extname(fullPath) !== '.md') {
    return link
  }

  return encodeURIComponent(link.substring(0, link.length - 3))
}

export default {
  setFilesPath,
  processLink
}
