// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import tailwindcss from "@tailwindcss/vite";
// import { nodePolyfills } from "vite-plugin-node-polyfills";
// import path from "path";
// import { fileURLToPath } from "url";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss(),
//     nodePolyfills({
//       globals: { Buffer: true, global: true, process: true },
//       protocolImports: true,
//     }),
//   ],

//   resolve: {
//     alias: {
//       ws: path.resolve(__dirname, "src/shims/ws.js"),
//     },
//   },
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      globals: { Buffer: true, global: true, process: true },
      protocolImports: true,
    }),
  ],

  resolve: {
    alias: {
      ws: path.resolve(__dirname, "src/shims/ws.js"),
    },
  },

  server: {
    proxy: {
      // Proxy all REST calls
      "/ostium-api": {
        target: "https://builder.ostium.io",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ostium-api/, ""),
        secure: true,
      },
      // Proxy WebSocket stream
      "/ostium-ws": {
        target: "wss://builder.ostium.io",
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/ostium-ws/, ""),
        secure: true,
      },
    },
  },
});
