import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const websocket_url = `${process.env.PREFIX}.${process.env.VITE_WEBSITE_HOST}`

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    exclude: ['js-big-decimal']
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      host: websocket_url,
      clientPort: 80,
    },
  }
})
