/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import type { Plugin } from 'vite'

/** Preloads the Arabic interface font so the first text paints in it without a late swap. */
const preloadFonts = (): Plugin => ({
  name: 'lahjaty-preload-fonts',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler: (_html, ctx) =>
      Object.keys(ctx.bundle ?? {})
        .filter((f) => /readex-pro-arabic-wght-normal-[^/]*\.woff2$/.test(f))
        .map((f) => ({ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${f}`, crossorigin: '' }, injectTo: 'head' as const })),
  },
})

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    preloadFonts(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'لهجتي – Lahjaty',
        short_name: 'لهجتي',
        description: 'افهم كل عربي، من النيل إلى الفرات. Understand every Arab, from the Nile to the Euphrates.',
        lang: 'ar',
        dir: 'rtl',
        start_url: '/?source=app',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#08302a',
        theme_color: '#0e5443',
        categories: ['education', 'books'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
        shortcuts: [
          { name: 'الدروس', short_name: 'الدروس', url: '/lessons', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'القاموس', short_name: 'القاموس', url: '/dictionary', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'تقدّمي', short_name: 'تقدّمي', url: '/profile', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        // The app shell only: the main script and styles, the interface fonts and the icons.
        // Prerendered pages, dictionary topics and audio are cached the first time they are opened.
        globPatterns: ['index.html', 'assets/{index,vendor}-*.{js,css}', 'assets/*Page-*.js', 'assets/readex-pro-{arabic,latin}-wght-*.woff2', 'assets/el-messiri-*.woff2', 'favicon.svg', 'icons/*.png'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/og\//, /^\/audio\//, /\.(xml|txt|jpg|png|mp3)$/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'pages', networkTimeoutSeconds: 3, expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/assets/'),
            handler: 'CacheFirst',
            options: { cacheName: 'assets', expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/audio/'),
            handler: 'CacheFirst',
            options: { cacheName: 'audio', rangeRequests: true, cacheableResponse: { statuses: [0, 200] }, expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 90 } },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/og/') || url.pathname === '/og-default.jpg',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'images', expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // React and the router change rarely: their own file stays cached across deploys.
        manualChunks: (id) => (/node_modules\/(react|react-dom|react-router|scheduler|zustand)\//.test(id) ? 'vendor' : undefined),
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
})
