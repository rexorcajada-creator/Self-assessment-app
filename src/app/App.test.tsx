import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderApp, resetBrowserState } from '../test/renderApp.tsx';
import { STORAGE_KEY } from './draftStore.ts';
import { JOURNEY_STEPS, STEP_IDS } from './steps.ts';

function pageHeading() {
  return screen.getByRole('heading', { level: 2, name: (_n, el) => el.id === 'page-heading' });
}

async function expectStep(title: string, number: number) {
  await waitFor(() => {
    expect(pageHeading()).toHaveTextContent(title);
  });
  expect(screen.getByText(`Step ${String(number)} of 9`, { selector: '.step-count' })).toBeInTheDocument();
}

async function startReturn(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Start my tax return' }));
  await expectStep('Quick setup and screening', 1);
}

beforeEach(() => {
  resetBrowserState();
});

describe('Welcome screen', () => {
  it('shows the app, the 2025–26 tax year and the main actions', () => {
    renderApp();
    expect(screen.getByRole('heading', { level: 1, name: 'Self Assessment Assistant' })).toBeInTheDocument();
    expect(screen.getByText('Tax year 2025–26')).toBeInTheDocument();
    expect(pageHeading()).toHaveTextContent('Prepare your 2025–26 tax return');
    expect(screen.getByRole('button', { name: 'Start my tax return' })).toHaveClass('btn-start');
    expect(screen.getByRole('button', { name: 'Resume return' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Restore backup' })).toHaveAttribute('href', '#/restore');
  });

  it('states the privacy position clearly', () => {
    renderApp();
    const privacy = screen.getByRole('region', { name: 'Your privacy and your data' });
    expect(privacy).toHaveTextContent('All real document processing will run locally on this device.');
    expect(privacy).toHaveTextContent('Your local working records will not be encrypted by this app.');
    expect(privacy).toHaveTextContent(/browser storage can be lost/i);
    expect(screen.getByRole('note', { name: 'Development preview' })).toHaveTextContent(/do not enter real/i);
  });

  it('never claims local storage is encrypted', () => {
    const { container } = renderApp();
    expect(container.textContent).not.toMatch(/(records|data|storage) (is|are) encrypted/i);
  });

  it('explains when there is nothing to resume', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: 'Resume return' }));
    expect(screen.getByText(/no return in progress on this device yet/i)).toBeInTheDocument();
    expect(window.location.hash).toBe('');
  });

  it('opens the Restore backup placeholder and comes back', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('link', { name: 'Restore backup' }));
    await waitFor(() => {
      expect(pageHeading()).toHaveTextContent('Restore a backup');
    });
    expect(screen.getByLabelText('Backup file')).toBeDisabled();
    expect(screen.getByText('Coming in P8')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Back to Welcome' }));
    await waitFor(() => {
      expect(pageHeading()).toHaveTextContent('Prepare your 2025–26 tax return');
    });
  });
});

describe('step navigation', () => {
  it('Start leads to quick setup, which leads to uploads', async () => {
    const user = userEvent.setup();
    renderApp();
    await startReturn(user);
    expect(window.location.hash).toBe('#/step/setup');
    await user.click(screen.getByRole('link', { name: 'Next: Upload documents' }));
    await expectStep('Upload documents', 2);
    expect(window.location.hash).toBe('#/step/upload');
  });

  it('quick setup can be skipped to go straight to uploads', async () => {
    const user = userEvent.setup();
    renderApp();
    await startReturn(user);
    await user.click(screen.getByRole('link', { name: /skip for now/i }));
    await expectStep('Upload documents', 2);
  });

  it('Next walks through all nine steps in order and Back walks home again', async () => {
    const user = userEvent.setup();
    renderApp();
    await startReturn(user);

    for (const step of JOURNEY_STEPS.slice(1)) {
      await user.click(screen.getByRole('link', { name: new RegExp(`^Next: ${step.title}`) }));
      await expectStep(step.title, step.number);
    }
    expect(screen.queryByRole('link', { name: /^Next/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Finish and return to Welcome' })).toBeInTheDocument();

    for (const step of [...JOURNEY_STEPS].reverse().slice(1)) {
      await user.click(screen.getByRole('link', { name: `Back: ${step.title}` }));
      await expectStep(step.title, step.number);
    }
    await user.click(screen.getByRole('link', { name: 'Back to Welcome' }));
    await waitFor(() => {
      expect(pageHeading()).toHaveTextContent('Prepare your 2025–26 tax return');
    });
  });

  it('moves focus to the new page heading and updates the page title', async () => {
    const user = userEvent.setup();
    renderApp();
    await startReturn(user);
    expect(pageHeading()).toHaveFocus();
    expect(document.title).toBe('Step 1 of 9: Quick setup and screening – Self Assessment Assistant 2025–26');
  });

  it('the stepper lists all nine steps, marks the current one and jumps to any step', async () => {
    const user = userEvent.setup();
    renderApp();
    await startReturn(user);
    const stepper = screen.getByRole('navigation', { name: 'Progress' });
    const links = within(stepper).getAllByRole('link');
    expect(links).toHaveLength(9);
    expect(links[0]).toHaveAttribute('aria-current', 'step');
    expect(links[0]).toHaveAccessibleName('Step 1: Quick setup and screening (current step)');
    expect(links[6]).toHaveAccessibleName('Step 7: Tax estimate (not visited yet)');

    await user.click(within(stepper).getByRole('link', { name: /Tax estimate/ }));
    await expectStep('Tax estimate', 7);
    const updated = within(screen.getByRole('navigation', { name: 'Progress' }));
    expect(updated.getByRole('link', { name: /Tax estimate/ })).toHaveAttribute('aria-current', 'step');
    expect(updated.getByRole('link', { name: /Quick setup/ })).toHaveAccessibleName('Step 1: Quick setup and screening (visited)');
  });

  it('Back does not lose answers', async () => {
    const user = userEvent.setup();
    renderApp();
    await startReturn(user);
    await user.click(screen.getByRole('radio', { name: 'Wales' }));
    const selfEmployed = screen.getByRole('group', { name: 'Were you self-employed as a sole trader?' });
    await user.click(within(selfEmployed).getByRole('radio', { name: 'Yes' }));

    await user.click(screen.getByRole('link', { name: /^Next/ }));
    await expectStep('Upload documents', 2);
    await user.click(screen.getByRole('link', { name: /^Back/ }));
    await expectStep('Quick setup and screening', 1);

    expect(screen.getByRole('radio', { name: 'Wales' })).toBeChecked();
    expect(
      within(screen.getByRole('group', { name: 'Were you self-employed as a sole trader?' })).getByRole('radio', { name: 'Yes' }),
    ).toBeChecked();
  });

  it('shows a not-found page for an unknown address', async () => {
    window.history.replaceState(null, '', '/#/step/nonsense');
    renderApp();
    expect(pageHeading()).toHaveTextContent('Page not found');
    expect(screen.getByRole('alert')).toHaveTextContent('We could not find that page');
    await userEvent.setup().click(screen.getByRole('link', { name: 'Go to Welcome' }));
    await waitFor(() => {
      expect(pageHeading()).toHaveTextContent('Prepare your 2025–26 tax return');
    });
  });

  it('a step link without a started return offers to start one', async () => {
    window.history.replaceState(null, '', '/#/step/expenses');
    const user = userEvent.setup();
    renderApp();
    expect(screen.getByText('You have not started a return on this device')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Start my tax return' }));
    await expectStep('Expenses and journeys', 5);
  });
});

describe('refresh and resume', () => {
  it('a page refresh keeps the current step, visited steps and answers', async () => {
    const user = userEvent.setup();
    const first = renderApp();
    await startReturn(user);
    await user.click(screen.getByRole('radio', { name: 'Northern Ireland' }));
    await user.click(screen.getByRole('link', { name: /^Next/ }));
    await expectStep('Upload documents', 2);
    await user.click(screen.getByRole('link', { name: /^Next/ }));
    await expectStep('Check extracted figures', 3);

    // Simulated refresh: unmount, then boot a fresh store from the same storage and URL.
    first.unmount();
    renderApp();
    await expectStep('Check extracted figures', 3);
    const stepper = within(screen.getByRole('navigation', { name: 'Progress' }));
    expect(stepper.getByRole('link', { name: /Upload documents/ })).toHaveAccessibleName('Step 2: Upload documents (visited)');

    await user.click(stepper.getByRole('link', { name: /Quick setup/ }));
    await expectStep('Quick setup and screening', 1);
    expect(screen.getByRole('radio', { name: 'Northern Ireland' })).toBeChecked();
  });

  it('Resume returns to the last step after a refresh on the Welcome screen', async () => {
    const user = userEvent.setup();
    const first = renderApp();
    await startReturn(user);
    await user.click(within(screen.getByRole('navigation', { name: 'Progress' })).getByRole('link', { name: /Bank transactions/ }));
    await expectStep('Bank transactions', 4);

    first.unmount();
    window.history.replaceState(null, '', '/');
    renderApp();
    expect(screen.getByText(/last seen at step 4: Bank transactions/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Resume return' }));
    await expectStep('Bank transactions', 4);
  });

  it('Start with a return in progress asks before clearing it', async () => {
    const user = userEvent.setup();
    renderApp();
    await startReturn(user);
    await user.click(screen.getByRole('radio', { name: 'England' }));
    await user.click(screen.getByRole('link', { name: 'Back to Welcome' }));
    await waitFor(() => {
      expect(pageHeading()).toHaveTextContent('Prepare your 2025–26 tax return');
    });

    await user.click(screen.getByRole('button', { name: 'Start my tax return' }));
    expect(screen.getByRole('heading', { name: 'Start again?' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'No, keep my return' }));
    expect(screen.queryByRole('heading', { name: 'Start again?' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start my tax return' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Start my tax return' }));
    await user.click(screen.getByRole('button', { name: 'Yes, start again' }));
    await expectStep('Quick setup and screening', 1);
    expect(screen.getByRole('radio', { name: 'England' })).not.toBeChecked();
  });

  it('warns when the browser blocks storage', () => {
    renderApp(null);
    expect(screen.getByRole('alert')).toHaveTextContent(/not letting the app save your progress/i);
  });

  it('recovers from unreadable saved progress with a notice', () => {
    window.localStorage.setItem(STORAGE_KEY, '{"version":1,"broken');
    renderApp();
    expect(screen.getByRole('alert')).toHaveTextContent(/could not be read, so it was cleared/i);
    expect(screen.getByText('Not started')).toBeInTheDocument();
  });

  it('deletes this device’s progress from the Back up screen', async () => {
    const user = userEvent.setup();
    renderApp();
    await startReturn(user);
    await user.click(within(screen.getByRole('navigation', { name: 'Progress' })).getByRole('link', { name: /Back up and finish/ }));
    await expectStep('Back up and finish', 9);

    await user.click(screen.getByRole('button', { name: 'Delete this device’s progress' }));
    expect(screen.getByRole('button', { name: 'Yes, delete it' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Yes, delete it' }));
    await waitFor(() => {
      expect(pageHeading()).toHaveTextContent('Prepare your 2025–26 tax return');
    });
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(screen.getByText('Not started')).toBeInTheDocument();
  });
});

describe('loading, empty and error states', () => {
  it.each(JOURNEY_STEPS.map((s) => [s.title, s.id] as const))('%s has previewable loading, empty and error states', async (_title, id) => {
    window.history.replaceState(null, '', `/#/step/${id}`);
    const user = userEvent.setup();
    renderApp(window.localStorage, { started: true });

    await user.click(await screen.findByText('Preview screen states (design check)'));
    await user.click(screen.getByRole('radio', { name: 'Loading' }));
    expect(screen.getByRole('status')).toHaveTextContent(/…/);

    await user.click(screen.getByRole('radio', { name: 'Empty' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(document.querySelector('.state-empty')).not.toBeNull();

    await user.click(screen.getByRole('radio', { name: 'Error' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Normal' })).toBeChecked();
  });
});

describe('keyboard support', () => {
  it('Start, Next and the stepper all work from the keyboard', async () => {
    const user = userEvent.setup();
    renderApp();
    // Skip link first, then the header link, then into main content.
    await user.tab();
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveFocus();
    screen.getByRole('button', { name: 'Start my tax return' }).focus();
    await user.keyboard('{Enter}');
    await expectStep('Quick setup and screening', 1);

    screen.getByRole('link', { name: /^Next/ }).focus();
    await user.keyboard('{Enter}');
    await expectStep('Upload documents', 2);
  });

  it('the phone "All steps" menu toggles and closes with Escape', async () => {
    const user = userEvent.setup();
    renderApp();
    await startReturn(user);
    const toggle = screen.getByRole('button', { name: 'All steps' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Hide steps' })).toHaveAttribute('aria-expanded', 'true');

    within(screen.getByRole('navigation', { name: 'Progress' })).getAllByRole('link')[2]?.focus();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'All steps' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'All steps' })).toHaveFocus();
  });
});

describe('screening flags flow through to Final questions', () => {
  it('an unsupported answer is recorded and makes the estimate provisional', async () => {
    const user = userEvent.setup();
    renderApp();
    await startReturn(user);
    await user.click(screen.getByRole('radio', { name: 'Scotland' }));
    expect(screen.getByText(/Scotland is not supported yet/)).toBeInTheDocument();
    const studentLoan = screen.getByRole('group', { name: 'Student loan or postgraduate loan repayments' });
    await user.click(within(studentLoan).getByRole('radio', { name: 'Yes' }));
    expect(screen.getByText('2 things will be flagged as not supported yet:')).toBeInTheDocument();

    await user.click(within(screen.getByRole('navigation', { name: 'Progress' })).getByRole('link', { name: /Final questions/ }));
    await expectStep('Final questions', 6);
    const unresolved = screen.getByRole('region', { name: 'Things to resolve' });
    expect(unresolved).toHaveTextContent(/Scottish Income Tax rates are not supported yet/);
    expect(unresolved).toHaveTextContent(/Student loan .*: not supported yet/);
    expect(unresolved).toHaveTextContent('PROVISIONAL — NOT FILING-READY');
  });
});

describe('SYNTHETIC DEMO labelling', () => {
  /** Every visible money amount must be a tagged demo amount inside a demo frame. */
  function untaggedAmounts(root: HTMLElement): string[] {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const offenders: string[] = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent ?? '';
      if (!/£\s?\d/.test(text)) continue;
      const parent = node.parentElement;
      if (!parent?.closest('[data-demo-amount]')?.closest('[data-synthetic-demo]')) offenders.push(text);
    }
    return offenders;
  }

  it.each(STEP_IDS)('step %s shows no untagged money amounts', (id) => {
    window.history.replaceState(null, '', `/#/step/${id}`);
    const { container } = renderApp(window.localStorage, { started: true });
    const step = JOURNEY_STEPS.find((s) => s.id === id);
    expect(pageHeading()).toHaveTextContent(step?.title ?? 'missing');
    expect(untaggedAmounts(container)).toEqual([]);
    for (const amount of container.querySelectorAll('[data-demo-amount]')) {
      expect(amount).toHaveTextContent(/^DEMO [+−]?£\d/);
    }
  });

  it('Welcome shows no money amounts at all', () => {
    const { container } = renderApp();
    expect(container.textContent).not.toMatch(/£\s?\d/);
  });

  it('the tax estimate is conspicuously labelled and shows each figure separately', () => {
    window.history.replaceState(null, '', '/#/step/estimate');
    renderApp(window.localStorage, { started: true });
    expect(screen.getByRole('note', { name: 'Synthetic demo warning' })).toHaveTextContent('SYNTHETIC DEMO — NOT A TAX CALCULATION');
    const demo = screen.getByRole('region', { name: 'SYNTHETIC DEMO: Tax estimate dashboard' });
    for (const label of [
      '2025–26 total tax liability',
      'PAYE tax already deducted',
      'Estimated 2025–26 balancing payment',
      '2025–26 payments on account already made',
      'First 2026–27 payment on account',
      'Second 2026–27 payment on account',
      'Expected to pay by 31 January 2027',
      'Expected to pay by 31 July 2027',
    ]) {
      expect(within(demo).getByText(label, { selector: '.figure-label' })).toBeInTheDocument();
    }
    expect(within(demo).getByText('PROVISIONAL — NOT FILING-READY')).toBeInTheDocument();
  });
});
