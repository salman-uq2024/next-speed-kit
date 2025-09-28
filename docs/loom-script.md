# Loom script (≈60 seconds)

1. **Intro (5s)** – "This is next-speed-kit, a CLI that cleans up Next.js performance hotspots and documents the gains."
2. **Show help (10s)** – Run `node dist/cli/index.js --help`, highlight the `codemods`, `audit`, and `analyse` commands.
3. **Codemod dry-run (10s)** – `node dist/cli/index.js codemods --target example --dry-run` and point out the suggested changes (Image dimensions, dynamic imports, font preconnect).
4. **Bundle analysis (10s)** – `node dist/cli/index.js analyse --target example` and call out the largest chunks detected.
5. **Audit results (15s)** – Mention `pnpm example:audit`, show the generated `reports/summary.md` with before/after scores, and scroll through one of the Lighthouse HTML reports.
6. **Wrap-up (10s)** – Summarize typical improvements (layout shift fixes, dynamic imports, evidence trail) and mention `docs/ops.md` for rollout guidance.
