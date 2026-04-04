import { InjectionToken } from '@angular/core';
import type { 
  AuditEntry, 
  CostPeriod, 
  CostReport, 
  DashboardMetrics, 
  SearchResult, 
  ContextMap, 
  AgentStatus 
} from '@phantomind/contracts';

export interface DashboardConfig {
  apiBaseUrl: string;
  refreshMs: number;
  auditLimit: number;
  defaultPeriod: CostPeriod;
}

export interface DashboardApi {
  getMetrics(period: CostPeriod): Promise<DashboardMetrics>;
  getAudit(limit: number): Promise<AuditEntry[]>;
  getCosts(period: CostPeriod): Promise<CostReport>;
  search(query: string): Promise<SearchResult[]>;
  getContextMap(): Promise<ContextMap>;
  getAgentStatus(): Promise<AgentStatus>;
}

export const DASHBOARD_CONFIG = new InjectionToken<DashboardConfig>('DASHBOARD_CONFIG');
export const DASHBOARD_API = new InjectionToken<DashboardApi>('DASHBOARD_API');
