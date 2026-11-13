import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Client bundle for the interactive /report/ page only; the rest of the site stays static.
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: "dist-report",
    emptyOutDir: true,
    rollupOptions: {
      input: "src/report/entry.tsx",
      output: { entryFileNames: "report-app.js", assetFileNames: "report-app.[ext]", chunkFileNames: "report-[name].js" },
    },
  },
});
