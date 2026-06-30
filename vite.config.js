import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: [
        '**/src-tauri/target/**',
        '**/node_modules/**',
        '**/.git/**',
      ],
    },
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: process.env.TAURI_PLATFORM === "windows" ? "chrome105" : "safari13",
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_DEBUG,
    // ============ تنظیمات جدید برای بهینه‌سازی باندل ============
    chunkSizeWarningLimit: 1000, // افزایش حد هشدار به 1000 کیلوبایت
    rollupOptions: {
      output: {
        manualChunks: {
          // جدا کردن کتابخانه‌های اصلی به chunkهای مجزا
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'sonner', 'recharts', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          'vendor-state': ['zustand'],
          'vendor-i18n': ['i18next', 'react-i18next'],
          'vendor-date': ['date-fns', 'date-fns-jalali', 'jalaali-js'],
          'vendor-tauri': ['@tauri-apps/api', '@tauri-apps/plugin-notification', '@tauri-apps/plugin-opener'],
        }
      }
    }
  },
})