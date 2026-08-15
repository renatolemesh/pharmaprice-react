import { fileURLToPath } from "node:url";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// `new URL(import.meta.url).pathname` devolve "/C:/Users/..." no Windows, que
// nao e um caminho valido pro path.resolve. fileURLToPath resolve os dois SOs.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Recharts sozinho passa de 400kB. Separar do bundle da aplicacao evita
    // que quem so abre a tela de busca baixe a biblioteca de graficos.
    // O Vite 8 usa Rolldown, que so aceita `manualChunks` como funcao.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](recharts|d3-|victory-)/.test(id)) {
            return "charts";
          }
          if (/[\\/]node_modules[\\/](react|react-dom|react-router)/.test(id)) {
            return "react";
          }
          return undefined;
        },
      },
    },
  },
});
