# Deployment Guide

This guide explains how to deploy the example Next.js app (or similar projects using next-speed-kit) to Vercel. The example app is pre-configured for demo mode with mocks, allowing quick previews without external dependencies. For production deploys, adjust environment variables as needed.

For initial setup, see the [Installation Guide](./install.md).

## Prerequisites

- A [Vercel account](https://vercel.com) (the free tier is sufficient for testing).
- The project cloned and dependencies installed (run `pnpm install` as described in [install.md](./install.md)).
- Git repository initialized (Vercel supports direct import from GitHub or GitLab).

## Vercel Deployment Steps

Follow these steps to deploy using the Vercel CLI or dashboard.

1. **Log in to Vercel**:
   Authenticate via the CLI:
   ```bash
   vercel login
   ```
   Follow the prompts to sign in with email or GitHub.

2. **Import the Project**:
   - Using the CLI, link your local project and specify the example directory as root:
     ```bash
     vercel import example --root example
     ```
     This configures `example/` as the deployment root.
   - Alternatively, use the [Vercel dashboard](https://vercel.com/dashboard): Connect your Git repository and set `example/` as the root directory.

3. **Configure Build Settings**:
   In the Vercel dashboard or CLI, set the following:
   - **Build Command**:
     ```
     pnpm install --frozen-lockfile && pnpm -w build && pnpm --filter next-speed-kit-example build
     ```
     - `pnpm install --frozen-lockfile`: Ensures reproducible dependency installation (ideal for CI/CD).
     - `pnpm -w build`: Builds the root toolkit, including the CLI and shared libraries.
     - `pnpm --filter next-speed-kit-example build`: Builds the Next.js example app.
   - **Output Directory**: `.next` (default for Next.js projects).
   - **Framework Preset**: Next.js (automatically detected).

4. **Set Environment Variables**:
   Configure these in the Vercel dashboard under project settings. Recommended for demo deploys:

   | Variable          | Value          | Description |
   |-------------------|----------------|-------------|
   | `DEMO_MODE`      | `1`            | Enables mock data for rates and Lighthouse audits (avoids external dependencies). |
   | `RATE_LIMIT_PER_IP` | `30`        | Sets API rate limiting per IP (adjust for traffic needs). |
   | `MOCK_LIGHTHOUSE` | `1`           | Uses mock Lighthouse data if Chrome is unavailable in the build environment. |
   | `API_BASE`       | (Optional)     | Override with a private API endpoint URL if needed. |

   For full details on environment variables, refer to the [README.md](../README.md#environment-variables).

5. **Deploy the Project**:
   Deploy to production:
   ```bash
   vercel --prod
   ```
   - Omit `--prod` for preview deployments.
   - Your app will be available at `https://your-project.vercel.app` (replace `your-project` with your Vercel project name).

## Manual Deployment (CLI-Only, No Git Integration)

For deployments without Git-based CI/CD:

1. Build the project locally:
   ```bash
   pnpm -w build && pnpm --filter next-speed-kit-example build
   ```

2. Deploy the built app:
   ```bash
   cd example
   vercel --root . --build-command "echo 'Built locally'" --output .next
   ```
   *Note*: This bypasses remote builds. Ensure environment variables are set in the Vercel dashboard.

## Post-Deployment Verification

- Visit the deployed URL to confirm the app loads correctly.
- Run performance audits against the live site using the CLI:
  ```bash
  node dist/cli/index.js audit https://your-project.vercel.app --tag vercel-deploy
  ```
  This generates reports in the `reports/` directory. See [ops.md](./ops.md) for audit details.
- For custom domains or advanced configurations, add an `example/vercel.json` file tailored to your needs and redeploy.

## Troubleshooting

Common issues and solutions:

- **Build fails due to dependencies**: Commit `pnpm-lock.yaml` to your repo and always use `--frozen-lockfile` in build commands.
- **Environment variables not applying**: Verify settings in the Vercel dashboard and trigger a redeploy.
- **Next.js-specific errors**: Check `next.config.js` in the example app (e.g., ensure `images.unoptimized = true` for audit compatibility). Refer to the [Next.js documentation](https://nextjs.org/docs) for more.
- **Rate limiting or mock issues**: Adjust `RATE_LIMIT_PER_IP` or enable `DEMO_MODE=1` for testing.

For deployments to other platforms like Netlify or AWS, adapt the build and output directory steps accordingly. If you encounter issues, consult the [CHANGELOG.md](../CHANGELOG.md) or open a GitHub issue.

This deployment process supports quick iterations and integrates seamlessly with the toolkit's 4 codemods for performance optimizations.
