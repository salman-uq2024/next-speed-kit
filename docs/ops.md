# Operational Guide

This guide covers best practices for using next-speed-kit in production environments, including safe codemod application, auditing, integration, and maintenance. It assumes you've completed the [Installation Guide](./install.md). The toolkit supports 4 codemods targeting common performance issues like layout shifts and bundle bloat.

For a quick demo overview, see the [Loom Script](./loom-script.md).

## Safe Usage on Real Repositories

To minimize risks when applying optimizations:

1. **Work on a Clean Branch**:
   - Always commit or stash any pending changes before running codemods. This allows easy review of diffs.
   - Example: `git checkout -b perf-optimizations`.

2. **Start with Dry-Runs**:
   - Preview changes without modifying files:
     ```bash
     node dist/cli/index.js codemods --target /path/to/your/app --dry-run
     ```
   - Review the output file list and suggested transforms before proceeding.

3. **Apply Codemods Selectively**:
   - Target specific transforms: `--transform next-image-dimensions` (one of the 4 available: image dimensions, dynamic imports, font preconnect, cache headers).
   - Codemods are idempotent—re-run them safely on the same files without side effects.

4. **Run Bundle Analysis Post-Build**:
   - Analyze after each optimization:
     ```bash
     node dist/cli/index.js analyse --target /path/to/your/app --build
     ```
   - Archive results: Add `--output-json reports/bundle-{timestamp}.json` for tracking improvements over time.

5. **Automate Audits**:
   - Deploy to a staging URL (see [Deployment Guide](./deploy.md)).
   - Run traceable audits:
     ```bash
     node dist/cli/index.js audit https://staging.example.com --desktop --tag staged-release
     ```
   - Store JSON/HTML outputs in version control or an artifact store for evidence.

6. **Update the Summary Report**:
   - Use the built-in helper: Pass tags to `updateSummaryMarkdown` in [src/reporting/summary.ts](https://github.com/salman-uq2024/next-speed-kit/blob/main/src/reporting/summary.ts).
   - Or reference the `example:audit` script for automation examples. This aggregates before/after Lighthouse scores.

## Chrome / Lighthouse Tips

Lighthouse audits require Chrome/Chromium:

- **Installation**: Ensure Chrome or Chromium is installed and accessible. On macOS: `brew install --cask google-chrome`. On Linux: `apt install chromium-browser`.
- **Headless Mode**: The CLI uses `chrome-launcher` for headless execution. Set `CHROME_PATH` if the binary is non-standard (e.g., `export CHROME_PATH=/usr/bin/chromium`).
- **CI/Containers**: Install `chromium` via your package manager. If unavailable, the CLI generates stub reports to flag issues in automation.
- **Throttling and Flags**: Customize via audit options in [src/audit/lighthouse.ts](https://github.com/salman-uq2024/next-speed-kit/blob/main/src/audit/lighthouse.ts), e.g., mobile vs. desktop emulation.

## Rolling Back Codemods

Reverting is straightforward since changes are file-based and tracked:

- **Individual Files**: Use Git to revert:
  ```bash
  git checkout -- path/to/file.tsx
  ```
- **Full Rollback**: Reset the branch:
  ```bash
  git reset --hard HEAD
  ```
  Or drop the branch entirely. Always review diffs with `git diff` before committing.

## Continuous Integration

Integrate next-speed-kit into your CI pipeline for automated perf checks. Use the template in `.github/workflows/ci.yml`.

**Typical Pipeline Steps**:

1. **Install Dependencies**:
   ```bash
   pnpm install --frozen-lockfile
   ```

2. **Run Tests**:
   ```bash
   pnpm test
   ```
   This covers unit tests for codemods, CLI, and reporting.

3. **Package (Optional)**:
   ```bash
   pnpm package
   ```
   Upload the ZIP artifact for distribution.

Add steps for `analyse` or `audit` on PRs to enforce performance gates.

## Extending the Toolkit

Customize for your needs:

- **New Codemods**: Add transforms in `src/codemods/transforms/` and register in [src/codemods/index.ts](https://github.com/salman-uq2024/next-speed-kit/blob/main/src/codemods/index.ts). Follow patterns like `next-image-dimensions`.
- **Bundle Analysis**: Enhance scanning of emitted assets; integrate Webpack stats for deeper insights.
- **Audit Customizations**: Modify `runLighthouseAudit` in [src/audit/lighthouse.ts](https://github.com/salman-uq2024/next-speed-kit/blob/main/src/audit/lighthouse.ts) for environment-specific options (e.g., throttling, device emulation).

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development setup.

## Releasing

To publish a new version:

1. **Bump Version**:
   ```bash
   pnpm version patch  # Use minor/major for larger changes
   ```

2. **Tag and Push**:
   ```bash
   git tag vX.Y.Z
   git push origin main
   git push origin --tags
   ```

This triggers CI builds, tests, and packaging. Update [CHANGELOG.md](../CHANGELOG.md) with details.

## Packaging

The `pnpm package` script generates a reproducible ZIP:

- Filename: `dist/next-speed-kit-YYYY-MM-DD.zip` (UTC date).
- Contents: Sources, docs, compiled CLI (`dist/`), and example app.
- Usage: Run manually or in CI for sharing binaries without npm.

## Report Artifacts

- **CI Uploads**: The package ZIP is attached to releases via GitHub Actions.
- **Lighthouse Reports**: HTML/JSON files in `reports/` provide audit evidence. Use `reports/summary.md` for score comparisons (e.g., "Performance improved by 25 points").
- **Storage**: Commit to your repo or use tools like GitHub Artifacts/S3 for stakeholder reviews.

## Rotate Secrets

next-speed-kit avoids storing secrets in the repo:

- **No Committed Keys**: Never commit API keys or tokens.
- **Private API_BASE**: Update in your deployment platform (e.g., Vercel env vars) and redeploy.
- **Local Development**: Use `.env.local` (gitignored) loaded via `process.env`.
- **CI Injection**: Use platform secrets (e.g., GitHub Secrets) for automated environments.

For issues, reference the [README.md](../README.md) or open a GitHub issue. This guide ensures safe, scalable use of the toolkit's features.
