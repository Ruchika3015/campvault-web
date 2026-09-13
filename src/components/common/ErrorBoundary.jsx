import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-0 text-ink-0 flex items-center justify-center p-6">
          <div className="surface-metal-brushed rounded-2xl p-8 max-w-lg w-full border border-coral/30 shadow-2xl text-center relative overflow-hidden">
            <div className="mx-auto w-12 h-12 rounded-xl bg-coral/15 text-coral grid place-items-center mb-4">
              <AlertTriangle size={24} />
            </div>

            <h2 className="font-display text-2xl text-ink-0 tracking-tight">
              APPLICATION FAULT DETECTED
            </h2>

            <p className="font-mono text-xs text-ink-2 mt-2 leading-relaxed">
              {this.state.error?.message || 'An unexpected rendering error occurred in this module.'}
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => window.location.reload()}
                className="machine-control machine-control--primary inline-flex items-center gap-2 px-4 py-2 font-mono text-xs"
              >
                <RefreshCw size={13} />
                RELOAD SYSTEM
              </button>

              <a
                href="/dashboard"
                className="machine-control inline-flex items-center gap-2 px-4 py-2 font-mono text-xs text-ink-1 hover:text-ink-0 border border-metal-2"
              >
                <Home size={13} />
                WORKSHOP HOME
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
