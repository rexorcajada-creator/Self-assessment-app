/** Small label for a control that is not built yet. */
export function PhaseTag({ phase }: { readonly phase: string }) {
  return <span className="phase-tag">Coming in {phase}</span>;
}
