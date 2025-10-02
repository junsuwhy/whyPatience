import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        Event: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      react: react,
      'react-hooks': reactHooks,
      prettier: prettier,
    },
    rules: {
      // Basic rules
      'no-unused-vars': 'off', // Use TypeScript version instead
      'prefer-const': 'error',

      // React specific
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // TypeScript specific
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',

      // Prettier integration
      'prettier/prettier': 'error',

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['src/setupTests.ts', 'tests/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      globals: {
        global: 'writable',
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier: prettier,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'prettier/prettier': 'error',
    },
  },
  {
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      '*.config.js',
      '*.config.ts',
      'vite.config.ts',
    ],
  },
];
