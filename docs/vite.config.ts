import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/ReactZero-DatePicker/',
  resolve: {
    alias: [
      { find: '@reactzero/datepicker/styles', replacement: path.resolve(__dirname, '../src/styles/datepicker.css') },
      { find: '@reactzero/datepicker', replacement: path.resolve(__dirname, '../src/index.ts') },
    ],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
