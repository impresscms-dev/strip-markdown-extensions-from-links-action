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
    // Create a new markdown-it instance
    const md = new MarkdownIt()

    // Create a custom renderer for links
    const defaultLinkOpenRenderer = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }

    // Store the links that need to be processed
    const linkMap = new Map()

    // Override the link_open renderer to capture all links
    md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
      const token = tokens[idx]
      const hrefIndex = token.attrIndex('href')

      if (hrefIndex >= 0) {
        const href = token.attrs[hrefIndex][1]

        // Store the original href in our map
        // We'll use a unique placeholder to avoid conflicts
        const placeholder = `__LINK_PLACEHOLDER_${idx}__`
        linkMap.set(placeholder, href)

        // Replace the href with our placeholder
        token.attrs[hrefIndex][1] = placeholder
      }

      // Call the default renderer
      return defaultLinkOpenRenderer(tokens, idx, options, env, self)
    }

    // Render the markdown to HTML
    const html = md.render(oldContent)

    // Create a new markdown-it instance for parsing the HTML back to markdown
    const mdParser = new MarkdownIt()

    // Parse the HTML to get tokens
    const tokens = mdParser.parse(html, {})

    // Process all links and collect promises
    const linkPromises = []
    for (const [placeholder, originalHref] of linkMap.entries()) {
      linkPromises.push(
        this.processLink(originalHref).then(processedHref => {
          return { placeholder, processedHref }
        })
      )
    }

    // Wait for all link processing to complete
    const processedLinks = await Promise.all(linkPromises)

    // Create a map of placeholders to processed links
    const processedLinkMap = new Map()
    for (const { placeholder, processedHref } of processedLinks) {
      processedLinkMap.set(placeholder, processedHref)
    }

    // Replace all placeholders in the HTML with the processed links
    let processedHtml = html
    for (const [placeholder, processedHref] of processedLinkMap.entries()) {
      processedHtml = processedHtml.replace(new RegExp(placeholder, 'g'), processedHref)
    }

    // Since markdown-it doesn't provide a direct way to convert HTML back to markdown,
    // and we want to preserve the original markdown structure as much as possible,
    // we'll use a different approach: replace the links in the original content
    let result = oldContent
    for (const [placeholder, originalHref] of linkMap.entries()) {
      const processedHref = processedLinkMap.get(placeholder)

      // Only replace if the link was actually changed
      if (originalHref !== processedHref) {
        // Replace the link in the original markdown
        // We need to escape special characters in the original href for the regex
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
