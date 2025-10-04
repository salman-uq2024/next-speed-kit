# next-speed-kit Documentation

Welcome to the documentation for next-speed-kit, a CLI toolkit for optimizing Next.js application performance. This index provides an overview and links to key guides. The toolkit includes 4 codemods for common issues like image optimization and dynamic imports, plus bundle analysis and Lighthouse audits.

For a quick start, see the [README.md](../README.md). To contribute, refer to [CONTRIBUTING.md](../CONTRIBUTING.md).

## Getting Started

- **[Installation Guide](./install.md)**: Step-by-step setup, including Node.js, pnpm, and building the CLI. Covers prerequisites for beginners.
- **[Deployment Guide](./deploy.md)**: Deploy the example Next.js app to Vercel or other platforms, with environment variable configurations.

## Usage and Operations

- **[Operational Guide](./ops.md)**: Best practices for safe codemod application, audits, CI integration, and maintenance. Includes rollback tips and extending the toolkit.
- **[Loom Script](./loom-script.md)**: A 60-second video script for demoing the CLI features—ideal for tutorials or portfolio presentations.

## Development and Maintenance

- **[CONTRIBUTING.md](../CONTRIBUTING.md)**: Guidelines for setting up the dev environment, running tests, adding features, code style, and submitting pull requests.
- **[CHANGELOG.md](../CHANGELOG.md)**: Semantic versioning history, starting with v1.0.0 (initial release) and unreleased changes.

## Additional Resources

- **Example App**: Explore the bundled Next.js demo in the `example/` directory. Run `pnpm --filter ./example dev` after installation.
- **Reports**: Audit outputs in `reports/`, including `summary.md` for performance deltas.
- **GitHub Repository**: [your-org/next-speed-kit](https://github.com/your-org/next-speed-kit) for issues, stars, and forks.

This documentation is polished for clarity and professionalism, with consistent Markdown formatting, code blocks, and cross-links. For updates, check the [CHANGELOG.md](../CHANGELOG.md).