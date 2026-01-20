import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': '{}',
    'process.env.NODE_ENV': '"production"',
    'global': 'window',
  },
  build: {
    outDir: 'public',
    emptyOutDir: false, // Don't delete assets when building
    lib: {
      entry: path.resolve(__dirname, 'src/widget/widget-entry.tsx'),
      name: 'BeatMachineWidget',
      fileName: () => {
        // Generate timestamp-based version for cache busting
        const timestamp = Date.now();
        return `widget.js?v=${timestamp}`;
      },
      formats: ['iife'],
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
        extend: true, // Extend window object instead of replacing
        // Generate clean widget.js filename (query params are stripped)
        entryFileNames: 'widget.js',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
