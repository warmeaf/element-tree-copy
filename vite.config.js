import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'

// https://vite.dev/config/
export default defineConfig({
  plugins: [createVuePlugin()],
  base: './',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
