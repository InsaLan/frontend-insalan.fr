// @ts-check
// eslint-disable-next-line
const { defineConfig } = require('eslint-define-config');
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = defineConfig({
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  overrides: [
    {
      files: ['*.vue', '*.ts'],
      extends: [
        'plugin:tailwindcss/recommended',
        'plugin:vue/vue3-recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        '@vue/eslint-config-airbnb-with-typescript',
      ],
      plugins: [
        'simple-import-sort',
      ],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 'latest',
      },
      rules: {
        // Eslint rules
        'no-console': 'error',
        'no-param-reassign': 'off',

        // Plugins rules
        'import/prefer-default-export': 'off',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',
        'import/order': 'off',
        'simple-import-sort/imports': ['error', {
          groups: [
            // Node.js builtins prefixed with `node:`.
            // Packages, things that start with a letter (or digit or underscore), or `@` followed by a letter.
            // Absolute imports and other imports such as Vue-style `@/foo`.
            // Anything not matched in another group.
            ['^node:', '^@?\\w', '^'],
            // Relative imports.
            // Anything that starts with a dot.
            ['^\\.'],
            // Side effect imports.
            ['^\\u0000'],
          ],
        }],
        'simple-import-sort/exports': 'error',
        'tailwindcss/no-custom-classname': 'off',

        // TypeScript rules
        // https://typescript-eslint.io/rules/#extension-rules
        '@typescript-eslint/array-type': ['error', {
          default: 'array',
        }],
        '@typescript-eslint/consistent-type-imports': ['error', {
          fixStyle: 'inline-type-imports',
        }],
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-import-type-side-effects': 'error',

        // Vue rules
        'vue/max-len': ['error', 120, 2, {
          ignoreUrls: true,
          ignoreComments: false,
          ignoreRegExpLiterals: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreHTMLAttributeValues: true,
          ignoreHTMLTextContents: false,
        }],
        'vue/multi-word-component-names': 'off',
        'vue/html-closing-bracket-spacing': ['error', {
          startTag: 'never',
          endTag: 'never',
          selfClosingTag: 'never',
        }],
      },
    },
    {
      files: ['*.*js'],
      extends: [
        '@vue/eslint-config-airbnb',
      ],
      rules: {
        'vue/max-len': ['error', 120],
      },
    },
  ],
});
