import {existsSync} from "fs"
import {extname} from "path"
import transformLinks from "transform-markdown-links"

let filesPath: string

export function setFilesPath(path: string): void {
  filesPath = path
}
export function transformMarkdownLinks(oldContent: string): string {
  return transformLinks(oldContent,processLink)
}

function safeDecodeURIComponent(str: string): string {
  try {
    return decodeURIComponent(str)
  } catch (e) {
    return str
  }
}

function processLink (link: string): string {
  const [potentialEncodedFile, fragment] = link.split("#")
  const potentialFile = safeDecodeURIComponent(potentialEncodedFile)
  const fullPath: string = filesPath + '/' + potentialFile

  if (!existsSync(fullPath)) {
    return link
  }

  if (extname(fullPath) !== '.md') {
    return link
  }

  const uriPath = encodeURIComponent(potentialFile.substring(0, potentialFile.length - 3))
  if(!fragment){
    return uriPath
  }
  return uriPath + "#"+ encodeURIComponent(fragment)  
}

export default {
  setFilesPath,  
  transformMarkdownLinks
}
