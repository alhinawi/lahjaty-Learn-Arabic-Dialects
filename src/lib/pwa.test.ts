import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
const setup = async (readyState = 'complete', standalone = false, ios = false) => {
  vi.resetModules()
  vi.stubEnv('NODE_ENV', 'production')
  const target = new EventTarget()
  const register = vi.fn().mockResolvedValue({})
  vi.stubGlobal('window', Object.assign(target, { matchMedia: () => ({ matches: standalone, addEventListener: vi.fn(), removeEventListener: vi.fn() }) }))
  vi.stubGlobal('document', { readyState })
  vi.stubGlobal('navigator', { serviceWorker: { register }, userAgent: ios ? 'iPhone' : 'test', platform: '', maxTouchPoints: 0 })
  return { target, register, pwa: await import('./pwa') }
}
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetModules() })
describe('install startup', () => {
  it('registers immediately after load, once across repeated setup calls', async () => {
    const { pwa, register, target } = await setup()
    pwa.setupPwa(); pwa.setupPwa(); target.dispatchEvent(new Event('load'))
    expect(register).toHaveBeenCalledExactlyOnceWith('/sw.js')
  })
  it('registers once when an unfinished document loads', async () => {
    const { pwa, register, target } = await setup('interactive')
    pwa.setupPwa(); pwa.setupPwa(); expect(register).not.toHaveBeenCalled()
    target.dispatchEvent(new Event('load')); target.dispatchEvent(new Event('load'))
    expect(register).toHaveBeenCalledExactlyOnceWith('/sw.js')
  })
  it('keeps server install markup empty on iPhone and standalone clients', async () => {
    for (const standalone of [false, true]) {
      const { pwa } = await setup('complete', standalone, true)
      const Probe = () => { const s = pwa.useInstall(); return createElement('span', {}, JSON.stringify([s.canPrompt, s.iosHint, s.installed])) }
      expect(renderToStaticMarkup(createElement(Probe))).toBe('<span>[false,false,false]</span>')
    }
  })
  it('does not register in development', async () => {
    const { pwa, register } = await setup(); vi.stubEnv('NODE_ENV', 'development'); pwa.setupPwa(); expect(register).not.toHaveBeenCalled()
  })
})
