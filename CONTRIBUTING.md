# Contributing to next-speed-kit

Thank you for considering contributing to next-speed-kit, a CLI toolkit for Next.js performance optimization! Contributions are welcome, whether it's bug fixes, new codemods, documentation improvements, or feature suggestions. This guide outlines the process to get started.

We follow standard open-source practices: fork the repo, create a branch, submit a pull request (PR). All changes must adhere to TypeScript standards, pass tests, and maintain the project's focus on performance audits and codemods.

## Development Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-org/next-speed-kit.git
   cd next-speed-kit
   ```

2. **Set Node Version**:
   Use the [.nvmrc](.nvmrc) file for consistency (Node 20+):
   ```bash
   nvm use
   ```
   Verify: `node --version`.

3. **Install Dependencies**:
   ```bash
   pnpm install
   ```
   This sets up the monorepo with pnpm workspaces.

4. **Build the Project**:
   ```bash
   pnpm build
   ```
   Compiles TypeScript to `dist/`.

For detailed setup, see [docs/install.md](docs/install.md).

## Running Tests

Tests cover CLI commands, codemods, analysis, and reporting using Vitest.

- **Run All Tests**:
  ```bash
  pnpm test
  ```
  Includes unit and integration tests.

- **Run Specific Tests**:
  ```bash
  pnpm test codemods  # e.g., for codemod tests
  ```

- **Watch Mode** (for development):
  ```bash
  pnpm test --watch
  ```

- **Coverage**:
  ```bash
  pnpm test --coverage
  ```
  Reports are generated in `coverage/`.

Ensure tests pass before submitting changes. Fixtures are in `tests/fixtures/`.

## Adding Features

Focus on enhancing performance tools without altering core CLI behavior.

### Example: Adding a New Codemod

1. **Create the Transform**:
   - Add a file in `src/codemods/transforms/`, e.g., `new-optim.ts`.
   - Implement the AST transformation using the existing patterns (e.g., jscodeshift for JSX changes).
   - Export the transform function.

2. **Register the Codemod**:
   - Update `src/codemods/index.ts` to include your new transform in the registry.
   - Add a CLI flag or selector if needed (e.g., `--transform new-optim`).

3. **Add Tests**:
   - Write tests in `tests/codemods.test.ts` using fixtures.
   - Test dry-run, apply, and idempotency.

4. **Document**:
   - Update [docs/ops.md](docs/ops.md) with usage examples.
   - Add to [CHANGELOG.md](CHANGELOG.md) under the relevant section.

For bundle analysis or audit extensions, modify `src/analyse/` or `src/audit/` accordingly. Propose large features via an issue first.

## Code Style

- **TypeScript**: Strict mode enabled in [tsconfig.json](tsconfig.json). Use interfaces for types; avoid `any`.
- **Formatting**: Follow [.editorconfig](.editorconfig) for indentation (2 spaces) and line endings.
- **Linting**: Run `pnpm lint` before committing. ESLint and Prettier are configured—install extensions in your editor.
- **Commits**: Use conventional commits (e.g., `feat: add new codemod`, `fix: resolve audit bug`).
- **Dependencies**: Add new deps via `pnpm add <pkg> -w` for workspace; update lockfile.

Run `pnpm lint && pnpm format` to check/fix style.

## Submitting Pull Requests

1. **Fork and Branch**:
   - Fork the repo on GitHub.
   - Create a feature branch: `git checkout -b feat/your-feature`.

2. **Make Changes**:
   - Implement, test, and lint your code.
   - Build and run the CLI: `node dist/cli/index.js --help` to verify.

3. **Push and PR**:
   - Push: `git push origin feat/your-feature`.
   - Open a PR against `main`. Include:
     - Description of the change.
     - Motivation (e.g., "Fixes #123").
     - Screenshots or examples if applicable.
     - Test results.

PRs trigger CI tests. Address feedback promptly. We aim to review within 48 hours.

## Issues and Questions

- Report bugs or request features in the [Issues](https://github.com/your-org/next-speed-kit/issues) tab.
- For discussions, use Discussions or comment on PRs.

By contributing, you agree that your work will be licensed under the MIT License (see [LICENSE](LICENSE)). Questions? Reach out via issues.

(Word count: 428)