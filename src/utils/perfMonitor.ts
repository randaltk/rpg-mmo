const isDev = process.env.NODE_ENV === 'development';

export class PerfMonitor {
  private label: string;
  private frameTimes: number[] = [];
  private callCount = 0;
  private reasons: Record<string, number> = {};
  private lastLogTime = 0;
  private interval: number;

  constructor(label: string, intervalMs = 3000) {
    this.label = label;
    this.interval = intervalMs;
  }

  /** Track a re-render reason (e.g. "monsters", "players") */
  reason(name: string): void {
    if (!isDev) return;
    this.reasons[name] = (this.reasons[name] || 0) + 1;
  }

  /** Record one tick/frame. Pass frameMs to track per-frame cost. */
  tick(frameMs?: number): void {
    if (!isDev) return;
    this.callCount++;
    if (frameMs !== undefined) this.frameTimes.push(frameMs);

    const now = performance.now();
    if (now - this.lastLogTime > this.interval) {
      this.lastLogTime = now;
      this.flush();
    }
  }

  private flush(): void {
    const parts: string[] = [];
    parts.push(`calls: ${this.callCount}`);

    if (this.frameTimes.length > 0) {
      const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
      const max = Math.max(...this.frameTimes);
      const p95 = this.percentile(95);
      parts.push(`avg: ${avg.toFixed(2)}ms`);
      parts.push(`p95: ${p95.toFixed(2)}ms`);
      parts.push(`max: ${max.toFixed(2)}ms`);
    }

    const reasonKeys = Object.keys(this.reasons);
    if (reasonKeys.length > 0) {
      const reasonStr = reasonKeys.map(k => `${k}:${this.reasons[k]}`).join(' ');
      parts.push(`triggers: ${reasonStr}`);
    }

    console.log(`[PERF ${this.label}] ${parts.join(' | ')}`);

    this.callCount = 0;
    this.frameTimes = [];
    this.reasons = {};
  }

  private percentile(p: number): number {
    if (this.frameTimes.length === 0) return 0;
    const sorted = [...this.frameTimes].sort((a, b) => a - b);
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
  }
}
