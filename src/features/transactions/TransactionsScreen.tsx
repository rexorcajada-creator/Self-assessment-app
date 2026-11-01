import { PhaseTag } from '../../components/PhaseTag.tsx';
import { DemoAmount, SyntheticDemo } from '../../components/SyntheticDemo.tsx';

interface DemoRow {
  readonly date: string;
  readonly description: string;
  readonly amount: string;
  readonly suggestion: string;
  readonly status: 'Needs review' | 'Excluded' | 'Approved';
  readonly why: string;
}

const DEMO_ROWS: readonly DemoRow[] = [
  { date: '2 May 2025', description: 'SYNTHETIC CLIENT A INV-001', amount: '+£250.00', suggestion: 'Possible business income', status: 'Needs review', why: 'Incoming payment from a payer not seen before.' },
  { date: '28 May 2025', description: 'SYNTHETIC EMPLOYER PAYROLL', amount: '+£1,500.00', suggestion: 'Salary', status: 'Excluded', why: 'Looks like salary, which comes from your P60 instead.' },
  { date: '3 Jun 2025', description: 'Transfer to own savings', amount: '−£200.00', suggestion: 'Transfer', status: 'Excluded', why: 'Moves money between your own accounts.' },
  { date: '14 Jun 2025', description: 'SYNTHETIC TAXI CO', amount: '−£18.40', suggestion: 'Possible expense', status: 'Needs review', why: 'Travel only counts if the journey was for business.' },
  { date: '1 Jul 2025', description: 'SYNTHETIC STATIONERY', amount: '−£12.99', suggestion: 'Possible expense', status: 'Approved', why: 'You confirmed it was for the business.' },
];

const CHIP: Record<DemoRow['status'], string> = {
  'Needs review': 'chip chip-warn',
  Excluded: 'chip chip-muted',
  Approved: 'chip chip-ok',
};

export function TransactionsContent() {
  return (
    <div className="stack">
      <div className="notice notice-info">
        <p>
          <strong>Only transactions you approve are used.</strong> Anything uncertain stays in the review
          queue and is left out until you decide. Not every incoming payment is business income.
        </p>
      </div>

      <div className="button-row">
        <button type="button" className="btn btn-primary" disabled>
          Import a bank CSV
        </button>
        <PhaseTag phase="P4" />
      </div>

      <SyntheticDemo title="Review queue layout">
        <table className="data-table">
          <caption className="visually-hidden">Example bank transactions</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Description</th>
              <th scope="col">Amount</th>
              <th scope="col">Suggested</th>
              <th scope="col">Status</th>
              <th scope="col">Why</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_ROWS.map((row) => (
              <tr key={row.description}>
                <td data-label="Date">{row.date}</td>
                <td data-label="Description">{row.description}</td>
                <td data-label="Amount">
                  <DemoAmount value={row.amount} />
                </td>
                <td data-label="Suggested">{row.suggestion}</td>
                <td data-label="Status">
                  <span className={CHIP[row.status]}>{row.status}</span>
                </td>
                <td data-label="Why">{row.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SyntheticDemo>
    </div>
  );
}
