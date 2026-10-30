import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App.tsx';
import { JOURNEY_STEPS } from './steps.ts';

describe('App shell (P0 placeholder)', () => {
  it('shows the app name and the 2025–26 tax year', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Self Assessment Assistant' })).toBeInTheDocument();
    expect(screen.getByText('Tax year 2025–26')).toBeInTheDocument();
  });

  it('warns that this is a scaffold and real data must not be entered', () => {
    render(<App />);
    expect(screen.getByRole('note')).toHaveTextContent(/do not enter real personal or financial information/i);
  });

  it('lists all ten journey screens in order', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Return steps' });
    const buttons = within(nav).getAllByRole('button');
    expect(buttons).toHaveLength(10);
    expect(buttons.map((b) => b.textContent)).toEqual(JOURNEY_STEPS.map((s) => `${String(s.number)}${s.title}`));
  });

  it('starts on Welcome and moves to a step when it is chosen', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Welcome');

    await user.click(screen.getByRole('button', { name: /upload documents/i }));

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Upload documents');
    expect(screen.getByRole('button', { name: /upload documents/i })).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('button', { name: /welcome/i })).not.toHaveAttribute('aria-current');
  });

  it('can be navigated with the keyboard', async () => {
    const user = userEvent.setup();
    render(<App />);
    const tax = screen.getByRole('button', { name: /tax estimate/i });
    tax.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Tax estimate');
  });

  it('shows no money amounts anywhere in the scaffold', () => {
    const { container } = render(<App />);
    expect(container.textContent).not.toMatch(/£\s?\d/);
  });
});
