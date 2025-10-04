# Next.js Speed Kit Example App

This example demonstrates how to use the Next.js Speed Kit CLI to audit and optimize a simple Next.js application. The app is a basic marketing homepage with a hero image, markdown content, and a streaming hint component. It intentionally includes performance issues—unsized images, heavy markdown on the critical path, and missing font preconnect hints—to showcase the CLI's codemods.

## Setup and Run

1. Ensure you have Node.js >=20 installed (check with `node -v`).
2. Clone the repo and navigate to the example directory:
   ```
   cd example
   ```
3. Install dependencies:
   ```
   pnpm install
   ```
4. Run the development server:
   ```
   pnpm dev
   ```
   The app will be available at http://localhost:3000.

## Before Optimization

The initial app has several performance and best practices issues identified by Lighthouse audits (run on mobile form factor):

- **Largest Contentful Paint (LCP)**: ~8.7s (caused by unoptimized hero image without explicit width/height, leading to layout shifts and slow rendering).
- **Total Blocking Time (TBT)**: ~1.1s (due to large JS bundles and synchronous script execution).
- **Cumulative Layout Shift (CLS)**: 0 (but potential for shifts from unsized images).
- **Unused JavaScript**: ~20KiB unused in bundles.
- **SEO Issues**: No `<html lang>` attribute, no meta description, images without proper sizing.
- **Accessibility**: Missing alt text optimizations, no lang attribute.
- **Other**: No preconnect hints for fonts, unminified JS/CSS in dev mode.

Run the audit yourself from the repository root (after `pnpm build`):
```
node dist/cli/index.js audit http://localhost:3000 --tag example-local
```
This generates a report (e.g., `reports/lh-20251003-080127-example-before-localhost-mobile.json`) showing a performance score around 0.52.

## Applying Codemods

The CLI provides codemods to fix common issues. Run them to optimize:

1. **Fix Image Sizes** (addresses unsized images causing CLS):
   ```
   node dist/cli/index.js codemods --target example --transform next-image-dimensions --apply
   ```
   - Adds `width` and `height` to `<Image>` components in `pages/index.tsx`.
   - Expected gain: Reduces layout shifts, improves LCP by ~20-30%.

2. **Add Preconnect Hints** (for fonts):
   ```
   node dist/cli/index.js codemods --target example --transform head-font-preconnect --apply
   ```
   - Adds `<link rel="preconnect">` to `pages/_document.tsx` for Google Fonts.
   - Expected gain: Faster font loading, improves FCP by ~100ms.

3. **Dynamic Imports for Heavy Components**:
   ```
   node dist/cli/index.js codemods --target example --transform dynamic-heavy-modules --apply
   ```
   - Wraps `react-markdown` and similar modules in `next/dynamic` with `ssr: false`.
   - Expected gain: Reduces initial bundle size, lowers TBT by ~200ms.

After applying codemods, re-run the audit:
```
node dist/cli/index.js audit http://localhost:3000 --tag example-after
```
Compare reports (before/after JSONs in `reports/`). Expected improvements:
- Performance score: From ~0.52 to ~0.85+.
- LCP: Reduced to ~1.5s (better image handling).
- TBT: Reduced to ~0.2s (optimized bundles).
- CLS: 0 (no shifts).
- Total size: Reduced by ~15-20KiB.

## After Optimization

The app now loads faster with:
- **Performance Gains**: Faster initial render, lower CLS, improved SEO (add `<html lang="en">` and meta description manually if needed).
- **Commands Used**: As above; customize `--transforms` for specific fixes.
- **Verification**: Check console for no errors, Lighthouse score >90, and smooth scrolling/animations.

For production builds, run `pnpm build` and audit the built app for further gains (e.g., minification).

## Additional Notes

- **Bugs Fixed**: Ensured TypeScript build passes cleanly after codemods.
- **Demo Elements**: The hero.png triggers image optimizations; markdown rendering showcases dynamic imports post-codemod.
- **Resetting**: Use `git checkout example` to reset the example to its baseline state after experimenting.

This setup showcases how Next.js Speed Kit automates performance tuning for Next.js apps. Contribute issues/PRs to the repo!

---
*Generated with Next.js Speed Kit*
