export interface DashboardMetrics {
  overview: {
    totalRequests: number;
    totalCost: number;
    avgCostPerRequest: number;
    totalTokens: number;
    activeProviders: string[];
  };
  performance: {
    avgResponseTime: number;
    successRate: number;
    errorCount: number;
  };
  quality: {
    secretsDetected: number;
    hallucinationsDetected: number;
    consistencyIssues: number;
  };
  agents: {
    tasksCompleted: number;
    tasksFailed: number;
    avgStepsPerTask: number;
  };
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  agent: string;
  details: Record<string, unknown>;
}

export interface CostReport {
  period: 'today' | 'week' | 'month' | 'all';
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
  requestCount?: number;
  byProvider: Record<string, number>;
  byModel: Record<string, number>;
  budgetRemaining?: number;
}

export type CostPeriod = CostReport['period'];

export interface SearchResult {
  path: string;
  score: number;
  snippet: string;
  lineStart: number;
}

export interface ContextMapNode {
  id: string;
  label: string;
  type: 'file' | 'module' | 'skill' | 'rule';
  size: number;
}

export interface ContextMapEdge {
  source: string;
  target: string;
  label?: string;
  weight: number;
}

export interface ContextMap {
  nodes: ContextMapNode[];
  edges: ContextMapEdge[];
}

export interface AgentStatus {
  active: boolean;
  lastAction: string;
  lastReasoning: string;
  timestamp: string;
}
