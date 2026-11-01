import type { ReactNode } from 'react';

/**
 * Frame around any example content that contains made-up figures.
 * Every money amount in P1 must be inside one of these AND rendered with
 * <DemoAmount> (enforced by tests).
 */
export function SyntheticDemo({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return (
    <section className="synthetic-demo" data-synthetic-demo="" aria-label={`SYNTHETIC DEMO: ${title}`}>
      <div className="synthetic-demo-header">
        <span className="demo-flag">SYNTHETIC DEMO</span>
        <span className="synthetic-demo-title">{title}</span>
      </div>
      <p className="synthetic-demo-note">
        Made-up example to show the layout. Not your data and not a tax calculation.
      </p>
      {children}
    </section>
  );
}

/** A made-up money amount, visibly tagged so it cannot be mistaken for a result. */
export function DemoAmount({ value }: { readonly value: string }) {
  return (
    <span className="demo-amount" data-demo-amount="">
      <span className="demo-amount-tag">DEMO</span> {value}
    </span>
  );
}
