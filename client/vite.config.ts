import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ['i18next', 'i18next-browser-languagedetector'],
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        external: ['i18next', 'i18next-browser-languagedetector'],
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            leaflet: ['leaflet', 'react-leaflet'],
          },
        },
      },
    },
    server: {
      port: 3000,
      open: true,
    },
    define: {
      'import.meta.env': JSON.stringify(env),
    },
    css: {
      postcss: './postcss.config.js',
    },
  };
}); 