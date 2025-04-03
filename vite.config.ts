import { defineConfig } from "vite";
import {createHtmlPlugin} from 'vite-plugin-html';

export default defineConfig({
    root: "src/client",
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: "../../dist/client",
      emptyOutDir: true,
    },
    plugins: [createHtmlPlugin()],
    css: {
      postcss: 'postcss.config.js',
    },
  });