import { useDraft } from '../../app/draftContext.ts';
import { stepHref } from '../../app/router.ts';
import { PhaseTag } from '../../components/PhaseTag.tsx';
import { EmptyState } from '../../components/StateViews.tsx';
import { screeningFlags, unansweredCount } from './flags.ts';
import { CONFIRMATIONS } from './questions.ts';

export function FinalQuestionsContent() {
  const { state, store } = useDraft();
  const draft = state.draft;
  if (!draft) return null;
  const flags = screeningFlags(draft.setup);
  const unanswered = unansweredCount(draft.setup);

  return (
    <div className="stack">
      <section className="card" aria-labelledby="unresolved-heading">
        <h3 id="unresolved-heading" className="card-heading">
          Things to resolve
        </h3>
        {flags.length === 0 && unanswered === 0 ? (
          <p>Nothing flagged from your quick setup.</p>
        ) : (
          <ul className="issue-list">
            {unanswered > 0 && (
              <li>
                Quick setup has {unanswered === 1 ? '1 unanswered question' : `${String(unanswered)} unanswered questions`}.{' '}
                <a href={stepHref('setup')}>Finish quick setup</a>
              </li>
            )}
            {flags.map((flag) => (
              <li key={flag.id}>{flag.text}</li>
            ))}
          </ul>
        )}
        {flags.length > 0 && (
          <p className="provisional-note">
            Because of this, any estimate will be labelled <strong>PROVISIONAL — NOT FILING-READY</strong>.
          </p>
        )}
      </section>

      <fieldset className="card checkbox-group">
        <legend className="card-heading">Please confirm</legend>
        {CONFIRMATIONS.map((item) => (
          <label key={item.id} className="checkbox-option">
            <input
              type="checkbox"
              checked={draft.confirmations[item.id] ?? false}
              onChange={(event) => {
                store.setConfirmation(item.id, event.target.checked);
              }}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </fieldset>

      <section className="card stack" aria-labelledby="payments-heading">
        <h3 id="payments-heading" className="card-heading">
          Payments already made to HMRC for 2025–26
        </h3>
        <p className="hint">
          For example, payments on account made in January and July 2026. Enter only payments you can
          see in your HMRC online account; they are never guessed from bank transfers.
        </p>
        <EmptyState title="No payments recorded">
          <p>If you have not made any, you can leave this empty.</p>
        </EmptyState>
        <div className="button-row">
          <button type="button" className="btn btn-secondary" disabled>
            Add a payment
          </button>
          <PhaseTag phase="P6" />
        </div>
      </section>
    </div>
  );
}
