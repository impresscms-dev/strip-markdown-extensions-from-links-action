/**
 * Error thrown when an abstract method is called without being implemented
 */
class AbstractMethodError extends Error {
  /**
   * Creates a new AbstractMethodError
   *
   * @param {string} methodName - The name of the abstract method that was called
   */
  constructor(methodName) {
    super(`${methodName} is an abstract method and must be implemented by subclasses`)
    this.name = 'AbstractMethodError'
  }
}

export default AbstractMethodError
