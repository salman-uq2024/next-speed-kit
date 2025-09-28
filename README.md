# next-speed-kit

Toolkit for profiling and improving Next.js apps. It ships a CLI, codemods, a sample project, and reporting utilities so you can demonstrate performance gains with before/after evidence.

## Quickstart

1. Install root dependencies (pnpm is recommended):
   ```bash
   pnpm install
   ```
2. (Optional) install example app deps:
   ```bash
   cd example && pnpm install
   ```
3. Build the toolkit and inspect the CLI help:
   ```bash
   pnpm build
   node dist/cli/index.js --help
   ```

## CLI commands

- `codemods [options]`
  - Lists or applies transforms that target common performance issues.
  - Example dry-run on the example app:
    ```bash
    node dist/cli/index.js codemods --target example --dry-run
    ```
  - Apply everything:
    ```bash
    node dist/cli/index.js codemods --target example --apply
    ```

- `audit <urls...> [options]`
  - Wraps Lighthouse, writes HTML/JSON reports to `reports/` (default) and prints the saved paths.
  - Example:
    ```bash
    node dist/cli/index.js audit http://localhost:3000 --desktop --tag my-check
    ```
  - Requires Chrome. If Lighthouse fails the command still produces stub reports explaining what to fix.

- `analyse [options]`
  - Looks at `.next/static` output and prints a human readable bundle summary.
  - Example (run after `next build`):
    ```bash
    node dist/cli/index.js analyse --target example --build
    ```
  - Use `--output-json reports/bundle-{timestamp}.json` to keep machine-readable data.

All commands accept `--help` for extra flags.

## Example workflow

1. Launch the sample project and collect a baseline:
   ```bash
   pnpm example:audit
   ```
   The script builds the CLI, runs Lighthouse against the example app before and after applying codemods, and refreshes `reports/summary.md` with score deltas.
2. Inspect bundle impact:
   ```bash
   node dist/cli/index.js analyse --target example
   ```
3. Iterate on your own project by pointing `--target` to its path.

## Tests

```bash
pnpm test
```
Vitest covers codemods, bundle analysis, summary rendering, and a smoke test for the CLI.

## Packaging

```bash
pnpm package
```
Creates `dist/next-speed-kit-<date>.zip` containing sources, docs, and the compiled CLI.

## Typical improvements

- Adds dimensions to `next/image` components to avoid layout shift.
- Converts common heavy modules (React Markdown, Chart.js, etc.) into `next/dynamic` imports with `ssr: false` to keep them out of the initial bundle.
- Injects useful `<link rel="preconnect">` hints for Google Fonts.
- Nudges API routes to document cache headers.
- Surfaces `.next` bundle weight hot-spots and saves Lighthouse evidence for stakeholders.

## Limitations & notes

- The audit command needs Chrome (stable or Chromium). Headless environments should provision Chrome or rerun with LHCI and point `audit` at stored results.
- The example app uses `next.config.js` with `images.unoptimized = true` so audits run without the Next image optimizer.
- Codemods strive to be idempotent but you should commit or stash changes before applying them on a real project.
- Bundle analysis currently inspects emitted `.js`/`.css` files; more granular route-level stats can be added via Webpack stats in future iterations.
