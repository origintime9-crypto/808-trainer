import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'katex', test: id => id.replaceAll('\\', '/').includes('/node_modules/katex/') },
            { name: 'problems', test: id => id.replaceAll('\\', '/').includes('/src/content/problems/'), maxSize: 180_000 },
          ],
        },
      },
    },
  },
});
