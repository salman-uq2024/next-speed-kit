# Installation

## Prerequisites

- Node.js 18+ (matches the minimum supported by Next.js 14).
- pnpm 9 (project scripts assume pnpm, but npm/yarn can work with manual tweaks).
- Google Chrome or Chromium for Lighthouse audits.

## Install the toolkit

```bash
pnpm install
```

This installs the CLI dependencies under the project root.

## Install the example app (optional)

```bash
cd example
pnpm install
```

The example is kept separate so you can skip it when using the toolkit on an existing project.

## Build outputs

Compile the TypeScript sources before using the CLI or scripts:

```bash
pnpm build
```

The compiled files land in `dist/`.
