import readDirSync from 'recursive-readdir-sync'
import transformLinks from 'transform-markdown-links'
import {readFileSync, writeFileSync} from 'fs'
import {debug, getInput} from '@actions/core'
import linkReplacer from './helpers/link-replacer'

const filesPath: string = getInput('path', {required: true})

linkReplacer.setFilesPath(filesPath)

for (const file of readDirSync(filesPath)) {
  const filename: string = file.toString()
  const oldContent: string = readFileSync(filename, 'utf8')
  const newContent: string = transformLinks(
    oldContent,
    linkReplacer.processLink
  )

  if (oldContent != newContent) {
    debug(filename + ' updated')
    writeFileSync(filename, newContent)
  }
}
