import { defineConfig } from 'vite'
import vue2 from '@vitejs/plugin-vue2'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue2()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
