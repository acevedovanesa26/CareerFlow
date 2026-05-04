import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center p-4">
          <div className="card max-w-md w-full text-center space-y-6 !p-10 border-2 border-red-500/20 shadow-2xl">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-brand-dark mb-2">Algo salió mal</h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Lo sentimos, ha ocurrido un error inesperado en la aplicación. 
                {this.state.error && <span className="block mt-2 font-mono text-[10px] text-red-400">Detalle: {this.state.error.message}</span>}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()} 
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} /> Reintentar Cargar
              </button>
              <a 
                href="/"
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Home size={18} /> Ir al Inicio
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
