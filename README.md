# next-speed-kit

Toolkit for profiling and improving Next.js apps. It ships a CLI, codemods, a sample project, and reporting utilities so you can demonstrate performance gains with before/after evidence.

## Quickstart

1. Install dependencies (pnpm is recommended):
   ```bash
   pnpm install
   ```

2. Start the development server (watches and rebuilds the CLI):
   ```bash
   pnpm dev
   ```

3. Run the example audit (builds the CLI, audits the example app with mocks in demo mode):
   ```bash
   pnpm example:audit
   ```

## Commands

The project uses pnpm scripts for common tasks:

- `build`: Compiles TypeScript sources to `dist/`.
  ```bash
  pnpm build
  ```

- `dev`: Starts a development watcher for the CLI (TypeScript compilation with hot reload).
  ```bash
  pnpm dev
  ```

- `test`: Runs Vitest unit tests for codemods, CLI, and reporting.
  ```bash
  pnpm test
  ```

- `example:audit`: Builds the CLI, runs Lighthouse audits on the example app (before/after codemods) using mocks in demo mode, and updates `reports/summary.md` with score deltas.
  ```bash
  pnpm example:audit
  ```

- `package`: Creates a deterministic ZIP archive (`dist/next-speed-kit-YYYY-MM-DD.zip`) containing sources, docs, and the compiled CLI (uses UTC date and stable file order).
  ```bash
  pnpm package
  ```

## CLI Commands

Once built (`pnpm build`), use the CLI for core functionality:

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

## Environment Variables

- `DEMO_MODE=1`: Enables mocks for rates and Lighthouse in the example app (useful for CI or offline testing).
- `RATE_LIMIT_PER_IP=30`: Sets the rate limit for API requests (default: 30 requests per IP).
- `MOCK_LIGHTHOUSE=1`: Uses mock Lighthouse data instead of running real audits (for testing or when Chrome is unavailable).
- `API_BASE`: Optional base URL for private API endpoints (defaults to public endpoints; set for custom setups).

## Testing

Run the test suite:
```bash
pnpm test
```

For coverage reports:
```bash
pnpm test -- --coverage
```

In CI environments, tests run headlessly. Ensure Chrome is available or use `MOCK_LIGHTHOUSE=1` for mock audits.

## Deployment

For deploying the example app (or similar Next.js projects), see [docs/deploy.md](docs/deploy.md) for a Vercel example.

## Example Workflow

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

## Typical Improvements

- Adds dimensions to `next/image` components to avoid layout shift.
- Converts common heavy modules (React Markdown, Chart.js, etc.) into `next/dynamic` imports with `ssr: false` to keep them out of the initial bundle.
- Injects useful `<link rel="preconnect">` hints for Google Fonts.
- Nudges API routes to document cache headers.
- Surfaces `.next` bundle weight hot-spots and saves Lighthouse evidence for stakeholders.

## Troubleshooting

- **Chrome not found**: Install Puppeteer (`pnpm add -D puppeteer`) or set `MOCK_LIGHTHOUSE=1` to use mock data.
- **Permissions issues**: Run commands as a non-root user to avoid file permission errors.
- **CI headless mode**: Set `PUPPETEER_EXECUTABLE_PATH` to your Chrome binary or use `MOCK_LIGHTHOUSE=1`.
- **Example build fails (tsconfig rootDir issue)**: If compilation errors occur in `example/` due to TypeScript path resolution, verify `tsconfig.json` includes and `rootDir` settings; adjust `baseUrl` or `paths` if needed for shared types.

## Limitations & Notes

- The audit command needs Chrome (stable or Chromium). Headless environments should provision Chrome or rerun with LHCI and point `audit` at stored results.
- The example app uses `next.config.js` with `images.unoptimized = true` so audits run without the Next image optimizer.
- Codemods strive to be idempotent but you should commit or stash changes before applying them on a real project.
- Bundle analysis currently inspects emitted `.js`/`.css` files; more granular route-level stats can be added via Webpack stats in future iterations.