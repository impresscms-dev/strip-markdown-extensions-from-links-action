/**
 * Error thrown when an abstract class is instantiated directly
 */
class AbstractClassError extends Error {
  /**
   * Creates a new AbstractClassError
   *
   * @param {string} className - The name of the abstract class that was instantiated
   */
  constructor(className) {
    super(`${className} is an abstract class and cannot be instantiated directly`)
    this.name = 'AbstractClassError'
  }
}

export default AbstractClassError
