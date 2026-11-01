import { Component, type ReactNode } from 'react';

interface Props {
  readonly children: ReactNode;
}

interface State {
  readonly failed: boolean;
}

/**
 * Last-resort screen if a component crashes. Shows no error details, because
 * in later phases an error message could contain document text.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(): void {
    console.error('A screen failed to display. Details are hidden to protect your data.');
  }

  override render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="state state-error crash" role="alert">
        <span className="state-icon" aria-hidden="true">
          !
        </span>
        <div>
          <h2 className="state-title">Something went wrong on this screen</h2>
          <p>Your saved progress on this device has not been deleted. Try reloading the page.</p>
          <div className="state-action">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload the app
            </button>
          </div>
        </div>
      </div>
    );
  }
}
