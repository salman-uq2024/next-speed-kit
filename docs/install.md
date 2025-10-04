# Installation Guide

This guide provides step-by-step instructions to set up next-speed-kit, a CLI tool for optimizing Next.js performance. It's designed for beginners, assuming basic familiarity with the terminal.

## Prerequisites

Before installing, ensure you have the following:

- **Node.js**: Version 20 or higher, as specified in the [.nvmrc](/.nvmrc) file. If you don't have Node.js installed or need version management:
  - Install [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm):
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    ```
    Restart your terminal or run `source ~/.zshrc` (or equivalent for your shell).
  - Install and use the required Node version:
    ```bash
    nvm install
    nvm use
    ```
    Verify with `node --version` (should show 20.x.x or higher).

- **pnpm**: Package manager version 9 or higher. next-speed-kit uses pnpm workspaces for efficient dependency management.
  - Enable pnpm via [Corepack](https://github.com/nodejs/corepack) (recommended, included with Node 16.17+):
    ```bash
    corepack enable
    corepack prepare pnpm@latest --activate
    ```
  - Alternatively, install globally:
    ```bash
    npm install -g pnpm@latest
    ```
    Verify with `pnpm --version`.

- **Git**: For cloning the repository. Install via your package manager (e.g., Homebrew on macOS: `brew install git`).

- **Google Chrome or Chromium**: Required for Lighthouse audits. Install via your OS package manager (e.g., `brew install --cask google-chrome` on macOS) or ensure it's in your PATH.

## Step-by-Step Installation

1. **Clone the Repository**:
   Clone the project from GitHub and navigate into the directory:
   ```bash
   git clone https://github.com/salman-uq2024/next-speed-kit.git
   cd next-speed-kit
   ```

2. **Set Node Version**:
   Use nvm to switch to the project-specified Node version:
   ```bash
   nvm use
   ```
   This ensures compatibility with the [.nvmrc](/.nvmrc) file.

3. **Install Dependencies**:
   Install all workspace dependencies (root package + example app):
   ```bash
   pnpm install
   ```
   This uses the `pnpm-lock.yaml` file for reproducible installs. In CI environments, add `--frozen-lockfile` for stricter reproducibility.

4. **Build the Project**:
   Compile the TypeScript code to generate the CLI and other binaries:
   ```bash
   pnpm build
   ```
   The output will be in the `dist/` directory. This step is required before running the CLI.

5. **(Optional) Run the Example App**:
   The example app is part of the workspace, so dependencies are already available. Start the dev server from the repository root:
   ```bash
   pnpm --filter next-speed-kit-example dev
   ```
   Visit `http://localhost:3000` to see the baseline in action. For more details, see the [Example README](../example/README.md).

## Verifying Installation

- Run the CLI help command to confirm everything works:
  ```bash
  node dist/cli/index.js --help
  ```
  You should see available commands like `audit`, `analyse`, and `codemods`.

- Test a dry-run codemod on the example:
  ```bash
  node dist/cli/index.js codemods --target example --dry-run
  ```

## Common Issues and Troubleshooting

- **Node version mismatch**: If you see errors about unsupported Node versions, run `nvm use` again or check `node --version`. Ensure it's matching [.nvmrc](/.nvmrc).

- **pnpm not found**: Verify installation with `pnpm --version`. If using npm/yarn, you may need to adjust workspace scripts manually.

- **Permission errors on macOS/Linux**: Use `sudo` sparingly; instead, fix npm permissions or use nvm.

- **Chrome not found for audits**: Set the `CHROME_PATH` environment variable to your Chrome binary path, e.g., `export CHROME_PATH=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome`.

- **Frozen lockfile in CI**: Always use `pnpm install --frozen-lockfile` to avoid unintended updates.

For deployment or operational guidance, refer to [deploy.md](./deploy.md) or [ops.md](./ops.md). If issues persist, check the [CHANGELOG.md](../CHANGELOG.md) for known bugs or open an issue on GitHub.

This setup supports 4 built-in codemods for common performance issues like image optimization and dynamic imports.
