import MarkdownIt from 'markdown-it/dist/markdown-it.js'
import LinkInfoFactory from './link-info-factory.js'

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
   * @returns {Promise<string>} The transformed Markdown content with processed links
   */
  async transformMarkdownLinks(oldContent) {
    
    const md = new MarkdownIt()

    const defaultLinkOpenRenderer = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }

    const linkMap = new Map()

    md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
      const token = tokens[idx]
      const hrefIndex = token.attrIndex('href')

      if (hrefIndex >= 0) {
        const href = token.attrs[hrefIndex][1]

        const placeholder = `__LINK_PLACEHOLDER_${idx}__`
        linkMap.set(placeholder, href)

        token.attrs[hrefIndex][1] = placeholder
      }

      return defaultLinkOpenRenderer(tokens, idx, options, env, self)
    }

    const html = md.render(oldContent)

    const mdParser = new MarkdownIt()

    const tokens = mdParser.parse(html, {})

    const linkPromises = []
    for (const [placeholder, originalHref] of linkMap.entries()) {
      linkPromises.push(
        this.processLink(originalHref).then(processedHref => {
          return { placeholder, processedHref }
        })
      )
    }

    const processedLinks = await Promise.all(linkPromises)

    const processedLinkMap = new Map()
    for (const { placeholder, processedHref } of processedLinks) {
      processedLinkMap.set(placeholder, processedHref)
    }

    let processedHtml = html
    for (const [placeholder, processedHref] of processedLinkMap.entries()) {
      processedHtml = processedHtml.replace(new RegExp(placeholder, 'g'), processedHref)
    }

    let result = oldContent
    for (const [placeholder, originalHref] of linkMap.entries()) {
      const processedHref = processedLinkMap.get(placeholder)

      if (originalHref !== processedHref) {

        const escapedHref = originalHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const linkRegex = new RegExp(`\\[([^\\]]+)\\]\\(${escapedHref}\\)`, 'g')
        result = result.replace(linkRegex, (match, text) => `[${text}](${processedHref})`)
      }
    }

    return result
  }

  /**
   * Processes a single link, removing the .md extension if it's a valid Markdown file
   *
   * @param {string} link - The link to process
   *
   * @returns {string} The processed link with .md extension removed if applicable
   */
  async processLink(link) {
    const linkInfo = await LinkInfoFactory.create(link, this.filesPath)

    if (!linkInfo.isLocal || !linkInfo.isMarkdown) {
      return link
    }

    return linkInfo.fileNameWithoutExtension
  }
}

export default LinkReplacer
