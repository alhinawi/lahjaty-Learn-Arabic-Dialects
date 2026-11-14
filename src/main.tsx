import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'
import '@fontsource-variable/readex-pro/wght.css'
import '@fontsource/el-messiri/arabic-600.css'
import '@fontsource/el-messiri/arabic-700.css'
import '@fontsource/el-messiri/latin-600.css'
import '@fontsource/el-messiri/latin-700.css'
import '@fontsource/noto-naskh-arabic/arabic-500.css'
import '@fontsource/noto-naskh-arabic/arabic-700.css'
import './index.css'
import { setupPwa } from './lib/pwa'

setupPwa()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
