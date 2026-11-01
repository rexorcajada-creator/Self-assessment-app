import { PhaseTag } from '../../components/PhaseTag.tsx';
import { DemoAmount, SyntheticDemo } from '../../components/SyntheticDemo.tsx';

export function ExtractedContent() {
  return (
    <div className="stack">
      <div className="notice notice-info">
        <p>
          Always compare each figure with the original document. A high confidence score does not
          prove a figure is right, so nothing is used until you confirm it.
        </p>
      </div>

      <SyntheticDemo title="Figures read from a P60">
        <div className="extract-layout">
          <div className="doc-preview" aria-label="Original document preview (placeholder)" role="img">
            <span>Original document preview</span>
          </div>
          <table className="data-table">
            <caption className="visually-hidden">Example extracted P60 fields</caption>
            <thead>
              <tr>
                <th scope="col">Field</th>
                <th scope="col">Value</th>
                <th scope="col">Source</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-label="Field">Employer name</td>
                <td data-label="Value">Example Trading Ltd (fake)</td>
                <td data-label="Source">Page 1</td>
                <td data-label="Status">
                  <span className="chip chip-ok">Confirmed</span>
                </td>
              </tr>
              <tr>
                <td data-label="Field">Employer PAYE reference</td>
                <td data-label="Value">000/ZZ00000</td>
                <td data-label="Source">Page 1</td>
                <td data-label="Status">
                  <span className="chip chip-ok">Confirmed</span>
                </td>
              </tr>
              <tr>
                <td data-label="Field">Pay in this employment</td>
                <td data-label="Value">
                  <DemoAmount value="£12,345.67" />
                </td>
                <td data-label="Source">Page 1, high confidence</td>
                <td data-label="Status">
                  <span className="chip chip-warn">Needs review</span>
                </td>
              </tr>
              <tr>
                <td data-label="Field">Tax deducted in this employment</td>
                <td data-label="Value">
                  <DemoAmount value="£1,234.56" />
                </td>
                <td data-label="Source">Page 1, low confidence</td>
                <td data-label="Status">
                  <span className="chip chip-warn">Needs review</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="button-row">
          <button type="button" className="btn btn-secondary" disabled>
            Edit a figure
          </button>
          <button type="button" className="btn btn-primary" disabled>
            Confirm figures
          </button>
          <PhaseTag phase="P3" />
        </div>
      </SyntheticDemo>

      <div className="notice notice-warn">
        <p>
          <strong>P45 and P60 for the same job?</strong> You will be asked which one to use. They are
          never added together automatically.
        </p>
      </div>
    </div>
  );
}
