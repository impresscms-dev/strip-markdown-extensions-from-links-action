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

// Process each file in the directory recursively
for (const file of readDirSync(filesPath)) {
  // Convert the file path to a string
  const filename = file.toString()
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
