import path from "path"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      allowedHosts: [
        '846b-103-215-73-250.ngrok-free.app'
      ],
      proxy: {
        '/uploads': {
          target: env.VITE_SERVER_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      minify: "esbuild",
      sourcemap: false
    },
    esbuild: {
      drop: ["console", "debugger"]
    }
  }
})
