import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // می‌توانید خطا را به سرویس‌های مانیتورینگ ارسال کنید
    // مثال: Sentry.captureException(error);
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white p-4">
          <div className="max-w-md w-full bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
              <h2 className="text-xl font-bold">خطایی رخ داده است</h2>
            </div>
            
            <p className="text-slate-400 mb-4">
              متأسفانه برنامه با مشکلی مواجه شده است. لطفاً صفحه را بازخوانی کنید یا با پشتیبانی تماس بگیرید.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm font-mono break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-slate-400 text-sm cursor-pointer">جزئیات بیشتر</summary>
                    <pre className="mt-2 text-xs text-slate-400 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium"
              >
                بازخوانی صفحه
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
              >
                تلاش مجدد
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;