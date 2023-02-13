import readDirSync from 'recursive-readdir-sync'
import {readFileSync, writeFileSync} from 'fs'
import {debug, getInput} from '@actions/core'
import LinkReplacer from './helpers/link-replacer'

const filesPath: string = getInput('path', {required: true})

const replacer = new LinkReplacer(filesPath)

for (const file of readDirSync(filesPath)) {
  const filename: string = file.toString()
  const oldContent: string = readFileSync(filename, 'utf8')
  const newContent: string = replacer.transformMarkdownLinks(oldContent)

  if (oldContent != newContent) {
    debug(filename + ' updated')
    writeFileSync(filename, newContent)
  }
}
