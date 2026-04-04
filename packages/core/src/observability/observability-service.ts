import { existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { AuditTrail } from './audit.js';
import { CostTracker } from './cost-tracker.js';
import { AnalyticsDashboard } from './dashboard.js';
import { ArchGuard } from '../quality/arch-guard.js';
import { loadConfig } from '../config/loader.js';
import { CodebaseEmbedder } from '../context/embedder.js';
import type { AuditEntry, CostPeriod, CostReport, DashboardMetrics, SearchResult, ContextMap } from '../types.js';

export class ObservabilityService {
  private auditTrail?: AuditTrail;
  private costTracker?: CostTracker;
  private dashboard?: AnalyticsDashboard;
  private embedder?: CodebaseEmbedder;
  private archGuard?: ArchGuard;
  private auditLogPath: string;
  private costStorePath: string;
  private auditMtimeMs?: number;
  private costMtimeMs?: number;
  private initialized = false;

  constructor(private projectRoot: string) {
    this.auditLogPath = join(projectRoot, '.phantomind', 'audit', 'audit.jsonl');
    this.costStorePath = join(projectRoot, '.phantomind', 'audit', 'costs.json');
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    const config = await loadConfig(this.projectRoot);
    this.auditTrail = new AuditTrail(this.projectRoot);
    this.costTracker = new CostTracker(this.projectRoot, {
      daily: config.budget?.maxCostPerDay,
    });
    this.dashboard = new AnalyticsDashboard(this.costTracker, this.auditTrail);
    this.embedder = new CodebaseEmbedder(this.projectRoot);
    this.archGuard = new ArchGuard();

    await this.auditTrail.loadFromDisk();
    await this.costTracker.load();
    // Embedder build will be lazy/on-demand in searchFiles

    this.initialized = true;
  }

  async refresh(): Promise<void> {
    await this.ensureInit();
    await Promise.all([
      this.refreshAuditIfChanged(),
      this.refreshCostsIfChanged(),
    ]);
  }

  getDashboardMetrics(period: CostPeriod = 'today'): DashboardMetrics {
    this.ensureInitSync();
    return this.dashboard!.getMetrics(period);
  }

  getCostReport(period: CostPeriod = 'today'): CostReport {
    this.ensureInitSync();
    return this.costTracker!.getReport(period) as CostReport;
  }

  getRecentAudit(limit = 50): AuditEntry[] {
    this.ensureInitSync();
    return this.auditTrail!.getRecent(limit) as AuditEntry[];
  }

  async searchFiles(query: string, limit = 10): Promise<SearchResult[]> {
    await this.ensureInit();
    // Build index if not already done
    await this.embedder!.build();
    const results = await this.embedder!.search(query, limit);
    return results.map(r => ({
      path: r.path,
      score: r.score,
      snippet: r.snippet,
      lineStart: 1, // Embedder doesn't currently return line start, defaulting to 1
    }));
  }

  async getContextMap(): Promise<ContextMap> {
    await this.ensureInit();
    // Mocking for now, will implement actual graph extraction if requested
    return {
      nodes: [
        { id: 'core', label: 'Core', type: 'module', size: 20 },
        { id: 'dashboard', label: 'Dashboard', type: 'module', size: 15 },
        { id: 'mcp', label: 'MCP', type: 'module', size: 10 },
      ],
      edges: [
        { source: 'dashboard', target: 'core', weight: 2 },
        { source: 'mcp', target: 'core', weight: 1 },
      ],
    };
  }

  async getAgentStatus(): Promise<any> {
    this.ensureInitSync();
    const recent = this.auditTrail!.getRecent(10);
    const lastAgentEvent = recent.find(r => r.action.startsWith('agent:'));
    
    return {
      active: !!lastAgentEvent && lastAgentEvent.action !== 'agent:complete' && lastAgentEvent.action !== 'agent:error',
      lastAction: lastAgentEvent?.action || 'idle',
      lastReasoning: lastAgentEvent?.reasoning || 'No active reasoning.',
      timestamp: lastAgentEvent?.timestamp || new Date().toISOString(),
    };
  }

  checkArchitecture(content: string, filePath?: string): any[] {
    this.ensureInitSync();
    return this.archGuard!.check(content, filePath);
  }

  private async refreshAuditIfChanged(): Promise<void> {
    if (!this.auditTrail) return;
    if (!existsSync(this.auditLogPath)) {
      await this.auditTrail.loadFromDisk();
      this.auditMtimeMs = undefined;
      return;
    }

    const stats = await stat(this.auditLogPath);
    if (this.auditMtimeMs !== stats.mtimeMs) {
      this.auditMtimeMs = stats.mtimeMs;
      await this.auditTrail.loadFromDisk();
    }
  }

  private async refreshCostsIfChanged(): Promise<void> {
    if (!this.costTracker) return;
    if (!existsSync(this.costStorePath)) {
      this.costMtimeMs = undefined;
      return;
    }

    const stats = await stat(this.costStorePath);
    if (this.costMtimeMs !== stats.mtimeMs) {
      this.costMtimeMs = stats.mtimeMs;
      await this.costTracker.load();
    }
  }

  private async ensureInit(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }

  private ensureInitSync(): void {
    if (!this.initialized) {
      throw new Error('ObservabilityService not initialized. Call init() first.');
    }
  }
}
