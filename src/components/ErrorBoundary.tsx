import React from 'react';

interface State { hasError: boolean; error?: any }

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-4 glass rounded text-sm">
          <div className="font-semibold mb-2">Something went wrong.</div>
          <div className="opacity-80 break-all">
            {String(this.state.error)}
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}
