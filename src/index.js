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
import {debug, getInput} from '@actions/core'
import LinkReplacer from './helpers/link-replacer.js'

const filesPath = getInput('path', {required: true})

const replacer = new LinkReplacer(filesPath)

/**
 * Process a single file by transforming its Markdown links
 *
 * @param {string} filename - The path to the file to process
 */
async function processFile(filename) {
  
  const oldContent = readFileSync(filename, 'utf8')
  
  const newContent = await replacer.transformMarkdownLinks(oldContent)

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
