export type AuditFormFactor = 'mobile' | 'desktop';

export interface AuditMetrics {
  performanceScore?: number;
  firstContentfulPaintMs?: number;
  largestContentfulPaintMs?: number;
  totalBlockingTimeMs?: number;
  speedIndexMs?: number;
  cumulativeLayoutShift?: number;
}

export interface LighthouseRunOptions {
  url: string;
  outputDir: string;
  tag?: string;
  formFactor: AuditFormFactor;
  timestamp: string;
}

export interface LighthouseRunResult {
  url: string;
  formFactor: AuditFormFactor;
  htmlPath: string;
  jsonPath: string;
  metrics: AuditMetrics | null;
  success: boolean;
  error?: string;
}
