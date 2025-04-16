import jestPlugin from 'eslint-plugin-jest'

export default [
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...jestPlugin.environments.globals.globals
      }
    },
    plugins: {
      jest: jestPlugin
    },
    rules: {
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      'camelcase': 'off',
      'func-call-spacing': ['error', 'never'],
      'no-array-constructor': 'error',
      'no-useless-constructor': 'error',
      'prefer-const': 'error',
      'semi': ['error', 'never'],
      'no-useless-escape': 'off',

      // Jest plugin rules
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/valid-expect': 'error'
    }
  }
]