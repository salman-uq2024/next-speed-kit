# Installation

## Prerequisites

- Node.js 20+ (install via nvm for easy version management: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash`, then `nvm install 20`).
- pnpm 9+ (install via `npm install -g pnpm@9` or use corepack: `corepack enable`).
- Google Chrome or Chromium for Lighthouse audits (install via package manager or Puppeteer).

## Install Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/next-speed-kit.git
   cd next-speed-kit
   ```

2. Install root dependencies:
   ```bash
   pnpm install
   ```

3. (Optional) Install example app dependencies:
   ```bash
   cd example
   pnpm install
   cd ..
   ```

4. Build the toolkit:
   ```bash
   pnpm build
   ```

## Common Issues

- **pnpm version mismatch**: Ensure pnpm 9+ is installed globally. Run `pnpm --version` to check. If using npm/yarn, manual tweaks may be needed for workspace scripts.
- **Node version incompatibility**: Verify Node 20+ with `node --version`. Use nvm to switch versions if needed.
- **Frozen lockfile in CI**: Use `pnpm install --frozen-lockfile` in CI to ensure reproducible installs without updating lockfiles.

## Build Outputs

Compile the TypeScript sources before using the CLI or scripts:

```bash
pnpm build
```

The compiled files land in `dist/`.