import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // Change from './' to '/' for custom domain
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    minify: 'esbuild',
    sourcemap: false
  }
});