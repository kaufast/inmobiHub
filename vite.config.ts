import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "client/src/shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.')[1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'img';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
      },
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },
  optimizeDeps: {
    exclude: [
      'chunk-K273R2EC',
      'chunk-HFVUHTBR',
      'chunk-3KNLKWN7'
    ],
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'wouter',
      'lucide-react',
      'react-hook-form',
      'zod',
      'class-variance-authority',
      'tailwind-merge',
      '@radix-ui/react-select',
      '@radix-ui/react-dialog',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-popover',
      '@radix-ui/react-avatar',
      '@radix-ui/react-toast',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-accordion',
      'react-day-picker',
      'embla-carousel-react',
      'leaflet',
      'react-leaflet',
      'firebase/auth',
      'firebase/app'
    ]
  }
});
