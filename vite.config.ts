import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Strips `@import "tailwindcss"` from CSS before Vite's built-in CSS import
 * resolution kicks in. Must use `enforce: 'pre'` to run before Vite resolves
 * the import and inlines the entire Tailwind framework.
 */
function stripTailwindImport(): Plugin {
  return {
    name: 'strip-tailwind-import',
    enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('.css')) {
        return code.replace(/@import\s+["']tailwindcss["'];?\s*\n?/g, '');
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), stripTailwindImport()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DatePicker',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
    cssCodeSplit: false,
    minify: 'esbuild',
    sourcemap: true,
    target: 'es2020',
  },
  css: {
    postcss: {
      plugins: [], // Override dev postcss.config.js — no Tailwind in lib output
    },
  },
});
