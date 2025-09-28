import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { analyseNextBundle, renderBundleSummary } from '../src/analyse/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixtureDir = path.join(__dirname, 'fixtures', 'analyse');

describe('analyseNextBundle', () => {
  it('summarises bundle assets', async () => {
    const { summary } = await analyseNextBundle({ projectDir: fixtureDir, limit: 2 });

    expect(summary.totalAssets).toBe(4);
    expect(summary.totalsByType.js.count).toBe(3);
    expect(summary.totalsByType.css.count).toBe(1);
    expect(summary.totalsByCategory['app-router']).toBeDefined();

    const report = renderBundleSummary(summary);
    expect(report).toContain('Analysed');
    expect(report).toContain('Largest assets by raw size');
  });
});
