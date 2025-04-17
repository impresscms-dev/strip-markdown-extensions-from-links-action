/**
 * Error thrown when the ignore-filter input is not in a valid format
 */
class InvalidIgnoreFilterFormatError extends Error {
  /**
   * Creates a new InvalidIgnoreFilterFormatError
   *
   * @param {string} message - The error message
   */
  constructor(message = 'Invalid ignore-filter format: must be a YAML object with link patterns as keys and file patterns as values') {
    super(message)
    this.name = 'InvalidIgnoreFilterFormatError'
  }
}

export default InvalidIgnoreFilterFormatError
