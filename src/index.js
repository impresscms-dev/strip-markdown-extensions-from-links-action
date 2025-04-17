/**
 * Main entry point for the GitHub Action
 *
 * This script processes all Markdown files in the specified directory,
 * removing .md extensions from links to make them compatible with GitHub wiki.
 *
 * @module index
 */

import readDirSync from 'recursive-readdir-sync'
import {readFileSync, writeFileSync} from 'fs'
import {debug} from '@actions/core'
import LinkReplacer from './helpers/link-replacer.js'
import IgnoreFilter from './helpers/ignore-filter.js'
import InputParser from './helpers/input-parser.js'

const inputParser = new InputParser()
const filesPath = inputParser.getPath()

try {
  const ignoreRules = inputParser.getIgnoreRules()
  debug('Ignore filter loaded: ' + JSON.stringify(ignoreRules))

  const ignoreFilter = new IgnoreFilter(ignoreRules)
  const replacer = new LinkReplacer(filesPath, ignoreFilter)

  /**
   * Process a single file by transforming its Markdown links
   *
   * @param {string} filename - The path to the file to process
   */
  async function processFile(filename) {
    const oldContent = readFileSync(filename, 'utf8')

    const newContent = await replacer.transformMarkdownLinks(
      oldContent,
      filename
    )

    if (oldContent !== newContent) {
      debug(filename + ' updated')
      writeFileSync(filename, newContent)
    }
  }

  async function main() {
    try {
      const files = readDirSync(filesPath)

      for (const file of files) {
        const filename = file.toString()
        await processFile(filename)
      }
    } catch (error) {
      console.error('Error processing files:', error)
      process.exit(1)
    }
  }

  await main()
} catch (error) {
  console.error('Error initializing action:', error.message)
  process.exit(1)
}
