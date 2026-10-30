import { useState } from 'react';
import { CURRENT_TAX_YEAR } from '../domain/taxYear.ts';
import { JOURNEY_STEPS, type JourneyStep } from './steps.ts';
import { DevBanner } from '../components/DevBanner.tsx';

/**
 * P0 navigation shell. Each step is a placeholder; no documents are stored
 * or processed and no tax figures are shown.
 */
export function App() {
  const [currentId, setCurrentId] = useState<string>(JOURNEY_STEPS[0]?.id ?? '');
  const current: JourneyStep | undefined = JOURNEY_STEPS.find((s) => s.id === currentId);

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="shell-header">
        <h1 className="app-title">Self Assessment Assistant</h1>
        <p className="tax-year">Tax year {CURRENT_TAX_YEAR.label}</p>
      </header>

      <DevBanner />

      <div className="shell-body">
        <nav aria-label="Return steps" className="steps-nav">
          <ol>
            {JOURNEY_STEPS.map((step) => (
              <li key={step.id}>
                <button
                  type="button"
                  className="step-button"
                  aria-current={step.id === currentId ? 'step' : undefined}
                  onClick={() => {
                    setCurrentId(step.id);
                  }}
                >
                  <span className="step-number" aria-hidden="true">
                    {step.number}
                  </span>
                  {step.title}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <main id="main" className="step-content" tabIndex={-1}>
          {current && (
            <section aria-labelledby="step-heading">
              <h2 id="step-heading">{current.title}</h2>
              <p>{current.summary}</p>
              <p className="placeholder-note">
                Placeholder screen. Planned for phase {current.phase}.
              </p>
            </section>
          )}
        </main>
      </div>

      <footer className="shell-footer">
        <p>
          Not HMRC software. This app does not submit anything to HMRC. Documents are never sent to
          a server.
        </p>
      </footer>
    </div>
  );
}
