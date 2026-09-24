import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Ambient Canvas] Uncaught runtime error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#08090B] flex items-center justify-center p-6 text-white select-none">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#0F1117] border border-white/10 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-xs text-white/50 leading-relaxed mb-6">
              {this.state.error?.message || 'An unexpected rendering error occurred. Please reload to recover.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-full glass-dock text-xs font-medium text-white hover:bg-white/15 transition-all cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-white font-semibold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
