/**
 * Helper class for parsing GitHub Action inputs
 */

import {getInput} from '@actions/core'
import yaml from 'js-yaml'
import InvalidIgnoreFilterFormatError from '../errors/invalid-ignore-filter-format-error.js'
import InvalidIgnoreFilterRuleError from '../errors/invalid-ignore-filter-rule-error.js'

class InputParser {
  /**
   * Get the path input
   * 
   * @returns {string} The path where to look for files
   */
  getPath() {
    return getInput('path', {required: true})
  }

  /**
   * Parse the ignore-filter input and return the rules
   * 
   * @returns {Object} Object with rules where key is link pattern and value is array of file patterns
   * @throws {InvalidIgnoreFilterFormatError} If the input is not a valid YAML object
   * @throws {InvalidIgnoreFilterRuleError} If an invalid rule pattern is detected
   */
  getIgnoreRules() {
    const ignoreRules = {}
    const ignoreFilterInput = getInput('ignore-filter', {required: false})
    
    if (!ignoreFilterInput) {
      return ignoreRules
    }
    
    const parsedInput = yaml.load(ignoreFilterInput)
    
    if (parsedInput && typeof parsedInput === 'object' && !Array.isArray(parsedInput)) {
      for (const [linkPattern, filePattern] of Object.entries(parsedInput)) {
        if (linkPattern === '*' && (filePattern === '*' || (Array.isArray(filePattern) && filePattern.includes('*')))) {
          throw new InvalidIgnoreFilterRuleError('*:*', 'it would ignore all links')
        }
        
        if (linkPattern === '*.md' && (filePattern === '*.md' || (Array.isArray(filePattern) && filePattern.includes('*.md')))) {
          throw new InvalidIgnoreFilterRuleError('*.md:*.md', 'it would ignore all markdown links')
        }
        
        if (!ignoreRules[linkPattern]) {
          ignoreRules[linkPattern] = []
        }
        
        if (typeof filePattern === 'string') {
          ignoreRules[linkPattern].push(filePattern)
        } else if (Array.isArray(filePattern)) {
          ignoreRules[linkPattern].push(...filePattern)
        }
      }
    } else {
      throw new InvalidIgnoreFilterFormatError()
    }
    
    return ignoreRules
  }
}

export default InputParser
