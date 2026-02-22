'use client';

import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="fixed inset-0 bg-[#0A0E27] flex items-center justify-center z-50">
          <div className="bg-[#1A3A52]/70 border-2 border-[#C41E3A]/50 rounded-xl p-8 max-w-md text-center backdrop-blur-md shadow-[0_0_25px_rgba(196,30,58,0.2)]">
            <div className="text-4xl mb-4">⚔️</div>
            <h2 className="font-cinzel font-bold text-[#C41E3A] text-xl mb-2">Algo deu errado</h2>
            <p className="text-white/50 text-sm mb-4">
              Um erro inesperado ocorreu no mundo do jogo.
            </p>
            <pre className="text-left text-xs text-white/30 bg-[#0A0E27]/60 rounded-lg p-3 mb-6 max-h-24 overflow-auto border border-[#C41E3A]/20">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] border-2 border-[#FFD700] rounded-lg font-cinzel font-bold text-[#0A0E27] tracking-wider transition-all hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
