import { useRef, useState, type KeyboardEvent } from 'react';
import { stepHref } from './router.ts';
import { JOURNEY_STEPS, TOTAL_STEPS, getStep, type StepId } from './steps.ts';

interface Props {
  readonly currentId: StepId;
  readonly visited: readonly StepId[];
}

/**
 * Progress stepper. A vertical list on wide screens; on phones it collapses
 * to "Step n of 9" with a progress bar and an "All steps" toggle.
 */
export function Stepper({ currentId, visited }: Props) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const current = getStep(currentId);

  function onListKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      toggleRef.current?.focus();
    }
  }

  return (
    <nav className="stepper" aria-label="Progress" data-open={open ? 'true' : 'false'}>
      <div className="stepper-summary">
        <p className="stepper-position">
          Step {current.number} of {TOTAL_STEPS}: <strong>{current.title}</strong>
        </p>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${String((current.number / TOTAL_STEPS) * 100)}%` }} />
        </div>
        <button
          ref={toggleRef}
          type="button"
          className="btn btn-small btn-secondary stepper-toggle"
          aria-expanded={open}
          aria-controls="stepper-list"
          onClick={() => {
            setOpen((o) => !o);
          }}
        >
          {open ? 'Hide steps' : 'All steps'}
        </button>
      </div>
      <ol id="stepper-list" className="stepper-list" onKeyDown={onListKeyDown}>
        {JOURNEY_STEPS.map((step) => {
          const isCurrent = step.id === currentId;
          const isVisited = visited.includes(step.id);
          const status = isCurrent ? 'current step' : isVisited ? 'visited' : 'not visited yet';
          return (
            <li key={step.id} className="stepper-item" data-status={isCurrent ? 'current' : isVisited ? 'visited' : 'todo'}>
              <a
                className="stepper-link"
                href={stepHref(step.id)}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Step ${String(step.number)}: ${step.title} (${status})`}
                onClick={() => {
                  setOpen(false);
                }}
              >
                <span className="stepper-marker" aria-hidden="true">
                  {isVisited && !isCurrent ? '✓' : step.number}
                </span>
                <span className="stepper-title">{step.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
