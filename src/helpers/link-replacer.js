import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'
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
    // Store original links and their processed versions
    const linkMap = new Map()

    // Configure remark with custom settings to preserve the original formatting
    const processor = unified()
      .use(remarkParse)  // Parse markdown to AST
      .use(remarkGfm)    // Support GFM (GitHub Flavored Markdown)
      .use(() => async (tree) => {
        // Find all link nodes in the AST
        const linkNodes = []
        visit(tree, 'link', (node) => {
          linkNodes.push(node)
        })

        // Process all links in parallel
        const linkPromises = linkNodes.map(async (node) => {
          const originalHref = node.url
          const processedHref = await this.processLink(originalHref)

          // Store the original and processed links for later reference
          if (originalHref !== processedHref) {
            linkMap.set(originalHref, processedHref)
          }

          // Update the node's URL in the AST
          node.url = processedHref
        })

        // Wait for all link processing to complete
        await Promise.all(linkPromises)
      })
      .use(remarkStringify, {
        // Configure stringify to match the original format
        bullet: '*',
        emphasis: '_',
        fences: true,
        listItemIndent: 'one',
        rule: '-',
        ruleSpaces: false,
        strong: '*'
      })

    // Process the markdown content
    const file = await processor.process(oldContent)

    // Get the result as a string and remove any trailing newline that remark might add
    let result = String(file)
    if (result.endsWith('\n') && !oldContent.endsWith('\n')) {
      result = result.slice(0, -1)
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
