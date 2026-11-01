# CERTIGO. — E2E tests

These tests drive the real app via Playwright. Run from the sandbox shell:

```bash
node tests/e2e/official-print-pdf.spec.mjs
```

The script restores the Supabase session from sandbox env vars
(`E2E_SUPABASE_*`), navigates to `/issued/$serial`, downloads the
Official Print PDF, asserts A4 landscape + serial + QR target, then reloads and
re-downloads to confirm the same stored certificate record is reused.

Output files (PDFs + screenshots) land in `/tmp/browser/certigo-pdf/`.