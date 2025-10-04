# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- [ ] Add support for additional codemods (e.g., script hydration optimization).
- [ ] Enhance audit reporting with visual dashboards.
- [ ] Integrate Webpack bundle analyzer for deeper insights.

## [1.0.0] - 2025-10-02

### Added
- CLI toolkit with core commands: `codemods`, `analyse`, and `audit`.
- 4 built-in codemods for common Next.js performance issues:
  - `next-image-width-height`: Ensures images have explicit width/height to prevent layout shifts.
  - `dynamic-imports-heavy`: Suggests dynamic imports for large bundles.
  - `font-preconnect`: Adds preconnect hints for faster font loading.
  - `cache-headers-guidance`: Recommends cache-control headers for static assets.
- Bundle analysis to identify largest chunks and optimization opportunities.
- Lighthouse integration for before/after performance audits (desktop/mobile).
- Example Next.js app demonstrating toolkit usage.
- Reporting system with Markdown summaries and HTML/JSON artifacts in `reports/`.
- pnpm workspace setup for efficient development and builds.
- Operational docs covering safe usage, CI integration, and extensions.

### Changed
- Cleanup: Removed unused dependencies to streamline the package.
- Updated build scripts for better reproducibility with `--frozen-lockfile`.
- Refined CLI output for clearer dry-run previews and error handling.

### Fixed
- Ensured idempotency in codemods to allow safe re-runs.
- Resolved Chrome path detection for headless audits in CI environments.

[1.0.0]: https://github.com/your-org/next-speed-kit/compare/v0.1.0...v1.0.0