import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver, ElementPlusResolver, TDesignResolver } from "unplugin-vue-components/resolvers";
import { lazyImport, VxeResolver } from "vite-plugin-lazy-import";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  base: "./",
  server: {
    port: 9999,
    strictPort: true,
    proxy: {
      "/project": { target: "http://127.0.0.1:60000", changeOrigin: true },
      "/other": { target: "http://127.0.0.1:60000", changeOrigin: true },
      "/user": { target: "http://127.0.0.1:60000", changeOrigin: true },
      "/outline": { target: "http://127.0.0.1:60000", changeOrigin: true },
      "/novel": { target: "http://127.0.0.1:60000", changeOrigin: true },
      "/script": { target: "http://127.0.0.1:60000", changeOrigin: true },
      "/storyboard": { target: "http://127.0.0.1:60000", changeOrigin: true, ws: true },
      "/assets": { target: "http://127.0.0.1:60000", changeOrigin: true },
      "/video": { target: "http://127.0.0.1:60000", changeOrigin: true },
      "/prompt": { target: "http://127.0.0.1:60000", changeOrigin: true },
      "/setting": { target: "http://127.0.0.1:60000", changeOrigin: true },
    },
  },
  plugins: [
    vue(),
    AutoImport({
      dts: "src/types/auto-imports.d.ts",
      imports: ["vue", "pinia", "vue-router"],
      resolvers: [
        ElementPlusResolver(),
        TDesignResolver({
          library: "vue-next",
        }),
      ],
    }),
    Components({
      dts: "src/types/components.d.ts",
      resolvers: [
        AntDesignVueResolver({
          importStyle: false,
        }),
        ElementPlusResolver(),
        TDesignResolver({
          library: "vue-next",
        }),
      ],
    }),
    lazyImport({
      resolvers: [
        VxeResolver({
          libraryName: "vxe-table",
        }),
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
});
