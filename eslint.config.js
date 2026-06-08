import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // `dist` et `dev-dist` (service worker généré par le plugin PWA) ne sont pas du code source.
  globalIgnores(['dist', 'dev-dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Fast Refresh : avertissement (et non erreur) comme dans le template Vite officiel.
      // Les fichiers shadcn/ui et les contextes exportent volontairement des variantes/hooks.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Ignore les variables préfixées par « _ » et les frères d'un rest (omission de champ).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
])
