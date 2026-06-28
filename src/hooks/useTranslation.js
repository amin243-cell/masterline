import useStore from '../store/useStore'
import { translations } from '../i18n/translations'

export function useTranslation() {
  const language = useStore((state) => state.settings.language)

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[language]
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key // fallback
      }
    }
    return value || key
  }

  return { t, language }
}