import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-4">Oops!</h1>
              <p className="text-sand/80 mb-6">
                Une erreur inattendue s&apos;est produite.
              </p>
              <div className="bg-red/10 border border-red/30 rounded-lg p-4 mb-6 text-left">
                <p className="text-red text-sm font-mono break-words">
                  {this.state.error?.message}
                </p>
              </div>
              <p className="text-sand/60 text-sm mb-6">
                Veuillez rafraîchir la page ou contacter les administrateurs si
                le problème persiste.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-white text-ink font-semibold py-2 rounded-lg shadow-soft hover:-translate-y-[1px] transition-transform"
              >
                Rafraîchir
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
