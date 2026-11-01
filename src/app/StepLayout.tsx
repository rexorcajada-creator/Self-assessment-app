import { useId, useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews.tsx';
import { routeHref, stepHref } from './router.ts';
import type { ScreenDefinition, ScreenView } from './screenTypes.ts';
import { TOTAL_STEPS, nextStep, previousStep, type JourneyStep } from './steps.ts';

const VIEW_OPTIONS: readonly { value: ScreenView; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'empty', label: 'Empty' },
  { value: 'loading', label: 'Loading' },
  { value: 'error', label: 'Error' },
];

/**
 * P1 design-review aid: lets a reviewer see each screen's empty, loading and
 * error layouts before real data exists. Remove once screens have live data.
 */
function StatePreview({ value, onChange }: { readonly value: ScreenView; readonly onChange: (v: ScreenView) => void }) {
  const name = useId();
  return (
    <details className="state-preview">
      <summary>Preview screen states (design check)</summary>
      <fieldset className="radio-group radio-group-inline">
        <legend className="visually-hidden">Screen state to preview</legend>
        <div className="radio-options">
          {VIEW_OPTIONS.map((option) => (
            <label key={option.value} className="radio-option">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => {
                  onChange(option.value);
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </details>
  );
}

function ScreenBody({ screen, view, onRetry }: { readonly screen: ScreenDefinition; readonly view: ScreenView; readonly onRetry: () => void }) {
  switch (view) {
    case 'loading':
      return <LoadingState title={screen.loading} />;
    case 'empty':
      return (
        <EmptyState
          title={screen.empty.title}
          action={
            screen.empty.action && (
              <a className="btn btn-secondary" href={screen.empty.action.href}>
                {screen.empty.action.label}
              </a>
            )
          }
        >
          <p>{screen.empty.body}</p>
        </EmptyState>
      );
    case 'error':
      return (
        <ErrorState
          title={screen.error.title}
          action={
            <button type="button" className="btn btn-secondary" onClick={onRetry}>
              Try again
            </button>
          }
        >
          <p>{screen.error.body}</p>
        </ErrorState>
      );
    case 'normal': {
      const { Content } = screen;
      return <Content />;
    }
  }
}

function StepNavigation({ step }: { readonly step: JourneyStep }) {
  const previous = previousStep(step.id);
  const next = nextStep(step.id);
  return (
    <nav className="step-nav" aria-label="Back and next">
      {previous ? (
        <a className="btn btn-secondary" href={stepHref(previous.id)} rel="prev">
          <span aria-hidden="true">←</span>
          <span>
            Back<span className="visually-hidden">: {previous.title}</span>
          </span>
        </a>
      ) : (
        <a className="btn btn-secondary" href={routeHref({ name: 'welcome' })} aria-label="Back to Welcome">
          <span aria-hidden="true">←</span> Back
        </a>
      )}
      {next ? (
        <a className="btn btn-primary" href={stepHref(next.id)} rel="next">
          <span>
            Next<span className="nav-next-title">: {next.title}</span>
          </span>
          <span aria-hidden="true">→</span>
        </a>
      ) : (
        <a className="btn btn-primary" href={routeHref({ name: 'welcome' })}>
          Finish and return to Welcome
        </a>
      )}
    </nav>
  );
}

export function StepLayout({ step, screen }: { readonly step: JourneyStep; readonly screen: ScreenDefinition }) {
  const [view, setView] = useState<ScreenView>('normal');
  return (
    <article className="step-page" aria-labelledby="page-heading">
      <header className="step-header">
        <p className="step-count">
          Step {step.number} of {TOTAL_STEPS}
        </p>
        <h2 id="page-heading" tabIndex={-1}>
          {step.title}
        </h2>
        <p className="lede">{step.summary}</p>
      </header>
      <StatePreview value={view} onChange={setView} />
      <div className="step-body">
        <ScreenBody
          screen={screen}
          view={view}
          onRetry={() => {
            setView('normal');
          }}
        />
      </div>
      <StepNavigation step={step} />
    </article>
  );
}
