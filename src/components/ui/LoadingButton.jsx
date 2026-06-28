import { Loader2 } from 'lucide-react'
import { Button } from '../ui/button'

export default function LoadingButton({ 
  loading, 
  children, 
  className, 
  ...props 
}) {
  return (
    <Button 
      className={`${className} relative`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin ml-2" />
      )}
      <span className={loading ? 'opacity-70' : ''}>
        {children}
      </span>
    </Button>
  )
}