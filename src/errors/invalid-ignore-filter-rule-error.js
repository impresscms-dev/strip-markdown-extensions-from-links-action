/**
 * Error thrown when an ignore-filter rule is invalid
 */
class InvalidIgnoreFilterRuleError extends Error {
  /**
   * Creates a new InvalidIgnoreFilterRuleError
   *
   * @param {string} rule - The invalid rule pattern
   * @param {string} reason - The reason why the rule is invalid
   */
  constructor(rule, reason) {
    super(`Invalid ignore filter rule: "${rule}" is not allowed - ${reason}`)
    this.name = 'InvalidIgnoreFilterRuleError'
    this.rule = rule
    this.reason = reason
  }
}

export default InvalidIgnoreFilterRuleError
