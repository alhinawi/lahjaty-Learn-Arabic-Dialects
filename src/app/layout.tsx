import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import '@fontsource-variable/readex-pro/wght.css'
import '@fontsource/el-messiri/arabic-600.css'
import '@fontsource/el-messiri/arabic-700.css'
import '@fontsource/el-messiri/latin-600.css'
import '@fontsource/el-messiri/latin-700.css'
import '@fontsource/noto-naskh-arabic/arabic-500.css'
import '@fontsource/noto-naskh-arabic/arabic-700.css'
import './globals.css'
import AppShell from '../components/AppShell'
import { SITE_NAME, SITE_URL } from '../lib/og'
import { metadataFor } from '../lib/seo'

/** Applies the saved theme before first paint, so dark mode does not flash. */
const THEME_BOOT_SCRIPT = `try{var s=(JSON.parse(localStorage.getItem('lahjaty:v1')||'{}').state)||{};var t=s.theme||'system';if(t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...metadataFor('/'),
  applicationName: SITE_NAME,
  icons: { icon: '/favicon.svg', apple: '/icons/apple-touch-icon.png' },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'لهجتي', statusBarStyle: 'black-translucent' },
}

export const viewport: Viewport = {
  themeColor: '#0e5443',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
