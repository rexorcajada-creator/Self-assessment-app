import type { ReactNode } from 'react';
import { PhaseTag } from '../../components/PhaseTag.tsx';
import { DemoAmount, SyntheticDemo } from '../../components/SyntheticDemo.tsx';

interface BoxRow {
  readonly box: string;
  readonly label: string;
  readonly value: ReactNode;
}

function BoxTable({ caption, rows }: { readonly caption: string; readonly rows: readonly BoxRow[] }) {
  return (
    <table className="data-table box-table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Box</th>
          <th scope="col">Field</th>
          <th scope="col">Value</th>
          <th scope="col">
            <span className="visually-hidden">Copy</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.box}>
            <td data-label="Box">{row.box}</td>
            <td data-label="Field">{row.label}</td>
            <td data-label="Value">{row.value}</td>
            <td data-label="Copy">
              <button type="button" className="btn btn-small btn-secondary" disabled aria-label={`Copy box ${row.box}`}>
                Copy
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function FilingContent() {
  return (
    <div className="stack">
      <div className="notice notice-warn">
        <p>
          <strong>Use as a reference, not a script.</strong> HMRC’s online service asks questions in its
          own order, which may not match these paper-form box numbers. This app never files for you.
        </p>
        <p>
          Box numbers here are a layout preview. They will be checked against the official 2025–26
          forms in phase P7 before being relied on.
        </p>
      </div>

      <SyntheticDemo title="Filing guide layout">
        <div className="stack">
          <BoxTable
            caption="Employment (SA102), job 1: Example Trading Ltd (fake)"
            rows={[
              { box: '1', label: 'Pay from this employment', value: <DemoAmount value="£12,345.67" /> },
              { box: '2', label: 'UK tax taken off pay', value: <DemoAmount value="£1,234.56" /> },
              { box: '4', label: 'Employer PAYE reference', value: '000/ZZ00000' },
              { box: '5', label: 'Employer name', value: 'Example Trading Ltd (fake)' },
            ]}
          />
          <BoxTable
            caption="Self-employment short (SA103S)"
            rows={[
              { box: '9', label: 'Turnover', value: <DemoAmount value="£2,345.67" /> },
              { box: '10.1', label: 'Trading allowance', value: 'Not used (actual expenses claimed instead)' },
              { box: '20', label: 'Total allowable expenses', value: <DemoAmount value="£123.45" /> },
              { box: '31', label: 'Total taxable profits from this business', value: <DemoAmount value="£2,222.22" /> },
            ]}
          />
          <BoxTable
            caption="Tax calculation summary (SA110)"
            rows={[
              { box: '1', label: 'Total tax due',value: <DemoAmount value="£2,222.22" /> },
              { box: '4', label: 'Class 4 NICs due', value: <DemoAmount value="£0.00" /> },
            ]}
          />
        </div>
      </SyntheticDemo>

      <div className="button-row">
        <button type="button" className="btn btn-primary" disabled>
          Download PDF guide
        </button>
        <PhaseTag phase="P8" />
      </div>

      <section className="card" aria-labelledby="before-submit-heading">
        <h3 id="before-submit-heading" className="card-heading">
          Before you submit to HMRC
        </h3>
        <ul className="icon-list">
          <li>Check every figure against your original documents.</li>
          <li>Resolve anything flagged as provisional, or get advice.</li>
          <li>HMRC’s figures are authoritative for your account balance and payments due.</li>
          <li>Export an encrypted backup before you rely on this device’s storage.</li>
        </ul>
      </section>
    </div>
  );
}
