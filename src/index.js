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

// Get the path to the directory containing Markdown files from the action inputs
const filesPath = getInput('path', {required: true})

// Create a new LinkReplacer instance with the specified path
const replacer = new LinkReplacer(filesPath)

/**
 * Process a single file by transforming its Markdown links
 *
 * @param {string} filename - The path to the file to process
 */
function processFile(filename) {
  // Read the file content
  const oldContent = readFileSync(filename, 'utf8')
  // Transform Markdown links in the content
  const newContent = replacer.transformMarkdownLinks(oldContent)

  // Only write the file if the content has changed
  if (oldContent !== newContent) {
    debug(filename + ' updated')
    writeFileSync(filename, newContent)
  }
}

// Main execution function
function main() {
  try {
    // Get all files in the directory recursively
    const files = readDirSync(filesPath)

    // Process each file
    for (const file of files) {
      // Convert the file path to a string
      const filename = file.toString()
      processFile(filename)
    }
  } catch (error) {
    console.error('Error processing files:', error)
    process.exit(1)
  }
}

// Run the main function
main()
