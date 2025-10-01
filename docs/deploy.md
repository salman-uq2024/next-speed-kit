# Deployment Guide

This guide covers deploying the example Next.js app (or similar projects using the toolkit) to Vercel. The example app is configured for demo mode with mocks, making it suitable for quick previews without external dependencies.

## Prerequisites

- A Vercel account (free tier works for testing).
- The project cloned and dependencies installed (`pnpm install`).
- Git repository set up (Vercel can import directly from GitHub/GitLab).

## Vercel Deployment Steps

1. **Login to Vercel**:
   ```bash
   vercel login
   ```
   Follow the prompts to authenticate via email or GitHub.

2. **Import the Project**:
   - Use the Vercel CLI to link your local project:
     ```bash
     vercel import example --root example
     ```
     This sets `example/` as the root directory for deployment.
   - Alternatively, import via the Vercel dashboard: Connect your Git repo and select the `example/` directory as the root.

3. **Configure Build Settings**:
   - Set the build command:
     ```
     pnpm install --frozen-lockfile && pnpm -w build && pnpm --filter ./example build
     ```
     - `pnpm install --frozen-lockfile`: Installs dependencies reproducibly (CI-friendly).
     - `pnpm -w build`: Builds the root toolkit (CLI and shared libs).
     - `pnpm --filter ./example build`: Builds the example Next.js app.
   - Set the output directory: `.next` (standard for Next.js).
   - Framework preset: Next.js (auto-detected).

4. **Set Environment Variables**:
   - `DEMO_MODE=1`: Enables mocks for rates and Lighthouse (recommended for demo deploys).
   - `RATE_LIMIT_PER_IP=30`: Configures API rate limiting (adjust as needed).
   - `MOCK_LIGHTHOUSE=1`: Uses mock data for audits if Chrome isn't available in the build environment.
   - `API_BASE`: Optional; set to a private API base URL if overriding public endpoints.

5. **Deploy**:
   ```bash
   vercel --prod
   ```
   - This deploys to production. For previews, omit `--prod`.
   - Expected URL: `https://your-project.vercel.app` (replace `your-project` with your Vercel project name).

## Manual Deploy (No Git Integration)

If you prefer CLI-only without Git:

1. Build locally:
   ```bash
   pnpm -w build && pnpm --filter ./example build
   ```

2. Deploy the built app:
   ```bash
   cd example
   vercel --root . --build-command "echo 'Built locally'" --output .next
   ```
   Note: This skips remote builds; ensure env vars are set in Vercel dashboard.

## Post-Deployment

- Visit the deployed URL to verify the app loads.
- Run audits against the live URL using the CLI: `node dist/cli/index.js audit https://your-project.vercel.app --tag vercel-deploy`.
- For custom domains or advanced configs, edit `vercel.json` in the `example/` root.

## Troubleshooting

- **Build fails on dependencies**: Ensure `pnpm-lock.yaml` is committed and use `--frozen-lockfile`.
- **Env vars not applied**: Double-check Vercel dashboard settings; redeploy after updates.
- **Next.js-specific issues**: Verify `next.config.js` settings (e.g., `images.unoptimized = true` for audits).

For other platforms (Netlify, AWS), adapt the build/output steps accordingly.