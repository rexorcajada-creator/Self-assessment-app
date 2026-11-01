import { DemoAmount, SyntheticDemo } from '../../../components/SyntheticDemo.tsx';

/**
 * P1 layout only. NO tax is calculated here: every amount is a hard-coded,
 * made-up SYNTHETIC DEMO string. The real engine arrives in P6 and is wired
 * up in P7.
 */
interface Figure {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly note: string;
}

const THIS_YEAR: readonly Figure[] = [
  { id: 'liability', label: '2025–26 total tax liability', value: '£9,876.54', note: 'Income Tax and Class 4 National Insurance on supported income' },
  { id: 'paye', label: 'PAYE tax already deducted', value: '£7,654.32', note: 'Taken from your pay by your employer(s)' },
  { id: 'net', label: '2025–26 liability after PAYE', value: '£2,222.22', note: 'Liability minus PAYE tax deducted' },
  { id: 'poa-paid', label: '2025–26 payments on account already made', value: '£1,111.11', note: 'Only payments you confirmed from your HMRC account' },
  { id: 'balancing', label: 'Estimated 2025–26 balancing payment', value: '£1,111.11', note: 'Due by 31 January 2027' },
];

const NEXT_YEAR: readonly Figure[] = [
  { id: 'poa-1', label: 'First 2026–27 payment on account', value: '£1,111.11', note: 'Due by 31 January 2027' },
  { id: 'poa-2', label: 'Second 2026–27 payment on account', value: '£1,111.11', note: 'Due by 31 July 2027' },
];

const DUE: readonly Figure[] = [
  { id: 'due-jan', label: 'Expected to pay by 31 January 2027', value: '£2,222.22', note: '2025–26 balancing payment plus first 2026–27 payment on account' },
  { id: 'due-jul', label: 'Expected to pay by 31 July 2027', value: '£1,111.11', note: 'Second 2026–27 payment on account' },
];

function FigureCards({ figures }: { readonly figures: readonly Figure[] }) {
  return (
    <ul className="figure-grid">
      {figures.map((figure) => (
        <li key={figure.id} className="figure-card">
          <p className="figure-label">{figure.label}</p>
          <p className="figure-value">
            <DemoAmount value={figure.value} />
          </p>
          <p className="figure-note">{figure.note}</p>
        </li>
      ))}
    </ul>
  );
}

export function EstimateContent() {
  return (
    <div className="stack">
      <div className="demo-banner" role="note" aria-label="Synthetic demo warning">
        <p className="demo-banner-title">SYNTHETIC DEMO — NOT A TAX CALCULATION</p>
        <p>
          No tax has been worked out. The tax engine is built and tested in phase P6. Every figure on
          this screen is made up to show the layout.
        </p>
      </div>

      <SyntheticDemo title="Tax estimate dashboard">
        <p>
          <span className="badge badge-provisional">PROVISIONAL — NOT FILING-READY</span>
        </p>

        <section aria-labelledby="this-year-heading" className="stack">
          <h3 id="this-year-heading">2025–26 tax year</h3>
          <FigureCards figures={THIS_YEAR} />
        </section>

        <section aria-labelledby="next-year-heading" className="stack">
          <h3 id="next-year-heading">2026–27 payments on account (future instalments)</h3>
          <p className="hint">
            Advance payments towards next year’s bill. They are separate from the 2025–26 balance and
            are not always required.
          </p>
          <FigureCards figures={NEXT_YEAR} />
        </section>

        <section aria-labelledby="due-heading" className="stack">
          <h3 id="due-heading">Payment timeline</h3>
          <FigureCards figures={DUE} />
        </section>

        <details className="breakdown">
          <summary>Detailed breakdown</summary>
          <p>
            Will show each employment, trading income, approved costs, trading allowance comparison,
            Personal Allowance, tax bands, Class 4 and Class 2 status, with the source of every line
            (phase P7).
          </p>
        </details>

        <section aria-labelledby="assumptions-heading">
          <h3 id="assumptions-heading">Assumptions (example)</h3>
          <ul>
            <li>Resident in England, Wales or Northern Ireland.</li>
            <li>No company benefits, student loan or pension adjustments.</li>
          </ul>
        </section>
      </SyntheticDemo>

      <p className="hint">HMRC’s own figures are authoritative for your account balance.</p>
    </div>
  );
}
