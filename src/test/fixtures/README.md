# Synthetic test fixtures only

Everything in this folder must be **fabricated**. Never put real P60s, P45s,
bank exports, receipts, screenshots or any real person's details here.

- Use obviously fake names (e.g. "Example Employer Ltd", "Test Person").
- Use fake references (e.g. PAYE ref `000/XX00000`, NI number `QQ123456C`).
- Prefix fixture file names with `synthetic-`.

This folder is the only place under `src/` where `.gitignore` allows CSV, PDF
and image files, so anything added here will be committed and pushed.
