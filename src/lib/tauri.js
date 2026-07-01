// ==================== Tauri API Helper ====================

let cachedInvoke = null

export function getInvoke() {
  if (cachedInvoke) return cachedInvoke
  
  // روش 1: از طریق window.__TAURI_INTERNALS__ (معمولاً در Tauri v2)
  if (window.__TAURI_INTERNALS__ && typeof window.__TAURI_INTERNALS__.invoke === 'function') {
    cachedInvoke = window.__TAURI_INTERNALS__.invoke
    return cachedInvoke
  }
  
  // روش 2: از طریق window.__TAURI__.core (نسخه‌های قدیمی‌تر)
  if (window.__TAURI__?.core?.invoke) {
    cachedInvoke = window.__TAURI__.core.invoke
    return cachedInvoke
  }
  
  // روش 3: از طریق window.__TAURI_INVOKE__
  if (window.__TAURI_INVOKE__) {
    cachedInvoke = window.__TAURI_INVOKE__
    return cachedInvoke
  }
  
  throw new Error('Tauri API not available. Make sure you are running with `npx tauri dev`')
}

export async function tauriInvoke(cmd, args = {}) {
  const invoke = getInvoke()
  return invoke(cmd, args)
}

export default { getInvoke, invoke: tauriInvoke }