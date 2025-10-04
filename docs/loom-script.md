# Demo Video Script: next-speed-kit Overview (≈60 seconds)

This script is designed for a concise Loom video (or similar screen recording) to showcase next-speed-kit, a CLI tool for identifying and fixing Next.js performance issues. The video should demonstrate key features: codemods, bundle analysis, and audits. Aim for a professional, fast-paced delivery with screen sharing of the terminal and example app.

**Video Setup Tips**:
- Screen record your terminal and the example app (`pnpm --filter ./example dev`).
- Use smooth transitions between steps.
- Total length: 60 seconds; practice timing.
- Background: Neutral; voiceover should be clear and enthusiastic.
- End with a call-to-action: "Try it on your Next.js project today!"

## Script Breakdown

Follow these timed steps. Each includes narration, actions, and visuals.

1. **Introduction (0-5s)**:
   - **Narration**: "Meet next-speed-kit: a powerful CLI that detects and resolves common Next.js performance bottlenecks, while generating clear reports on the improvements."
   - **Visuals/Actions**: Show the project logo or README.md from the [repository](https://github.com/your-org/next-speed-kit). Fade in the terminal.
   - **Tip**: Smile and speak directly to the camera if possible.

2. **CLI Help Overview (5-15s)**:
   - **Narration**: "The CLI offers three core commands: `codemods` for automated fixes, `analyse` for bundle insights, and `audit` for Lighthouse performance scoring."
   - **Visuals/Actions**: Run the help command:
     ```bash
     node dist/cli/index.js --help
     ```
     Highlight the commands with cursor or annotations (e.g., circle `codemods`, `analyse`, `audit`).
   - **Tip**: Zoom in on the output for clarity.

3. **Codemods Dry-Run Demo (15-25s)**:
   - **Narration**: "Let's see codemods in action. This dry-run scans the example app and suggests fixes for image dimensions, dynamic imports, and font preconnects—covering 4 key performance transforms."
   - **Visuals/Actions**: Execute the dry-run:
     ```bash
     node dist/cli/index.js codemods --target example --dry-run
     ```
     Point out suggested changes (e.g., "Here, it detects missing image widths to reduce layout shift").
   - **Tip**: Scroll through the output slowly; use arrows to emphasize suggestions. Reference the [ops.md](./ops.md) for applying changes.

4. **Bundle Analysis (25-35s)**:
   - **Narration**: "Next, analyse reveals bundle hotspots. It identifies the largest chunks, helping prioritize optimizations."
   - **Visuals/Actions**: Run the analysis:
     ```bash
     node dist/cli/index.js analyse --target example
     ```
     Call out key findings, e.g., "This chunk is 200KB—dynamic imports can split it."
   - **Tip**: If output is JSON-heavy, show a summarized view or the generated report.

5. **Audit Results Showcase (35-50s)**:
   - **Narration**: "Finally, audits provide before-and-after Lighthouse scores. Run this on your deployed app to quantify gains, like boosting performance from 70 to 95."
   - **Visuals/Actions**: 
     - Mention the script: "Use `pnpm run example:audit` for the example."
     - Open `reports/summary.md` and scroll through it, highlighting score deltas.
     - Briefly show a Lighthouse HTML report (e.g., `reports/lh-*.html`), focusing on metrics like LCP or CLS.
   - **Tip**: Use split-screen if showing multiple files; quantify improvements where possible.

6. **Wrap-Up and Call-to-Action (50-60s)**:
   - **Narration**: "With next-speed-kit, you get layout shift fixes, smarter imports, and an evidence trail for your perf wins. For rollout tips, check [ops.md](./ops.md). Install via [install.md](./install.md) and start optimizing!"
   - **Visuals/Actions**: Show the deployed example app URL or a success metric. End with GitHub link.
   - **Tip**: Fade out with contact info or "Star the repo!"

## Additional Notes

- **Customization**: Adjust timings based on your pace. For longer videos, add real before/after demos.
- **Tools**: Record with Loom, Descript, or OBS Studio. Ensure commands are run in a clean terminal.
- **Best Practices**: Test the script end-to-end. If referencing non-existent paths (e.g., custom reports), update to match your setup.
- **Length Check**: Time yourself—aim under 60s for engagement.

This script enhances demo clarity, making it ideal for portfolio videos or tutorials. For more on operations, see [ops.md](./ops.md).