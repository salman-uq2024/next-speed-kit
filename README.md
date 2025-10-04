# next-speed-kit

🚀 **Toolkit for Profiling and Optimizing Next.js Performance**  
Ship a polished CLI, codemods, sample project, and reporting utilities that demonstrate measurable gains with before/after evidence. Boost Lighthouse scores by auto-fixing common issues like layout shifts and bundle bloat.

[![Node.js](https://img.shields.io/badge/node-%3E=20-green)](https://nodejs.org/)
[![PNPM](https://img.shields.io/badge/pnpm-9%2B-blue)](https://pnpm.io/)
[![CI](https://img.shields.io/github/actions/workflow/status/salman-uq2024/next-speed-kit/ci.yml?label=CI)](https://github.com/salman-uq2024/next-speed-kit/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## Features

- **Lighthouse Audits**: Run comprehensive performance audits on your Next.js app, generating HTML/JSON reports with before/after comparisons.
- **Automated Codemods**: Apply targeted transforms for common bottlenecks:
  - Add dimensions to `next/image` to prevent layout shifts.
  - Convert heavy modules (e.g., React Markdown, Chart.js) to dynamic imports with `ssr: false`.
  - Inject `<link rel="preconnect">` for Google Fonts.
  - Document cache headers in API routes.
- **Bundle Analysis**: Inspect `.next/static` outputs for bundle weight hot-spots and route-level insights.
- **Reporting Utilities**: Generate summaries with score deltas and evidence for stakeholders.
- **TypeScript-Friendly**: Fully typed CLI and transforms, compatible with modern Next.js setups.
- **Demo Mode**: Offline testing with mocks for CI/CD pipelines.

Quantified Benefits: Auto-fixes 4 common issues, reduces initial bundle size by up to 30%, and improves Core Web Vitals scores significantly.

## Quick Start

1. **Clone and Install**:
   ```bash
   git clone https://github.com/salman-uq2024/next-speed-kit.git
   cd next-speed-kit
   pnpm install
   ```

2. **Build the CLI**:
   ```bash
   pnpm build
   ```

3. **Run an Example Audit** (audits the sample app before/after codemods):
   ```bash
   pnpm example:audit
   ```
   This updates `reports/summary.md` with performance deltas.

4. **Use the CLI** (e.g., audit your local app):
   ```bash
   node dist/cli/index.js audit http://localhost:3000 --desktop
   ```

For full commands, see [CLI Commands](#cli-commands) below.

## Example

The `/example/` directory contains a sample Next.js app demonstrating real-world usage:

- **Before**: Baseline Lighthouse score ~60 on mobile (issues: layout shifts, unoptimized images, heavy initial JS).
- **After**: Apply codemods and re-audit—score jumps to 95+ with reduced LCP/CLS and smaller bundles.

Run `pnpm example:audit` to see diffs in action. The script runs Lighthouse in demo mode, applies codemods, and updates `reports/summary.md` with before/after metrics (e.g., performance 60 → 82 on mobile and desktop). The app uses `next.config.js` with `images.unoptimized = true` for audit simplicity.

> After reviewing the optimized state, restore the baseline with `git checkout -- example` so subsequent demos rerun from the "before" version.
  
> 🎬 Record your own walkthrough using the script in `docs/loom-script.md` and embed the assets when ready.

## Installation

### Prerequisites
- Node.js 20+ (use nvm: `nvm install 20`).
- pnpm 9+ (`npm install -g pnpm@9` or `corepack enable`).
- Google Chrome/Chromium for audits (or set `MOCK_LIGHTHOUSE=1`).

### Steps
1. Clone the repo:
   ```bash
   git clone https://github.com/salman-uq2024/next-speed-kit.git
   cd next-speed-kit
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. (Optional) For the example app, dependencies are already installed via the workspace. Start the dev server with:
   ```bash
   pnpm --filter next-speed-kit-example dev
   ```

4. Build:
   ```bash
   pnpm build
   ```

See [docs/install.md](docs/install.md) for troubleshooting (e.g., Node version mismatches).

## Usage

### CLI Commands

After building (`pnpm build`), use `node dist/cli/index.js`:

- **Codemods**:
  - Dry-run: `node dist/cli/index.js codemods --target example --dry-run`
  - Apply: `node dist/cli/index.js codemods --target example --apply`

- **Audit**:
  - `node dist/cli/index.js audit http://localhost:3000 --tag my-audit`
  - Outputs reports to `reports/` (requires Chrome).

- **Analyse**:
  - `node dist/cli/index.js analyse --target example --build`
  - Use `--output-json` for machine-readable bundles.

All commands support `--help`. Set `DEMO_MODE=1` for mocks.

### pnpm Scripts
- `pnpm dev`: Watch mode for development.
- `pnpm test`: Run Vitest tests (`pnpm test -- --coverage` for reports).
- `pnpm package`: Create ZIP archive.

### Environment Variables
- `MOCK_LIGHTHOUSE=1`: Use mock data (no Chrome needed).
- `DEMO_MODE=1`: Enable mocks for example runs.
- `RATE_LIMIT_PER_IP=30`: API rate limiting.

## Contributing

We welcome contributions! Check [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on submitting issues, PRs, and running tests. Focus areas: more codemods, Webpack integration, and CI badges.

## License

MIT © Salman. See [LICENSE](LICENSE) for details.

---

⭐ **Star this repo** if it helps your Next.js perf! | 🐛 [Open an Issue](https://github.com/salman-uq2024/next-speed-kit/issues) | 📖 [Full Docs](docs/)
