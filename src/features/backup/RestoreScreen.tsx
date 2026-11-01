import { routeHref } from '../../app/router.ts';
import { PhaseTag } from '../../components/PhaseTag.tsx';

/** Placeholder for restoring an encrypted backup (built in P8). */
export function RestoreScreen() {
  return (
    <article className="step-page" aria-labelledby="page-heading">
      <header className="step-header">
        <p className="step-count">Restore</p>
        <h2 id="page-heading" tabIndex={-1}>
          Restore a backup
        </h2>
        <p className="lede">
          Open an encrypted backup you exported earlier from this app. It is decrypted on this device
          only.
        </p>
      </header>

      <div className="notice notice-info">
        <p>
          <strong>Not available yet.</strong> Restoring backups is built in phase P8. This screen shows
          the planned layout.
        </p>
      </div>

      <form
        className="card stack"
        aria-label="Restore backup"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="field">
          <label htmlFor="backup-file">Backup file</label>
          <input id="backup-file" type="file" disabled />
        </div>
        <div className="field">
          <label htmlFor="backup-passphrase">Backup passphrase</label>
          <input id="backup-passphrase" type="password" autoComplete="off" disabled />
        </div>
        <div className="button-row">
          <button type="submit" className="btn btn-primary" disabled>
            Check and restore
          </button>
          <PhaseTag phase="P8" />
        </div>
      </form>

      <section className="card" aria-labelledby="restore-checks-heading">
        <h3 id="restore-checks-heading">What happens when you restore</h3>
        <ul className="icon-list">
          <li>The backup is checked for tampering and damage before anything changes.</li>
          <li>A wrong passphrase or damaged file changes nothing on this device.</li>
          <li>Where possible, the backup is restored as a new draft rather than overwriting your current one.</li>
        </ul>
      </section>

      <nav className="step-nav" aria-label="Back">
        <a className="btn btn-secondary" href={routeHref({ name: 'welcome' })} aria-label="Back to Welcome">
          <span aria-hidden="true">←</span> Back
        </a>
      </nav>
    </article>
  );
}
