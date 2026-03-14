/**
 * eslint.config.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * ESLint flat config (ESLint 9+).
 *
 * Plugins:
 * - @typescript-eslint: TypeScript-specific rules
 * - eslint-plugin-react: React best practices
 * - eslint-plugin-react-hooks: enforces Rules of Hooks
 * - eslint-plugin-jsx-a11y: static ARIA / accessibility checks
 *   (catches many of the same things axe-core does at compile time)
 */

import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': ts,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // ── TypeScript ────────────────────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',

      // ── React ─────────────────────────────────────────────────────────────
      'react/prop-types': 'off',           // TypeScript handles this
      'react/react-in-jsx-scope': 'off',   // React 17+ new JSX transform
      'react/display-name': 'warn',        // Helps with devtools debugging
      'react/no-unknown-property': 'error',

      // ── React Hooks ───────────────────────────────────────────────────────
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ── Accessibility ─────────────────────────────────────────────────────
      // These rules catch ARIA issues at lint time, before tests even run.
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/label-has-associated-control': 'error',

      // ── General ───────────────────────────────────────────────────────────
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    // Relax some rules in test files
    files: ['src/**/*.{test,spec}.{ts,tsx}', 'src/test-utils/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'no-console': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
];
