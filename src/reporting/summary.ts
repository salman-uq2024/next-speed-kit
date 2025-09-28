import path from 'node:path';
import fg from 'fast-glob';
import { fs } from '../lib/fs.js';
import type { AuditMetrics } from '../audit/types.js';

interface SummaryOptions {
  reportsDir: string;
  beforeTag: string;
  afterTag: string;
  outputPath?: string;
}

interface LoadedReport {
  tag: string;
  formFactor: string;
  filePath: string;
  metrics: AuditMetrics;
}

const METRICS: Array<{
  key: keyof AuditMetrics;
  label: string;
  formatter: (value: number | undefined) => string;
  direction: 'higher' | 'lower';
}> = [
  {
    key: 'performanceScore',
    label: 'Performance score',
    formatter: (value) => (value == null ? 'n/a' : value.toFixed(0)),
    direction: 'higher',
  },
  {
    key: 'largestContentfulPaintMs',
    label: 'Largest Contentful Paint (ms)',
    formatter: formatMs,
    direction: 'lower',
  },
  {
    key: 'firstContentfulPaintMs',
    label: 'First Contentful Paint (ms)',
    formatter: formatMs,
    direction: 'lower',
  },
  {
    key: 'totalBlockingTimeMs',
    label: 'Total Blocking Time (ms)',
    formatter: formatMs,
    direction: 'lower',
  },
  {
    key: 'speedIndexMs',
    label: 'Speed Index (ms)',
    formatter: formatMs,
    direction: 'lower',
  },
  {
    key: 'cumulativeLayoutShift',
    label: 'CLS',
    formatter: (value) => (value == null ? 'n/a' : value.toFixed(3)),
    direction: 'lower',
  },
];

export const updateSummaryMarkdown = async (options: SummaryOptions) => {
  const { reportsDir, beforeTag, afterTag } = options;
  const beforeReports = await loadReports(reportsDir, beforeTag);
  const afterReports = await loadReports(reportsDir, afterTag);

  const formFactors = new Set<string>([
    ...beforeReports.map((report) => report.formFactor),
    ...afterReports.map((report) => report.formFactor),
  ]);

  const sections: string[] = [];

  sections.push('# Lighthouse summary');
  sections.push('');
  sections.push(`Before tag: \`${beforeTag}\``);
  sections.push(`After tag: \`${afterTag}\``);
  sections.push('');

  for (const formFactor of Array.from(formFactors).sort()) {
    const before = beforeReports.find((report) => report.formFactor === formFactor);
    const after = afterReports.find((report) => report.formFactor === formFactor);

    if (!before || !after) {
      continue;
    }

    sections.push(`## ${formFactor.toUpperCase()}`);
    sections.push('');
    sections.push('| Metric | Before | After | Delta |');
    sections.push('| --- | --- | --- | --- |');

    METRICS.forEach((metric) => {
      const beforeValue = before.metrics[metric.key];
      const afterValue = after.metrics[metric.key];
      sections.push(
        `| ${metric.label} | ${metric.formatter(beforeValue)} | ${metric.formatter(
          afterValue
        )} | ${formatDelta(beforeValue, afterValue, metric)} |`
      );
    });

    sections.push('');
    sections.push('Reports:');
    sections.push(`- Before: \`${path.relative(process.cwd(), before.filePath)}\``);
    sections.push(`- After: \`${path.relative(process.cwd(), after.filePath)}\``);
    sections.push('');
  }

  if (sections.length === 4) {
    sections.push('No matching before/after report pairs found.');
  }

  const markdown = sections.join('\n');
  const outputPath = options.outputPath ?? path.join(reportsDir, 'summary.md');
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, markdown, 'utf8');

  return { markdown, outputPath };
};

const loadReports = async (reportsDir: string, tag: string): Promise<LoadedReport[]> => {
  const pattern = `**/*${tag}*.json`;
  const files = await fg(pattern, { cwd: reportsDir, absolute: true });
  const reports: LoadedReport[] = [];

  for (const filePath of files) {
    try {
      const contents = await fs.readJson(filePath);
      if (!contents || typeof contents !== 'object') {
        continue;
      }

      const metrics = extractMetrics(contents as Record<string, unknown>);
      const formFactor = inferFormFactor(filePath);
      reports.push({ tag, formFactor, filePath, metrics });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.warn(`Failed to read ${filePath}: ${err.message}`);
    }
  }

  return reports;
};

const inferFormFactor = (filePath: string): string => {
  const name = path.basename(filePath, '.json');
  if (name.endsWith('-desktop')) {
    return 'desktop';
  }
  if (name.endsWith('-mobile')) {
    return 'mobile';
  }
  return 'unknown';
};

const extractMetrics = (lhr: Record<string, unknown>): AuditMetrics => {
  const categories = lhr.categories as Record<string, any> | undefined;
  const audits = lhr.audits as Record<string, any> | undefined;

  const performanceScore = categories?.performance?.score;

  return {
    performanceScore:
      typeof performanceScore === 'number' ? Math.round(performanceScore * 100) : undefined,
    firstContentfulPaintMs: audits?.['first-contentful-paint']?.numericValue,
    largestContentfulPaintMs: audits?.['largest-contentful-paint']?.numericValue,
    totalBlockingTimeMs: audits?.['total-blocking-time']?.numericValue,
    speedIndexMs: audits?.['speed-index']?.numericValue,
    cumulativeLayoutShift: audits?.['cumulative-layout-shift']?.numericValue,
  };
};

const formatDelta = (
  beforeValue: number | undefined,
  afterValue: number | undefined,
  metric: { key: keyof AuditMetrics; direction: 'higher' | 'lower' }
): string => {
  if (beforeValue === undefined || afterValue === undefined) {
    return 'n/a';
  }

  const delta = afterValue - beforeValue;
  const improvement = metric.direction === 'higher' ? delta : -delta;
  const arrow = improvement > 0 ? '⬆︎' : improvement < 0 ? '⬇︎' : '';

  let formattedDelta: string;

  if (metric.key === 'performanceScore') {
    formattedDelta = delta === 0 ? '±0' : delta > 0 ? `+${Math.round(delta)}` : `${Math.round(delta)}`;
  } else if (metric.key === 'cumulativeLayoutShift') {
    formattedDelta = delta === 0 ? '±0.000' : delta > 0 ? `+${delta.toFixed(3)}` : delta.toFixed(3);
  } else {
    const rounded = Math.round(delta);
    formattedDelta = rounded === 0 ? '±0' : rounded > 0 ? `+${rounded}` : `${rounded}`;
  }

  return arrow ? `${formattedDelta} ${arrow}` : formattedDelta;
};

function formatMs(value: number | undefined): string {
  if (value === undefined) {
    return 'n/a';
  }
  return Math.round(value).toString();
}
