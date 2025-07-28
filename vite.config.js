import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 4100,
    host: true, // This allows external connections
    open: true  // This will automatically open the browser
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['jsonwebtoken', 'bcryptjs']
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: ['jsonwebtoken', 'bcryptjs']
    }
  },
});