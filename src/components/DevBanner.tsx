/** Conspicuous notice that this build is a development preview. */
export function DevBanner() {
  return (
    <div className="dev-banner" role="note" aria-label="Development preview">
      <strong>Development preview (P1).</strong> These screens are layouts only. Nothing is uploaded,
      read or calculated yet, and every money amount shown is SYNTHETIC DEMO data. Do not enter real
      personal or financial information.
    </div>
  );
}
