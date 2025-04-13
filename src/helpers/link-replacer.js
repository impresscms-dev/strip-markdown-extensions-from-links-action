import transformLinks from 'transform-markdown-links'
import LinkInfoFactory from '../link-info/factory.js'

/**
 * Class responsible for replacing Markdown file extensions in links
 * Used to make links work with GitHub wiki
 */
class LinkReplacer {
  /**
   * Creates a new LinkReplacer instance
   *
   * @param {string} filesPath - The base path where Markdown files are located
   */
  constructor(filesPath) {
    this.filesPath = filesPath
  }

  /**
   * Transforms all Markdown links in the content by removing .md extensions
   *
   * @param {string} oldContent - The original Markdown content
   * @returns {string} The transformed Markdown content with processed links
   */
  transformMarkdownLinks(oldContent) {
    return transformLinks(
        oldContent,
        (link) => this.processLink(link)
    )
  }

  /**
   * Processes a single link, removing the .md extension if it's a valid Markdown file
   *
   * @param {string} link - The link to process
   *
   * @returns {string} The processed link with .md extension removed if applicable
   */
  processLink(link) {
    const linkInfo = LinkInfoFactory.create(link, this.filesPath)

    if (!linkInfo.isLocal || !linkInfo.exists || !linkInfo.isMarkdown) {
      return link
    }

    let newFileName = linkInfo.realFileName.startsWith(this.filesPath)
      ? linkInfo.realFileName.substring(this.filesPath.length)
      : linkInfo.realFileName

    newFileName = newFileName.substring(0, newFileName.length - linkInfo.extension.length - 1)
    if (linkInfo.query) {
      newFileName += linkInfo.query
    }
    if (linkInfo.fragment) {
      newFileName += linkInfo.fragment
    }

    return newFileName
  }
}

export default LinkReplacer
