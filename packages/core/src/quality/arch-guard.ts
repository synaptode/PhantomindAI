/**
 * PhantomindAI — ArchGuard
 * Proactive architectural quality guards to ensure codebase consistency.
 */

import { VerificationIssue } from '../types.js';

export interface ArchRule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  pattern?: RegExp;
  antiPattern?: RegExp;
  files?: string[]; // Glob patterns for files to check
  fixRegex?: RegExp;
  fixReplacement?: string;
}

export class ArchGuard {
  private rules: ArchRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default architectural rules
   */
  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: 'no-direct-db',
        name: 'No Direct DB Access',
        description: 'Avoid direct database calls in controllers. Use a service layer.',
        severity: 'error',
        antiPattern: /(prisma|db|database)\.(query|execute|find|create|update|delete)/i,
        files: ['**/controllers/**'],
      },
      {
        id: 'no-secret-logging',
        name: 'No Secret Logging',
        description: 'Ensure API keys or secrets are not being logged.',
        severity: 'error',
        antiPattern: /console\.log\(.*(key|secret|password|token).*\)/i,
        fixRegex: /(console\.log\(.*(?:key|secret|password|token).*\))/gi,
        fixReplacement: '// [PHANTOMIND-FIX] Removed potential secret leak\n// $1',
      },
      {
        id: 'service-naming',
        name: 'Service Naming Convention',
        description: 'Services should end with "Service".',
        severity: 'info',
        pattern: /class\s+\w+Service/i,
        files: ['**/services/**'],
      }
    ];
  }

  /**
   * Add a custom architectural rule
   */
  public addRule(rule: ArchRule): void {
    this.rules.push(rule);
  }

  /**
   * Check content against architectural rules
   */
  public check(content: string, filePath?: string): VerificationIssue[] {
    const issues: VerificationIssue[] = [];

    for (const rule of this.rules) {
      // Check if file matches the rule's filter
      if (filePath && rule.files) {
        const matchesFile = rule.files.some(pattern => {
          const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]+'));
          return regex.test(filePath);
        });
        if (!matchesFile) continue;
      }

      // Check anti-pattern (forbidden stuff)
      if (rule.antiPattern && rule.antiPattern.test(content)) {
        issues.push({
          severity: rule.severity,
          category: 'convention',
          description: `Architectural violation [${rule.id}]: ${rule.description}`,
          suggestion: `Refactor this code to follow the ${rule.name} rule.`,
        });
      }

      // Check pattern (required stuff)
      if (rule.pattern && !rule.pattern.test(content)) {
        issues.push({
          severity: rule.severity,
          category: 'convention',
          description: `Architectural missing pattern [${rule.id}]: ${rule.description}`,
          suggestion: `Ensure the code matches the ${rule.name} requirement.`,
        });
      }
    }

    return issues;
  }

  /**
   * Get all registered rules
   */
  public getRules(): ArchRule[] {
    return this.rules;
  }
}
