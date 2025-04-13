import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from 'path';
import { readdirSync, copyFileSync, statSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Helper function to recursively copy directories
const copyDir = (src, dest) => {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  
  const entries = readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
};

// Helper function to copy static files from public to dist after build
const copyPublicFiles = () => ({
  name: 'copy-public-files',
  closeBundle() {
    const files = readdirSync('public', { withFileTypes: true });
    
    files.forEach(file => {
      const srcPath = join('public', file.name);
      const destPath = join('dist', file.name);
      
      if (file.isDirectory()) {
        copyDir(srcPath, destPath);
      } else if (file.name !== 'manifest.json' && !file.name.endsWith('.js')) {
        copyFileSync(srcPath, destPath);
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
