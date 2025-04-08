/**
 * Jest configuration for testing JavaScript ES modules
 *
 * @type {import('jest').Config}
 */
export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\.{1,2}/.*)\.js$': '$1',
  },
}