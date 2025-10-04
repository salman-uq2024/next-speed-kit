import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';
import { launch, type LaunchedChrome } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import type { Config, Flags as LighthouseFlags, RunnerResult } from 'lighthouse';
import { ensureDir, fs } from '../lib/fs.js';
import { logger } from '../lib/logger.js';
import type { AuditMetrics, LighthouseRunOptions, LighthouseRunResult } from './types.js';

const isMockMode = (): boolean => {
  return process.env.DEMO_MODE === '1' || process.env.MOCK_LIGHTHOUSE === '1' || process.env.CI === '1';
};

const getMockFixturePath = (options: LighthouseRunOptions): string => {
  const basePath = path.join(process.cwd(), 'tests', 'fixtures', 'reports');
  let filename: string;
  if (options.tag?.includes('before')) {
    filename = 'lh-20240101-1200-example-before-localhost-mobile.json';
  } else {
    filename = 'lh-20240101-1210-example-after-localhost-mobile.json';
  }
  return path.join(basePath, filename);
};

const generateMockHtml = (url: string, lhr: any): string => {
  const score = lhr.categories?.performance?.score ?? 0;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Mock Lighthouse Report - Demo Mode</title>
  <style>body { font-family: system-ui; padding: 20px; }</style>
</head>
<body>
  <h1>Demo Mode: Mock Lighthouse Report</h1>
  <p><strong>URL:</strong> ${url}</p>
  <p><strong>Performance Score:</strong> ${(score * 100).toFixed(0)}</p>
  <p>This is a mock report generated in demo mode. No real Lighthouse run was performed.</p>
</body>
</html>`;
};

export const runLighthouseAudit = async (
  options: LighthouseRunOptions
): Promise<LighthouseRunResult> => {
  const { url, outputDir, tag, formFactor, timestamp } = options;
  const baseName = buildBaseName({ url, tag, formFactor, timestamp });
  const htmlPath = path.join(outputDir, `${baseName}.html`);
  const jsonPath = path.join(outputDir, `${baseName}.json`);

  await ensureDir(outputDir);

  if (isMockMode()) {
    logger.info('Demo mode: using mock Lighthouse results');
    let chrome: LaunchedChrome | undefined;

    try {
      const mockPath = getMockFixturePath(options);
      const mockJson = await readFile(mockPath, 'utf8');
      const lhr = JSON.parse(mockJson);

      const htmlReport = generateMockHtml(url, lhr);
      const jsonReport = JSON.stringify(lhr, null, 2);

      await fs.writeFile(htmlPath, htmlReport, 'utf8');
      await fs.writeFile(jsonPath, jsonReport, 'utf8');

      const metrics = extractMetrics(lhr);

      return {
        url,
        formFactor,
        htmlPath,
        jsonPath,
        metrics,
        success: true,
      };
    } catch (error) {
      const normalised = error instanceof Error ? error : new Error(String(error));
      await writeFailureReports({
        htmlPath,
        jsonPath,
        url,
        formFactor,
        timestamp,
        error: `Mock load failed: ${normalised.message}`,
      });

      return {
        url,
        formFactor,
        htmlPath,
        jsonPath,
        metrics: null,
        success: false,
        error: normalised.message,
      };
    } finally {
      if (chrome) {
        await chrome.kill();
      }
    }
  }

  let chrome: LaunchedChrome | undefined;

  try {
    chrome = await launch({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'],
    });

    const flags: LighthouseFlags = {
      port: chrome.port,
      logLevel: 'error',
      output: 'html',
      disableStorageReset: false,
      channel: 'next-speed-kit',
    } as LighthouseFlags;

    const config: Config = {
      extends: 'lighthouse:default',
      settings: {
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        formFactor,
        screenEmulation:
          formFactor === 'desktop'
            ? { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }
            : { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
      },
    };

    const runnerResult = await lighthouse(url, flags, config);

    if (!runnerResult) {
      throw new Error('Lighthouse produced no output.');
    }

    const htmlReport = Array.isArray(runnerResult.report)
      ? runnerResult.report.join('\n')
      : runnerResult.report ?? '';

    const jsonReport = JSON.stringify(runnerResult.lhr, null, 2);

    await fs.writeFile(htmlPath, htmlReport, 'utf8');
    await fs.writeFile(jsonPath, jsonReport, 'utf8');

    const metrics = extractMetrics(runnerResult.lhr);

    return {
      url,
      formFactor,
      htmlPath,
      jsonPath,
      metrics,
      success: true,
    };
  } catch (error) {
    const normalised = error instanceof Error ? error : new Error(String(error));
    await writeFailureReports({
      htmlPath,
      jsonPath,
      url,
      formFactor,
      timestamp,
      error: normalised.message,
    });

    return {
      url,
      formFactor,
      htmlPath,
      jsonPath,
      metrics: null,
      success: false,
      error: normalised.message,
    };
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
};

const buildBaseName = ({
  url,
  tag,
  formFactor,
  timestamp,
}: {
  url: string;
  tag?: string;
  formFactor: string;
  timestamp: string;
}): string => {
  const slug = slugifyUrl(url);
  const normalisedTag = tag ? slugify(tag) : undefined;
  return ['lh', timestamp, normalisedTag, slug, formFactor]
    .filter(Boolean)
    .join('-');
};

const slugifyUrl = (input: string): string => {
  try {
    const parsed = new URL(input);
    const pathname = parsed.pathname.replace(/\/$/, '');
    const normalisedPath = pathname
      .split('/')
      .filter(Boolean)
      .map((segment) => slugify(segment))
      .join('-');

    return [parsed.hostname, normalisedPath]
      .filter(Boolean)
      .join('-')
      .replace(/-+/g, '-');
  } catch {
    return slugify(input);
  }
};

const slugify = (input: string): string =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

type LighthouseReport = RunnerResult['lhr'];

const extractMetrics = (lhr: LighthouseReport): AuditMetrics => {
  const performanceScoreRaw = lhr.categories.performance?.score;
  const audits = lhr.audits ?? {};

  return {
    performanceScore:
      typeof performanceScoreRaw === 'number'
        ? Math.round(performanceScoreRaw * 100)
        : undefined,
    firstContentfulPaintMs: audits['first-contentful-paint']?.numericValue,
    largestContentfulPaintMs: audits['largest-contentful-paint']?.numericValue,
    totalBlockingTimeMs: audits['total-blocking-time']?.numericValue,
    speedIndexMs: audits['speed-index']?.numericValue,
    cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue,
  };
};

const writeFailureReports = async (params: {
  htmlPath: string;
  jsonPath: string;
  url: string;
  formFactor: string;
  timestamp: string;
  error: string;
}) => {
  const { htmlPath, jsonPath, url, formFactor, timestamp, error } = params;
  const jsonContent = {
    ok: false,
    url,
    formFactor,
    timestamp,
    error,
  };

  const htmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Audit failed for ${escapeHtml(url)}</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 24px; background: #111; color: #f2f2f2; }
      article { background: #1f1f1f; padding: 24px; border-radius: 12px; max-width: 720px; }
      h1 { margin-top: 0; }
      code { background: #2a2a2a; padding: 0 4px; border-radius: 4px; }
    </style>
  </head>
  <body>
    <article>
      <h1>Audit failed</h1>
      <p><strong>URL:</strong> <code>${escapeHtml(url)}</code></p>
      <p><strong>Form factor:</strong> ${escapeHtml(formFactor)}</p>
      <p><strong>Timestamp:</strong> ${escapeHtml(timestamp)}</p>
      <p><strong>Error:</strong> ${escapeHtml(error)}</p>
      <p>Install Chrome or run lighthouse via LHCI and retry. See docs/ops.md for fallback instructions.</p>
    </article>
  </body>
</html>`;

  await fs.writeFile(jsonPath, JSON.stringify(jsonContent, null, 2), 'utf8');
  await fs.writeFile(htmlPath, htmlContent, 'utf8');
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>'"]/g, (match) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[match] ?? match;
  });
