import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  server: {
    host: '0.0.0.0',
    hmr: true, // Change this line to false disable auto-refreshing.
  },
  // Set base path for GitHub Pages deployment
  // Change 'iJam-Music-Player-App' to your actual repository name
  base: process.env.NODE_ENV === 'production' ? '/iJam-Music-Player-App/' : '/',
})
