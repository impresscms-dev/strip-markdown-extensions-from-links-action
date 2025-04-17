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
   * @param {import('./ignore-filter.js').default|null} ignoreFilter - Optional filter for ignoring certain links
   */
  constructor(filesPath, ignoreFilter = null) {
    this.filesPath = filesPath
    this.ignoreFilter = ignoreFilter
  }

  /**
   * Transforms all Markdown links in the content by removing .md extensions
   *
   * @param {string} oldContent - The original Markdown content
   * @param {string|null} filePath - The path of the file being processed (for ignore rules)
   * @returns {Promise<string>} The transformed Markdown content with processed links
   */
  async transformMarkdownLinks(oldContent, filePath = null) {
    const linkMap = new Map()
    const processor = this.#configureRemarkProcessor(linkMap, filePath)
    const file = await processor.process(oldContent)

    return this.#formatResult(file, oldContent)
  }

  /**
   * Configures the remark processor with all necessary plugins
   *
   * @param {Map} linkMap - Map to store original and processed links
   * @param {string|null} filePath - The path of the file being processed (for ignore rules)
   * @returns {Object} Configured remark processor
   * @private
   */
  #configureRemarkProcessor(linkMap, filePath = null) {
    return unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(() => async (tree) => {
        const linkNodes = this.#findLinkNodes(tree)
        await this.#processLinkNodes(linkNodes, linkMap, filePath)
      })
      .use(remarkStringify, this.#getStringifyOptions())
  }

  /**
   * Finds all link nodes in the AST
   *
   * @param {Object} tree - The AST tree
   * @returns {Array} Array of link nodes
   * @private
   */
  #findLinkNodes(tree) {
    const linkNodes = []
    visit(tree, 'link', (node) => {
      linkNodes.push(node)
    })
    return linkNodes
  }

  /**
   * Processes all link nodes in parallel
   *
   * @param {Array} linkNodes - Array of link nodes to process
   * @param {Map} linkMap - Map to store original and processed links
   * @param {string|null} filePath - The path of the file being processed (for ignore rules)
   * @returns {Promise} Promise that resolves when all links are processed
   * @private
   */
  async #processLinkNodes(linkNodes, linkMap, filePath = null) {
    const linkPromises = linkNodes.map(async (node) => {
      const originalHref = node.url

      if (this.ignoreFilter && filePath && this.ignoreFilter.shouldIgnore(originalHref, filePath)) {
        return
      }

      const processedHref = await this.processLink(originalHref)

      if (originalHref !== processedHref) {
        linkMap.set(originalHref, processedHref)
      }

      node.url = processedHref
    })

    return Promise.all(linkPromises)
  }

  /**
   * Gets the stringify options for remark
   *
   * @returns {Object} Stringify options
   * @private
   */
  #getStringifyOptions() {
    return {
      bullet: '*',
      emphasis: '_',
      fences: true,
      listItemIndent: 'one',
      rule: '-',
      ruleSpaces: false,
      strong: '*'
    }
  }

  /**
   * Formats the result string, handling trailing newlines
   *
   * @param {Object} file - The processed file
   * @param {string} oldContent - The original content
   * @returns {string} The formatted result
   * @private
   */
  #formatResult(file, oldContent) {
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
