import { useEffect, useRef, useState } from 'react';
import { useDraft } from '../../app/draftContext.ts';
import { navigate, routeHref } from '../../app/router.ts';
import { JOURNEY_STEPS, getStep } from '../../app/steps.ts';
import { CURRENT_TAX_YEAR } from '../../domain/taxYear.ts';

export function PrivacyPanel() {
  return (
    <section className="card privacy-card" aria-labelledby="privacy-heading">
      <h3 id="privacy-heading">Your privacy and your data</h3>
      <ul className="icon-list">
        <li>
          <strong>All real document processing will run locally on this device.</strong> No server
          receives your documents, bank files or figures. There is no cloud OCR, AI, analytics or bank
          connection.
        </li>
        <li>
          <strong>Your local working records will not be encrypted by this app.</strong> They are kept
          in this browser's storage on this device, with no app password. Anyone who can use this
          device and browser profile could read them, so protect the device with its own screen lock.
        </li>
        <li>
          <strong>Browser storage can be lost.</strong> Browsers, especially on phones and tablets, can
          delete website data. Only backups you export are encrypted, with a passphrase you choose.
        </li>
      </ul>
    </section>
  );
}

export function WelcomeScreen() {
  const { state, store } = useDraft();
  const [confirming, setConfirming] = useState(false);
  const [resumeMessage, setResumeMessage] = useState(false);
  const confirmRef = useRef<HTMLHeadingElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);
  const draft = state.draft;

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  function startNew() {
    store.start();
    navigate({ name: 'step', stepId: 'setup' });
  }

  function onStart() {
    if (draft) {
      setResumeMessage(false);
      setConfirming(true);
    } else {
      startNew();
    }
  }

  function onResume() {
    if (draft) {
      navigate({ name: 'step', stepId: draft.lastStepId ?? 'setup' });
    } else {
      setConfirming(false);
      setResumeMessage(true);
    }
  }

  return (
    <div className="welcome">
      <section className="hero" aria-labelledby="page-heading">
        <p className="eyebrow">UK Self Assessment</p>
        <h2 id="page-heading" tabIndex={-1}>
          Prepare your <span className="nowrap">{CURRENT_TAX_YEAR.label}</span> tax return
        </h2>
        <p className="year-range">
          Tax year {CURRENT_TAX_YEAR.label}: 6 April 2025 to 5 April 2026
        </p>
        <p className="lede">
          Bring your P60, bank records and business expenses together, check every figure, then copy
          the numbers into HMRC's own online service yourself.
        </p>

        <button ref={startRef} type="button" className="btn btn-primary btn-start" onClick={onStart}>
          Start my tax return
        </button>

        {confirming && draft && (
          <div className="card confirm-card" role="group" aria-labelledby="confirm-heading">
            <h3 id="confirm-heading" tabIndex={-1} ref={confirmRef}>
              Start again?
            </h3>
            <p>
              You already have a return in progress
              {draft.lastStepId ? ` (last seen: ${getStep(draft.lastStepId).title})` : ''}. Starting
              again clears the progress and answers saved in this browser.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={startNew}>
                Yes, start again
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setConfirming(false);
                  startRef.current?.focus();
                }}
              >
                No, keep my return
              </button>
            </div>
          </div>
        )}

        <div className="secondary-actions">
          <button type="button" className="btn btn-secondary" onClick={onResume}>
            Resume return
          </button>
          <a className="btn btn-secondary" href={routeHref({ name: 'restore' })}>
            Restore backup
          </a>
        </div>
        <div aria-live="polite">
          {draft && !confirming && (
            <p className="hint">
              Return in progress on this device
              {draft.lastStepId ? `, last seen at step ${String(getStep(draft.lastStepId).number)}: ${getStep(draft.lastStepId).title}` : ''}.
            </p>
          )}
          {resumeMessage && !draft && (
            <p className="inline-message">
              There is no return in progress on this device yet. Choose <strong>Start my tax return</strong>,
              or restore a backup.
            </p>
          )}
        </div>
      </section>

      <PrivacyPanel />

      <section className="card" aria-labelledby="scope-heading">
        <h3 id="scope-heading">Before you start</h3>
        <ul className="icon-list">
          <li>
            <strong>Not HMRC software.</strong> This app never files or submits anything. You stay in
            control and file with HMRC yourself.
          </li>
          <li>
            <strong>Made for simple returns:</strong> PAYE employment and sole-trader income, for people
            in England, Wales or Northern Ireland. Other situations are flagged, and the estimate is
            then labelled provisional.
          </li>
          <li>
            <strong>Not tax advice.</strong> Estimates must be checked against HMRC's own calculation.
          </li>
        </ul>
      </section>

      <section className="card journey-card" aria-labelledby="steps-heading">
        <h3 id="steps-heading">What happens next</h3>
        <ol className="journey-overview">
          {JOURNEY_STEPS.map((step) => (
            <li key={step.id}>
              <strong>{step.title}.</strong> {step.summary}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
