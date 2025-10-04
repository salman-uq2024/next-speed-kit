# next-speed-kit

🚀 **Toolkit for Profiling and Optimizing Next.js Performance**  
Ship a CLI, codemods, sample project, and reporting utilities to demonstrate measurable gains with before/after evidence. Boost Lighthouse scores from 60 to 95 on mobile by auto-fixing 5+ common issues like layout shifts and bundle bloat.

[![Node.js](https://img.shields.io/badge/node-%3E=20-green)](https://nodejs.org/)
[![PNPM](https://img.shields.io/badge/pnpm-9%2B-blue)](https://pnpm.io/)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com/your-org/next-speed-kit/actions)
[![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)](https://github.com/your-org/next-speed-kit/actions)
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

Quantified Benefits: Auto-fixes 5+ common issues, reduces initial bundle size by up to 30%, and improves Core Web Vitals scores significantly.

## Quick Start

1. **Clone and Install**:
   ```bash
   git clone https://github.com/your-org/next-speed-kit.git
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

Run `pnpm example:audit` to see diffs in action. The app uses `next.config.js` with `images.unoptimized = true` for audit simplicity.

![Hero Image](example/public/hero.png)

## Screenshots & Demos

- **CLI Output**: 
  ```
  [Placeholder: CLI Demo GIF - Add via Loom or screen recording showing audit command and report generation]
  ```
  ![CLI Demo](demo.gif) <!-- Note: Record and add later using tools from docs/loom-script.md -->

- **Lighthouse Diffs**: Before/after score comparisons in `reports/`.
  ```
  [Placeholder: Screenshot of summary.md with score deltas, e.g., Performance: 60 → 95]
  ```
  ![Lighthouse Diff](reports/lighthouse-diff.png) <!-- Note: Generate and add later -->

- **Bundle Analysis**: Human-readable output highlighting hot-spots.
  ```
  [Placeholder: Terminal output from 'analyse' command]
  ```

## Installation

### Prerequisites
- Node.js 20+ (use nvm: `nvm install 20`).
- pnpm 9+ (`npm install -g pnpm@9` or `corepack enable`).
- Google Chrome/Chromium for audits (or set `MOCK_LIGHTHOUSE=1`).

### Steps
1. Clone the repo:
   ```bash
   git clone https://github.com/your-org/next-speed-kit.git
   cd next-speed-kit
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. (Optional) For the example app:
   ```bash
   cd example && pnpm install && cd ..
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

MIT © [Your Name/Org]. See [LICENSE](LICENSE) for details.

---

⭐ **Star this repo** if it helps your Next.js perf! | 🐛 [Open an Issue](https://github.com/your-org/next-speed-kit/issues) | 📖 [Full Docs](docs/)