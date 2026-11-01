import { PhaseTag } from '../../components/PhaseTag.tsx';
import { EmptyState } from '../../components/StateViews.tsx';
import { SyntheticDemo } from '../../components/SyntheticDemo.tsx';

const SOURCES = [
  { id: 'p60', title: 'P60 or P45', body: 'From each employer. PDF or a photo/screenshot.', types: 'PDF, JPG, PNG, WEBP', phase: 'P2' },
  { id: 'bank', title: 'Bank CSV', body: 'Exported from your bank’s website or app.', types: 'CSV', phase: 'P2' },
  { id: 'receipts', title: 'Receipts', body: 'Evidence for business costs. A receipt alone does not make a cost allowable.', types: 'PDF, JPG, PNG, WEBP', phase: 'P2' },
  { id: 'other', title: 'Other screenshot', body: 'For example, an invoice or a payment confirmation.', types: 'JPG, PNG, WEBP', phase: 'P2' },
] as const;

export function UploadContent() {
  return (
    <div className="stack">
      <div className="notice notice-info">
        <p>
          <strong>Files you add stay on this device.</strong> They are saved in this browser (not
          encrypted) and never uploaded to a server. Choosing files is switched off in this preview.
        </p>
      </div>

      <ul className="source-grid" aria-label="Ways to add information">
        {SOURCES.map((source) => (
          <li key={source.id} className="card source-card">
            <h3 className="card-heading">{source.title}</h3>
            <p>{source.body}</p>
            <p className="hint">Accepted: {source.types}</p>
            <div className="button-row">
              <button type="button" className="btn btn-secondary" disabled aria-label={`Choose files: ${source.title}`}>
                Choose files
              </button>
              <PhaseTag phase={source.phase} />
            </div>
          </li>
        ))}
        <li className="card source-card">
          <h3 className="card-heading">Enter figures manually</h3>
          <p>No document to hand? Type in the figures yourself.</p>
          <p className="hint">Always available as a fallback.</p>
          <div className="button-row">
            <button type="button" className="btn btn-secondary" disabled>
              Enter manually
            </button>
            <PhaseTag phase="P5" />
          </div>
        </li>
      </ul>

      <section aria-labelledby="your-docs-heading" className="stack">
        <h3 id="your-docs-heading">Your documents</h3>
        <EmptyState title="No documents added yet">
          <p>Documents you add will be listed here, with a preview and a remove option.</p>
        </EmptyState>
      </section>

      <SyntheticDemo title="Document list layout">
        <table className="data-table">
          <caption className="visually-hidden">Example document list</caption>
          <thead>
            <tr>
              <th scope="col">File</th>
              <th scope="col">Type</th>
              <th scope="col">Size</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td data-label="File">synthetic-p60.pdf</td>
              <td data-label="Type">P60</td>
              <td data-label="Size">84 KB</td>
              <td data-label="Status">
                <span className="chip chip-ok">Saved on this device</span>
              </td>
            </tr>
            <tr>
              <td data-label="File">synthetic-bank.csv</td>
              <td data-label="Type">Bank CSV</td>
              <td data-label="Size">12 KB</td>
              <td data-label="Status">
                <span className="chip chip-ok">Saved on this device</span>
              </td>
            </tr>
            <tr>
              <td data-label="File">synthetic-p60 (copy).pdf</td>
              <td data-label="Type">P60</td>
              <td data-label="Size">84 KB</td>
              <td data-label="Status">
                <span className="chip chip-warn">Duplicate of synthetic-p60.pdf</span>
              </td>
            </tr>
          </tbody>
        </table>
      </SyntheticDemo>
    </div>
  );
}
