// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';  // ← This is correct for Tailwind v4
import path from 'path';  // ← Add this for the @ alias

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),  // ← Add this
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // ← This fixes your "@/utils/debounce" import issue
    },
  },
});