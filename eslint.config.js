import js from '@eslint/js';
import globals from 'globals';

export default [
  // Configuração para arquivos JavaScript e TypeScript
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    rules: {
      ...js.configs.recommended.rules,
      // Regras personalizadas podem ser adicionadas aqui
    },
  },

  // Ignora arquivos de build e dependências
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.config.js',
      '*.config.cjs',
    ],
  },
];
