import { useDraft } from '../../app/draftContext.ts';
import { stepHref } from '../../app/router.ts';
import { RadioGroup } from '../../components/RadioGroup.tsx';
import { screeningFlags } from '../screening/flags.ts';
import { JURISDICTIONS, SCREENING_QUESTIONS, YES_NO } from '../screening/questions.ts';

const JOB_COUNTS = ['1', '2', '3', '4', '5'] as const;

export function SetupContent() {
  const { state, store } = useDraft();
  const setup = state.draft?.setup;
  if (!setup) return null;
  const flags = screeningFlags(setup);
  const jurisdiction = JURISDICTIONS.find((j) => j.id === setup.jurisdiction);

  return (
    <form
      className="stack"
      aria-label="Quick setup"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <p className="hint">
        About a minute. Answers are saved in this browser as you go (not encrypted). You can change
        them later.
      </p>

      <div className="card">
        <RadioGroup
          legend="Where did you live for tax purposes in 2025–26?"
          name="jurisdiction"
          options={JURISDICTIONS.map((j) => ({ value: j.id, label: j.label }))}
          value={setup.jurisdiction}
          onChange={(value) => {
            store.updateSetup({ jurisdiction: value });
          }}
        />
        {jurisdiction && !jurisdiction.supported && (
          <p className="inline-warning">
            {jurisdiction.label} is not supported yet. You can carry on, but any estimate will be
            labelled provisional.
          </p>
        )}
      </div>

      <div className="card">
        <RadioGroup
          legend="Did you have a job taxed through PAYE?"
          hint="For example, if you received a P60 or P45."
          name="employment"
          inline
          options={YES_NO}
          value={setup.employment}
          onChange={(value) => {
            store.updateSetup({ employment: value, jobCount: value === 'yes' ? setup.jobCount : null });
          }}
        />
        {setup.employment === 'yes' && (
          <div className="field">
            <label htmlFor="job-count">How many PAYE jobs did you have in 2025–26?</label>
            <select
              id="job-count"
              value={setup.jobCount === null ? '' : String(setup.jobCount)}
              onChange={(event) => {
                const n = Number.parseInt(event.target.value, 10);
                store.updateSetup({ jobCount: Number.isInteger(n) ? n : null });
              }}
            >
              <option value="">Choose…</option>
              {JOB_COUNTS.map((n) => (
                <option key={n} value={n}>
                  {n === '5' ? '5 or more' : n}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="card">
        <RadioGroup
          legend="Were you self-employed as a sole trader?"
          hint="Including side income, such as freelance or gig work."
          name="self-employment"
          inline
          options={YES_NO}
          value={setup.selfEmployment}
          onChange={(value) => {
            store.updateSetup({ selfEmployment: value });
          }}
        />
        {setup.selfEmployment === 'yes' && (
          <p className="hint">
            We'll assume the cash basis, which is the usual default. You can confirm this later.
          </p>
        )}
      </div>

      <div className="card">
        <RadioGroup
          legend="Did HMRC ask you to send a 2025–26 tax return?"
          name="hmrc-asked"
          inline
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'not-sure', label: 'Not sure' },
          ]}
          value={setup.hmrcAsked}
          onChange={(value) => {
            store.updateSetup({ hmrcAsked: value });
          }}
        />
      </div>

      <div className="card">
        <h3 className="card-heading">In 2025–26, did any of these apply to you?</h3>
        <p className="hint">
          A “Yes” does not stop you. It is recorded so the estimate is clearly labelled as provisional,
          instead of being silently left out.
        </p>
        <div className="yes-no-list">
          {SCREENING_QUESTIONS.map((question) => (
            <RadioGroup
              key={question.id}
              legend={question.label}
              name={`screening-${question.id}`}
              inline
              options={YES_NO}
              value={setup.screening[question.id] ?? null}
              onChange={(value) => {
                store.setScreening(question.id, value);
              }}
            />
          ))}
        </div>
      </div>

      <div className="card summary-card" aria-live="polite">
        <h3 className="card-heading">Flagged so far</h3>
        {flags.length === 0 ? (
          <p>Nothing flagged so far.</p>
        ) : (
          <>
            <p>
              {flags.length === 1 ? '1 thing' : `${String(flags.length)} things`} will be flagged as not
              supported yet:
            </p>
            <ul>
              {flags.map((flag) => (
                <li key={flag.id}>{flag.text}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <p>
        <a href={stepHref('upload')}>Skip for now and go to document upload</a>
        <span className="hint"> (unanswered questions will be listed under Final questions)</span>
      </p>
    </form>
  );
}
