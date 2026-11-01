import { useEffect, useRef, useState } from 'react';
import { useDraft } from '../../app/draftContext.ts';
import { navigate } from '../../app/router.ts';
import { PhaseTag } from '../../components/PhaseTag.tsx';

function DeleteLocalProgress() {
  const { store } = useDraft();
  const [confirming, setConfirming] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const wasConfirming = useRef(false);

  // Move focus into the confirmation, and back to the trigger on Cancel.
  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
    else if (wasConfirming.current) triggerRef.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  if (!confirming) {
    return (
      <button
        ref={triggerRef}
        type="button"
        className="btn btn-danger-outline"
        onClick={() => {
          setConfirming(true);
        }}
      >
        Delete this device’s progress
      </button>
    );
  }
  return (
    <div className="confirm-card card" role="group" aria-label="Confirm delete">
      <p>
        This deletes your progress and quick-setup answers from this browser. It cannot be undone.
      </p>
      <div className="button-row">
        <button
          ref={confirmRef}
          type="button"
          className="btn btn-danger"
          onClick={() => {
            store.clear();
            navigate({ name: 'welcome' });
          }}
        >
          Yes, delete it
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setConfirming(false);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function BackupContent() {
  return (
    <div className="stack">
      <section className="card stack" aria-labelledby="export-heading">
        <h3 id="export-heading" className="card-heading">
          Export an encrypted backup
        </h3>
        <p>
          The backup will include your original documents, records and approvals, encrypted on this
          device with a passphrase you choose. The passphrase is never saved. If you lose it, nobody can
          open the backup — not even this app.
        </p>
        <form
          className="stack"
          aria-label="Export backup"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <div className="field">
            <label htmlFor="export-passphrase">Backup passphrase</label>
            <input id="export-passphrase" type="password" autoComplete="new-password" disabled />
          </div>
          <div className="button-row">
            <button type="submit" className="btn btn-primary" disabled>
              Export encrypted backup
            </button>
            <PhaseTag phase="P8" />
          </div>
        </form>
      </section>

      <div className="notice notice-warn" role="note" aria-label="Storage warning">
        <p>
          <strong>Your browser can delete this app’s data.</strong> Clearing browsing data deletes it,
          and phones and tablets (especially Safari on iPhone and iPad) may remove website data that has
          not been used for a while. Keep an encrypted backup somewhere safe, away from this device.
        </p>
      </div>

      <section className="card stack" aria-labelledby="local-data-heading">
        <h3 id="local-data-heading" className="card-heading">
          Data kept on this device
        </h3>
        <p>
          In this preview, the app saves only which steps you have visited and your quick-setup answers.
          They are stored unencrypted in this browser. No documents or amounts are stored yet.
        </p>
        <DeleteLocalProgress />
      </section>

      <section className="card" aria-labelledby="finish-heading">
        <h3 id="finish-heading" className="card-heading">
          Filing your return
        </h3>
        <p>
          This app does not submit anything. When you are ready, sign in to HMRC’s online service and
          enter the figures yourself. The usual deadline for filing online and paying for 2025–26 is
          31 January 2027.
        </p>
      </section>
    </div>
  );
}
