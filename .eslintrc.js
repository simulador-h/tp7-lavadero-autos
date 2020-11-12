/* eslint-disable quote-props */

const { resolve } = require('path');

module.exports = {
  root: true,

  env: {
    browser: true,
  },

  globals: {
    process: true,
  },

  parser: 'vue-eslint-parser',

  parserOptions: {
    parser: '@typescript-eslint/parser',
    project: resolve(__dirname, './tsconfig.json'),
    tsconfigRootDir: __dirname,
    extraFileExtensions: ['.vue'],

    ecmaVersion: 2020,
    sourceType: 'module',
  },

  extends: [
    'airbnb-base',
  ],

  plugins: [
    'import',
    '@typescript-eslint',
    'vue',
  ],

  settings: {
    'import/external-module-folders': [resolve(__dirname, './node_modules/@quasar/app')],
  },

  rules: {
    // Possible Errors
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

    // Best Practices
    'no-else-return': ['error', {
      'allowElseIf': true,
    }],
    'no-param-reassign': ['error', {
      'props': false,
    }],

    // Variables
    'no-shadow': 'off',

    // Stylistic Issues
    'brace-style': ['error', 'stroustrup', {
      'allowSingleLine': true,
    }],
    'lines-between-class-members': ['error', 'always', {
      'exceptAfterSingleLine': true,
    }],
    'max-len': ['error', {
      'code': 125,
      'comments': 135,
      'ignoreUrls': true,
      'ignoreTemplateLiterals': true,
      'ignoreRegExpLiterals': true,
    }],
    'no-plusplus': 'off',
    'object-curly-newline': ['error', {
      'ObjectExpression': {
        'multiline': true,
        'consistent': true,
      },
      'ObjectPattern': {
        'multiline': true,
        'consistent': true,
      },
      'ImportDeclaration': {
        'multiline': true,
        'consistent': true,
      },
      'ExportDeclaration': {
        'multiline': true,
        'consistent': true,
      },
    }],

    // TypeScript
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-unused-vars': ['error', {
      'ignoreRestSiblings': true,
    }],

    // Imports
    'import/default': 'error',
    'import/extensions': 'off',
    'import/namespace': 'error',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
  },

  overrides: [
    {
      files: ['./*.js'],
      env: { node: true },
      parser: 'espree',
    },
    {
      files: ['*.worker.ts'],
      env: { worker: true },
    },
    {
      files: ['*.ts', '*.vue'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
    {
      files: ['*.vue'],
      extends: [
        'plugin:vue/vue3-recommended',
      ],
      rules: {
        'indent': 'off',

        // Vue
        'vue/component-tags-order': ['error', {
          'order': ['template', 'style', 'script'],
        }],
        'vue/max-attributes-per-line': ['error', {
          'singleline': 6,
          'multiline': {
            'max': 3,
            'allowFirstLine': false,
          },
        }],
        'vue/script-indent': ['error', 2, {
          'baseIndent': 1,
        }],
      },
    },
  ],
};
