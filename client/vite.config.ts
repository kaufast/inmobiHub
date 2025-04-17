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
      sourcemap: true,
      rollupOptions: {
        external: ['i18next', 'i18next-browser-languagedetector'],
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