import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx"], // Ensure these extensions are correctly resolved
  },
  server: {
    mimeTypes: {
      "application/javascript": ["js", "mjs"],
    },
    cors: true,
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
