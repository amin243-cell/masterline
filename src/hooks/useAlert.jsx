import { useState, useCallback } from 'react'
import AlertDialog from '../components/ui/AlertDialog'

export default function useAlert() {
  const [state, setState] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info'
  })

  const alert = useCallback((options) => {
    setState({
      open: true,
      title: options.title || 'توجه',
      message: options.message || '',
      type: options.type || 'info'
    })
  }, [])

  const AlertComponent = useCallback(() => (
    <AlertDialog
      open={state.open}
      onClose={() => setState(prev => ({ ...prev, open: false }))}
      title={state.title}
      message={state.message}
      type={state.type}
    />
  ), [state])

  return { alert, AlertComponent }
}