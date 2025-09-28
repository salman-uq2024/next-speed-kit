import path from 'node:path';
import zlib from 'node:zlib';
import fg from 'fast-glob';
import { fs } from '../lib/fs.js';

export interface AssetRecord {
  absolutePath: string;
  relativePath: string;
  type: 'js' | 'css' | 'other';
  category: string;
  sizeBytes: number;
  gzipBytes: number;
}

export interface BundleSummary {
  projectDir: string;
  nextDir: string;
  totalAssets: number;
  totalBytes: number;
  totalGzipBytes: number;
  totalsByType: Record<string, { count: number; bytes: number; gzipBytes: number }>;
  totalsByCategory: Record<string, { count: number; bytes: number; gzipBytes: number }>;
  topBySize: AssetRecord[];
  topByGzip: AssetRecord[];
}

export interface AnalyseOptions {
  projectDir: string;
  patterns?: string[];
  limit?: number;
}

const DEFAULT_PATTERNS = [
  'static/chunks/**/*.js',
  'static/chunks/**/*.css',
  'static/css/**/*.css',
];

export const analyseNextBundle = async (
  options: AnalyseOptions
): Promise<{ assets: AssetRecord[]; summary: BundleSummary }> => {
  const { projectDir } = options;
  const nextDir = path.join(projectDir, '.next');

  const exists = await fs.pathExists(nextDir);
  if (!exists) {
    throw new Error(`No .next build directory found at ${nextDir}. Run next build first.`);
  }

  const patterns = options.patterns ?? DEFAULT_PATTERNS;
  const files = await fg(patterns, {
    cwd: nextDir,
    absolute: true,
    onlyFiles: true,
    suppressErrors: true,
  });

  const assets: AssetRecord[] = [];

  for (const absolutePath of files) {
    const relativePath = path.relative(nextDir, absolutePath);
    const type = inferType(relativePath);
    const category = categoriseAsset(relativePath);
    const stats = await fs.stat(absolutePath);
    const source = await fs.readFile(absolutePath);
    const gzipBytes = zlib.gzipSync(source).length;

    assets.push({
      absolutePath,
      relativePath,
      type,
      category,
      sizeBytes: stats.size,
      gzipBytes,
    });
  }

  assets.sort((a, b) => b.sizeBytes - a.sizeBytes);

  const totalBytes = assets.reduce((acc, asset) => acc + asset.sizeBytes, 0);
  const totalGzipBytes = assets.reduce((acc, asset) => acc + asset.gzipBytes, 0);

  const totalsByType = aggregateByKey(assets, (asset) => asset.type);
  const totalsByCategory = aggregateByKey(assets, (asset) => asset.category);

  const limit = options.limit ?? 8;

  const topBySize = assets.slice(0, limit);
  const topByGzip = [...assets].sort((a, b) => b.gzipBytes - a.gzipBytes).slice(0, limit);

  const summary: BundleSummary = {
    projectDir,
    nextDir,
    totalAssets: assets.length,
    totalBytes,
    totalGzipBytes,
    totalsByType,
    totalsByCategory,
    topBySize,
    topByGzip,
  };

  return { assets, summary };
};

const inferType = (relativePath: string): AssetRecord['type'] => {
  if (relativePath.endsWith('.js')) {
    return 'js';
  }

  if (relativePath.endsWith('.css')) {
    return 'css';
  }

  return 'other';
};

const categoriseAsset = (relativePath: string): string => {
  if (relativePath.includes('chunks/app/')) {
    return 'app-router';
  }

  if (relativePath.includes('chunks/pages/')) {
    return 'pages-router';
  }

  if (relativePath.includes('framework')) {
    return 'framework';
  }

  if (relativePath.includes('main-')) {
    return 'main';
  }

  if (relativePath.includes('webpack')) {
    return 'webpack-runtime';
  }

  return 'other';
};

const aggregateByKey = (
  assets: AssetRecord[],
  selector: (asset: AssetRecord) => string
): Record<string, { count: number; bytes: number; gzipBytes: number }> => {
  const map = new Map<string, { count: number; bytes: number; gzipBytes: number }>();

  for (const asset of assets) {
    const key = selector(asset);
    const entry = map.get(key) ?? { count: 0, bytes: 0, gzipBytes: 0 };
    entry.count += 1;
    entry.bytes += asset.sizeBytes;
    entry.gzipBytes += asset.gzipBytes;
    map.set(key, entry);
  }

  return Object.fromEntries(map);
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

export const renderBundleSummary = (summary: BundleSummary): string => {
  const lines: string[] = [];

  lines.push(`Project: ${summary.projectDir}`);
  lines.push(`.next directory: ${summary.nextDir}`);
  lines.push(
    `Analysed ${summary.totalAssets} asset${summary.totalAssets === 1 ? '' : 's'} (${formatBytes(
      summary.totalBytes
    )} raw / ${formatBytes(summary.totalGzipBytes)} gzip)`
  );

  lines.push('By type:');
  for (const [type, stats] of Object.entries(summary.totalsByType)) {
    lines.push(
      `  • ${type}: ${stats.count} file${stats.count === 1 ? '' : 's'} (${formatBytes(
        stats.bytes
      )} raw / ${formatBytes(stats.gzipBytes)} gzip)`
    );
  }

  lines.push('By category:');
  for (const [category, stats] of Object.entries(summary.totalsByCategory)) {
    lines.push(
      `  • ${category}: ${stats.count} file${stats.count === 1 ? '' : 's'} (${formatBytes(
        stats.bytes
      )} raw / ${formatBytes(stats.gzipBytes)} gzip)`
    );
  }

  const formatAsset = (asset: AssetRecord): string =>
    `${asset.relativePath} (${formatBytes(asset.sizeBytes)} raw / ${formatBytes(
      asset.gzipBytes
    )} gzip) [${asset.category}]`;

  if (summary.topBySize.length > 0) {
    lines.push('Largest assets by raw size:');
    summary.topBySize.forEach((asset, index) => {
      lines.push(`  ${index + 1}. ${formatAsset(asset)}`);
    });
  }

  if (summary.topByGzip.length > 0) {
    lines.push('Largest assets by gzip size:');
    summary.topByGzip.forEach((asset, index) => {
      lines.push(`  ${index + 1}. ${formatAsset(asset)}`);
    });
  }

  return lines.join('\n');
};
