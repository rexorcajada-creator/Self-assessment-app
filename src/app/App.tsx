import { useEffect, useMemo, useRef } from 'react';
import { DevBanner } from '../components/DevBanner.tsx';
import { ErrorBoundary } from '../components/ErrorBoundary.tsx';
import { EmptyState, ErrorState } from '../components/StateViews.tsx';
import { CURRENT_TAX_YEAR } from '../domain/taxYear.ts';
import { RestoreScreen } from '../features/backup/RestoreScreen.tsx';
import { WelcomeScreen } from '../features/setup/WelcomeScreen.tsx';
import { DraftContext, useDraft } from './draftContext.ts';
import type { DraftStore, StorageStatus } from './draftStore.ts';
import { parseHash, routeHref, useHash, type Route } from './router.ts';
import { SCREENS } from './screens.ts';
import { StepLayout } from './StepLayout.tsx';
import { Stepper } from './Stepper.tsx';
import { TOTAL_STEPS, getStep } from './steps.ts';

const APP_NAME = 'Self Assessment Assistant';

function pageTitle(route: Route): string {
  const suffix = `${APP_NAME} ${CURRENT_TAX_YEAR.label}`;
  switch (route.name) {
    case 'welcome':
      return suffix;
    case 'restore':
      return `Restore a backup – ${suffix}`;
    case 'not-found':
      return `Page not found – ${suffix}`;
    case 'step': {
      const step = getStep(route.stepId);
      return `Step ${String(step.number)} of ${String(TOTAL_STEPS)}: ${step.title} – ${suffix}`;
    }
  }
}

function StorageNotice({ status }: { readonly status: StorageStatus }) {
  if (status === 'unavailable') {
    return (
      <div className="notice notice-warn" role="alert">
        <p>
          <strong>This browser is not letting the app save your progress.</strong> Your answers will be
          lost if you refresh or close this tab. Private browsing modes often do this.
        </p>
      </div>
    );
  }
  if (status === 'reset') {
    return (
      <div className="notice notice-warn" role="alert">
        <p>
          <strong>Saved progress on this device could not be read, so it was cleared.</strong> You can
          start a new return or restore a backup.
        </p>
      </div>
    );
  }
  return null;
}

function NotStarted() {
  const { store } = useDraft();
  return (
    <div className="step-page">
      <EmptyState
        title="You have not started a return on this device"
        action={
          <div className="button-row">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                store.start();
              }}
            >
              Start my tax return
            </button>
            <a className="btn btn-secondary" href={routeHref({ name: 'restore' })}>
              Restore backup
            </a>
          </div>
        }
      >
        <p>Start a new 2025–26 return to see this step.</p>
      </EmptyState>
    </div>
  );
}

function RouteView({ route }: { readonly route: Route }) {
  const { state } = useDraft();
  switch (route.name) {
    case 'welcome':
      return <WelcomeScreen />;
    case 'restore':
      return <RestoreScreen />;
    case 'not-found':
      return (
        <div className="step-page">
          <h2 id="page-heading" tabIndex={-1}>
            Page not found
          </h2>
          <ErrorState
            title="We could not find that page"
            action={
              <a className="btn btn-primary" href={routeHref({ name: 'welcome' })}>
                Go to Welcome
              </a>
            }
          >
            <p>The link may be mistyped or from an older version of this app.</p>
          </ErrorState>
        </div>
      );
    case 'step': {
      const step = getStep(route.stepId);
      if (!state.draft) {
        return (
          <>
            <h2 id="page-heading" className="visually-hidden" tabIndex={-1}>
              {step.title}
            </h2>
            <NotStarted />
          </>
        );
      }
      return (
        <div className="step-shell">
          <Stepper key={`stepper-${step.id}`} currentId={step.id} visited={state.draft.visited} />
          {/* keys reset the phone step menu and the state preview when the step changes */}
          <StepLayout key={`page-${step.id}`} step={step} screen={SCREENS[step.id]} />
        </div>
      );
    }
  }
}

function Shell() {
  const { state, store } = useDraft();
  const hash = useHash();
  const route = useMemo(() => parseHash(hash), [hash]);
  const previousHash = useRef(hash);
  const hasDraft = state.draft !== null;

  useEffect(() => {
    document.title = pageTitle(route);
  }, [route]);

  // After navigating, move keyboard and screen-reader focus to the new page heading.
  useEffect(() => {
    if (previousHash.current === hash) return;
    previousHash.current = hash;
    document.getElementById('page-heading')?.focus();
  }, [hash]);

  useEffect(() => {
    if (route.name === 'step' && hasDraft) store.markVisited(route.stepId);
  }, [route, hasDraft, store]);

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="app-header">
        <div className="container app-header-inner">
          <h1 className="app-title">
            <a href={routeHref({ name: 'welcome' })}>{APP_NAME}</a>
          </h1>
          <div className="header-meta">
            <span className="year-badge">Tax year {CURRENT_TAX_YEAR.label}</span>
            <span className="status-chip">{hasDraft ? 'Draft in progress' : 'Not started'}</span>
          </div>
        </div>
      </header>

      <div className="container">
        <DevBanner />
        <StorageNotice status={state.storage} />
        <main id="main" tabIndex={-1}>
          <ErrorBoundary>
            <RouteView route={route} />
          </ErrorBoundary>
        </main>
      </div>

      <footer className="app-footer">
        <div className="container">
          <p>
            Not HMRC software and not tax advice. Nothing is submitted to HMRC. Documents and figures
            are never sent to a server.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function App({ store }: { readonly store: DraftStore }) {
  return (
    <DraftContext value={store}>
      <Shell />
    </DraftContext>
  );
}
