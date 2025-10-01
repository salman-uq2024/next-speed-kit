# Operational guide

## Safe usage on real repositories

1. **Work on a clean branch.** Commit or stash pending work before running codemods so you can review the generated diff easily.
2. **Start with dry-runs.**
   ```bash
   node dist/cli/index.js codemods --target /path/to/app --dry-run
   ```
   Review the file list before enabling `--apply`.
3. **Apply codemods selectively.**
   - Use `--transform` to target a single mod (e.g. `next-image-dimensions`).
   - Re-run the same codemod as often as needed; they are idempotent on the affected snippets.
4. **Run bundle analysis after each build.**
   ```bash
   node dist/cli/index.js analyse --target /path/to/app --build
   ```
   Add `--output-json reports/bundle-{timestamp}.json` to archive the snapshot.
5. **Automate audits.**
   - Deploy your app locally or to a staging URL.
   - Run `audit` with an explicit `--tag` so each run is traceable:
     ```bash
     node dist/cli/index.js audit https://staging.example.com --desktop --tag staged-release
     ```
   - Store the generated JSON/HTML artifacts under version control or your preferred evidence store.
6. **Update the summary.** If you rely on the provided summary helper, pass your tags to `updateSummaryMarkdown` (see `src/reporting/summary.ts`) or reuse the `example:audit` script as a reference implementation.

## Chrome / Lighthouse tips

- Install Chrome/Chromium on the machine executing `audit`. The CLI launches it headlessly via `chrome-launcher`.
- Inside CI or containers, install `chromium` (apt) or use `google-chrome --headless`. If the binary lives in a non-standard path, set `CHROME_PATH`.
- If Chrome is unavailable, the CLI writes stub reports capturing the error so downstream automation can surface the problem.

## Rolling back codemods

- Because codemods only touch tracked files and are idempotent, a simple `git checkout -- <file>` reverts an individual change.
- To revert everything, run `git reset --hard` or drop the branch. Always inspect the diff before committing.

## Continuous integration

- Use the supplied GitHub Actions workflow (`.github/workflows/ci.yml`) as a template.
- Typical CI pipeline:
  1. `pnpm install`
  2. `pnpm test`
  3. `pnpm package` (optional artifact upload)

## Extending the toolkit

- Add new codemods under `src/codemods/transforms/` and register them in `src/codemods/index.ts`.
- Bundle analysis currently scans emitted assets; plug in Webpack stats or Lighthouse JSON if you need deeper coverage.
- For environment-specific audits (mobile vs. desktop, throttling, etc.) adjust the options passed to `runLighthouseAudit` in `src/audit/lighthouse.ts`.

## Releasing

To release a new version:

1. Bump the version using pnpm:
   ```bash
   pnpm version patch  # or minor, major
   ```

2. Create and push a git tag:
   ```bash
   git tag vX.Y.Z
   git push origin main
   git push origin --tags
   ```

This triggers CI to build, test, and package the release.

## Packaging

The `pnpm package` script creates a deterministic ZIP archive at `dist/next-speed-kit-YYYY-MM-DD.zip`:

- Uses UTC date for the filename.
- Ensures stable file order for reproducible archives.
- Includes sources, docs, and the compiled CLI (`dist/`).

Run it manually or in CI for distribution.

## Report Artifacts

- **CI Uploads**: The ZIP from `pnpm package` is uploaded as a release artifact in CI workflows.
- **Lighthouse Reports**: Generated HTML/JSON files in `reports/` for audit evidence. Use `reports/summary.md` for aggregated score deltas and insights.

Store these in your evidence repository or artifact store for stakeholder reviews.

## Rotate Secrets

- No secrets are stored in the repo (e.g., avoid committing API keys).
- If using a private `API_BASE`:
  1. Update the environment variable in your deployment platform (e.g., Vercel env vars).
  2. Redeploy the application.
- For local development, use a `.env.local` file (gitignored) and load via `process.env`.
- In CI, inject secrets via platform-specific mechanisms (e.g., GitHub Secrets).