import {existsSync} from "fs"
import {extname} from "path"
import transformLinks from "transform-markdown-links"

class LinkReplacer {

  private readonly filesPath: string

  constructor(filesPath: string) {
    this.filesPath = filesPath
  }

  protected safeDecodeURIComponent(str: string): string {
    try {
      return decodeURIComponent(str)
    } catch (e) {
      return str
    }
  }

  transformMarkdownLinks(oldContent: string): string {
    return transformLinks(
        oldContent,
        (link: string) => this.processLink(link)
    )
  }

  protected extractLinkParts(link: string): string[] {
    if (!link.includes('#')) {
      return [link, ""]
    }

    return link.split("#", 2)
  }

  processLink(link: string): string {
    const [potentialEncodedFile, fragment] = this.extractLinkParts(link)
    const potentialFile = this.safeDecodeURIComponent(potentialEncodedFile)
    const fullPath: string = this.filesPath + '/' + potentialFile

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

}

export default LinkReplacer
