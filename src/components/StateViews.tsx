import type { ReactNode } from 'react';

interface StateProps {
  readonly title: string;
  readonly children?: ReactNode;
  readonly action?: ReactNode;
}

/** Polite, non-blocking "working on it" message. */
export function LoadingState({ title, children }: Omit<StateProps, 'action'>) {
  return (
    <div className="state state-loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <div>
        <p className="state-title">{title}</p>
        {children}
      </div>
    </div>
  );
}

/** Nothing here yet, with a suggested next action. */
export function EmptyState({ title, children, action }: StateProps) {
  return (
    <div className="state state-empty">
      <span className="state-icon" aria-hidden="true">
        ○
      </span>
      <div>
        <p className="state-title">{title}</p>
        {children}
        {action && <div className="state-action">{action}</div>}
      </div>
    </div>
  );
}

/** Something went wrong; announced immediately to screen readers. */
export function ErrorState({ title, children, action }: StateProps) {
  return (
    <div className="state state-error" role="alert">
      <span className="state-icon" aria-hidden="true">
        !
      </span>
      <div>
        <p className="state-title">{title}</p>
        {children}
        {action && <div className="state-action">{action}</div>}
      </div>
    </div>
  );
}
