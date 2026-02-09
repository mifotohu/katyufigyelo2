import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild', // Terser helyett esbuild (gyorsabb, nincs extra függőség)
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'maps': ['leaflet', 'react-leaflet'],
          'supabase': ['@supabase/supabase-js']
        }
      }
    }
  },
  // Leaflet asset-ek helyes kezelése Vercel-en
  assetsInclude: ['**/*.png', '**/*.svg'],
  optimizeDeps: {
    include: ['leaflet']
  }
})
