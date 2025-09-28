import { mkdtemp, readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { updateSummaryMarkdown } from '../src/reporting/summary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixtureReports = path.join(__dirname, 'fixtures', 'reports');

describe('updateSummaryMarkdown', () => {
  it('creates a markdown summary for before/after reports', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'nsk-reports-'));
    const outputPath = path.join(tempDir, 'summary.md');

    const { markdown } = await updateSummaryMarkdown({
      reportsDir: fixtureReports,
      beforeTag: 'example-before',
      afterTag: 'example-after',
      outputPath,
    });

    expect(markdown).toContain('| Metric | Before | After | Delta |');
    expect(markdown).toContain('Performance score');
    expect(markdown).toContain('Largest Contentful Paint');
    expect(markdown).toContain('+22');

    const fileContents = await readFile(outputPath, 'utf8');
    expect(fileContents).toContain('example-after');
  });
});
