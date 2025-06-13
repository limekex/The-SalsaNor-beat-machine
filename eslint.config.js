import js from '@eslint/js';
import react from 'eslint-plugin-react';
import a11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import tsParser from '@typescript-eslint/parser';
import ts from '@typescript-eslint/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  // Globale ignoreringsmønstre
  globalIgnores(['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**', '**/*copy*']),

  // ESLint anbefalte konfigurasjoner
  js.configs.recommended,
  {
    plugins: {
      react,
      'jsx-a11y': a11y,
      import: importPlugin,
      '@typescript-eslint': ts,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        self: 'readonly',
        __webpack_exports__: 'readonly',
        __webpack_require__: 'readonly',
        __unused_webpack_module: 'readonly',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/no-named-as-default': 'warn',
      'import/no-named-as-default-member': 'warn',
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn'],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-undef': 'off',
    },
  },
]);
