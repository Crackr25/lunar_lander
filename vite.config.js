import { defineConfig } from 'vite'; // Force restart 2

export default defineConfig({
  base: './',
  build: {
    assetsDir: 'assets',
  },
  server: {
    host: true
  }
});
