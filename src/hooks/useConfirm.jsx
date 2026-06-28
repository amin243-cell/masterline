import { useState, useCallback } from 'react'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function useConfirm() {
  const [state, setState] = useState({
    open: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: () => {},
    confirmText: 'تأیید',
    cancelText: 'انصراف'
  })

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: options.title || 'آیا مطمئن هستید؟',
        message: options.message || '',
        type: options.type || 'danger',
        confirmText: options.confirmText || 'تأیید',
        cancelText: options.cancelText || 'انصراف',
        onConfirm: () => {
          resolve(true)
          setState(prev => ({ ...prev, open: false }))
        },
        onCancel: () => {
          resolve(false)
          setState(prev => ({ ...prev, open: false }))
        }
      })
    })
  }, [])

  const ConfirmComponent = useCallback(() => (
    <ConfirmDialog
      open={state.open}
      onClose={state.onCancel || (() => setState(prev => ({ ...prev, open: false })))}
      onConfirm={state.onConfirm}
      title={state.title}
      message={state.message}
      type={state.type}
      confirmText={state.confirmText}
      cancelText={state.cancelText}
    />
  ), [state])

  return { confirm, ConfirmComponent }
}