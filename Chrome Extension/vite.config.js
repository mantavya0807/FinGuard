import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from 'path';
import { readdirSync, copyFileSync } from 'fs';

// Helper function to copy static files from public to dist after build
const copyPublicFiles = () => ({
  name: 'copy-public-files',
  closeBundle() {
    const files = readdirSync('public');
    files.forEach(file => {
      if (file !== 'manifest.json' && !file.endsWith('.js')) {
        copyFileSync(`public/${file}`, `dist/${file}`);
      }
    });
    
    // Ensure manifest.json is copied
    copyFileSync('public/manifest.json', 'dist/manifest.json');
    
    // Ensure content-script.js is copied
    copyFileSync('public/content-script.js', 'dist/content-script.js');
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    copyPublicFiles()
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'public/background.js')
      },
      output: {
        entryFileNames: (assetInfo) => {
          return assetInfo.name === 'background'
            ? '[name].js'
            : 'assets/[name]-[hash].js';
        }
      }
    }
  }
});
