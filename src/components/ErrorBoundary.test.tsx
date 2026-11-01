import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary.tsx';

function Boom(): never {
  throw new Error('synthetic failure containing SECRET-DOC-TEXT');
}

describe('ErrorBoundary', () => {
  it('shows a friendly error without leaking the error message', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong on this screen');
    expect(screen.getByRole('button', { name: 'Reload the app' })).toBeInTheDocument();
    expect(document.body.textContent).not.toContain('SECRET-DOC-TEXT');
    const ownLogs = consoleError.mock.calls.filter((args) => String(args[0]).startsWith('A screen failed'));
    expect(ownLogs).toEqual([['A screen failed to display. Details are hidden to protect your data.']]);
  });
});
