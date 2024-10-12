import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB limit
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/images/"), // Cache images from public folder
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // Cache for 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*tile\.openstreetmap\.org\/.*/, // Cache OpenStreetMap tiles
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "osm-tiles-cache",
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 7, // Cache for 7 days
              },
            },
          },
        ],
      },
    }),
  ],
});
