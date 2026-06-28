import { createContext, useContext, useEffect } from 'react'
import useStore from '../store/useStore'

const ThemeContext = createContext({ theme: 'dark' })

export function ThemeProvider({ children }) {
  const theme = useStore((state) => state.settings.theme)

  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    
    root.classList.remove('dark', 'light')
    root.classList.add(theme)

    if (theme === 'light') {
      // متغیرهای CSS
      root.style.setProperty('--bg-base', '#f8fafc')
      root.style.setProperty('--bg-primary', '#ffffff')
      root.style.setProperty('--bg-secondary', '#f1f5f9')
      root.style.setProperty('--bg-tertiary', '#e2e8f0')
      root.style.setProperty('--bg-card', 'rgba(255, 255, 255, 0.8)')
      root.style.setProperty('--bg-card-hover', 'rgba(241, 245, 249, 0.9)')
      root.style.setProperty('--text-primary', '#0f172a')
      root.style.setProperty('--text-secondary', '#475569')
      root.style.setProperty('--text-muted', '#64748b')
      root.style.setProperty('--border-subtle', 'rgba(226, 232, 240, 0.8)')
      root.style.setProperty('--border-default', 'rgba(203, 213, 225, 0.9)')
      root.style.setProperty('--border-strong', 'rgba(148, 163, 184, 1)')
      
      // پس‌زمینه body - مستقیماً
      body.style.background = `
        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.08), transparent),
        radial-gradient(ellipse 60% 40% at 100% 100%, rgba(59, 130, 246, 0.05), transparent),
        linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)
      `
    } else {
      // ریست به تم تاریک
      root.style.setProperty('--bg-base', '#020617')
      root.style.setProperty('--bg-primary', '#0f172a')
      root.style.setProperty('--bg-secondary', '#1e293b')
      root.style.setProperty('--bg-tertiary', '#334155')
      root.style.setProperty('--bg-card', 'rgba(30, 41, 59, 0.7)')
      root.style.setProperty('--bg-card-hover', 'rgba(51, 65, 85, 0.75)')
      root.style.setProperty('--text-primary', '#f8fafc')
      root.style.setProperty('--text-secondary', '#94a3b8')
      root.style.setProperty('--text-muted', '#64748b')
      root.style.setProperty('--border-subtle', 'rgba(51, 65, 85, 0.5)')
      root.style.setProperty('--border-default', 'rgba(71, 85, 105, 0.6)')
      root.style.setProperty('--border-strong', 'rgba(100, 116, 139, 0.8)')
      
      // پس‌زمینه تاریک
      body.style.background = `
        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.1), transparent),
        radial-gradient(ellipse 60% 40% at 100% 100%, rgba(59, 130, 246, 0.05), transparent),
        linear-gradient(135deg, #020617 0%, #0f172a 100%)
      `
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)