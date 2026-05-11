const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        process: 'readonly',
        console: 'readonly',
        require: 'readonly',
        module: 'writable',
        exports: 'writable',
        __dirname: 'readonly',
        __filename: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
    },
  },
  {
    ignores: ['node_modules/**', 'coverage/**', 'tests/**'],
  },
];
