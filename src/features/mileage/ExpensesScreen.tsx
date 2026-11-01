import { PhaseTag } from '../../components/PhaseTag.tsx';
import { DemoAmount, SyntheticDemo } from '../../components/SyntheticDemo.tsx';

export function ExpensesContent() {
  return (
    <div className="stack">
      <div className="notice notice-info">
        <p>
          <strong>Only approved, allowable costs are used.</strong> Meals, fuel, taxis and parking are
          never approved automatically: you will be asked what they were for. Later, the app compares
          your approved expenses with the trading allowance and shows both. It never claims both.
        </p>
      </div>

      <section className="stack" aria-labelledby="expenses-heading">
        <h3 id="expenses-heading">Business expenses</h3>
        <div className="button-row">
          <button type="button" className="btn btn-secondary" disabled>
            Add an expense
          </button>
          <PhaseTag phase="P5" />
        </div>
        <SyntheticDemo title="Expenses layout">
          <table className="data-table">
            <caption className="visually-hidden">Example expenses</caption>
            <thead>
              <tr>
                <th scope="col">Description</th>
                <th scope="col">Category</th>
                <th scope="col">Amount</th>
                <th scope="col">Business use</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-label="Description">Printer paper (fake)</td>
                <td data-label="Category">Office costs</td>
                <td data-label="Amount">
                  <DemoAmount value="£12.99" />
                </td>
                <td data-label="Business use">100%</td>
                <td data-label="Status">
                  <span className="chip chip-ok">Approved</span>
                </td>
              </tr>
              <tr>
                <td data-label="Description">Mobile phone bill (fake)</td>
                <td data-label="Category">Office costs</td>
                <td data-label="Amount">
                  <DemoAmount value="£30.00" />
                </td>
                <td data-label="Business use">25%</td>
                <td data-label="Status">
                  <span className="chip chip-warn">Needs review</span>
                </td>
              </tr>
              <tr>
                <td data-label="Description">Lunch (fake)</td>
                <td data-label="Category">Not decided</td>
                <td data-label="Amount">
                  <DemoAmount value="£8.50" />
                </td>
                <td data-label="Business use">Unknown</td>
                <td data-label="Status">
                  <span className="chip chip-warn">Needs review</span>
                </td>
              </tr>
            </tbody>
          </table>
        </SyntheticDemo>
      </section>

      <section className="stack" aria-labelledby="journeys-heading">
        <h3 id="journeys-heading">Business journeys</h3>
        <p className="hint">
          Only genuine business journeys count. Ordinary travel between home and a regular workplace
          usually does not.
        </p>
        <div className="button-row">
          <button type="button" className="btn btn-secondary" disabled>
            Add a journey
          </button>
          <PhaseTag phase="P5" />
        </div>
        <SyntheticDemo title="Journeys layout">
          <table className="data-table">
            <caption className="visually-hidden">Example journeys</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Purpose</th>
                <th scope="col">Vehicle</th>
                <th scope="col">Business miles</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-label="Date">9 Sep 2025</td>
                <td data-label="Purpose">Visit to a client (fake)</td>
                <td data-label="Vehicle">Car</td>
                <td data-label="Business miles">24</td>
                <td data-label="Status">
                  <span className="chip chip-warn">Needs review</span>
                </td>
              </tr>
            </tbody>
          </table>
          <p className="hint">Mileage values are not worked out in this preview (phase P5).</p>
        </SyntheticDemo>
      </section>
    </div>
  );
}
