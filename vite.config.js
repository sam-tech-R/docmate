import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const previewDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: '/docmate/',
  resolve: {
    alias: {
      'lucide-react': path.resolve(previewDirectory, 'node_modules/lucide-react')
    }
  }
});
