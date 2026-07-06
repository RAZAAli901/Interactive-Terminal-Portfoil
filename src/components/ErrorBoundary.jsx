import { Component } from 'react';

/**
 * ErrorBoundary catches uncaught errors in any child component tree
 * and renders a fallback UI instead of crashing the whole page.
 *
 * Usage:
 *   <ErrorBoundary fallback={<p>Something went wrong</p>}>
 *     <MyComponent />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console in development; swap for a real logging service in production
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Allow the caller to supply a custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback — minimal, matches the dark portfolio theme
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            background: '#0c0c0c',
            color: '#ff5252',
            fontFamily: "'Share Tech Mono', monospace",
            padding: '24px',
            textAlign: 'center',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '28px' }}>⚠️</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
            This window encountered an error.
          </div>
          <div style={{ fontSize: '11px', color: '#9e9c96', maxWidth: '320px' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </div>
          <button
            onClick={this.handleReset}
            style={{
              marginTop: '8px',
              padding: '6px 18px',
              background: '#1c1c1f',
              border: '1px solid #ff5252',
              color: '#ff5252',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '11px',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
