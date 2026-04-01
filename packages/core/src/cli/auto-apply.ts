/**
 * PhantomindAI — Auto-Apply Engine
 * Processes agent suggestions and applies changes with approval/validation
 */

import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface SuggestedChange {
  filePath: string;
  type: 'create' | 'modify' | 'delete';
  description: string;
  content?: string; // For create/modify
  reason: string; // Why this change was suggested
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface ChangeSet {
  timestamp: string;
  changes: SuggestedChange[];
  summary: string;
  autoApproved: boolean;
  approvedAt?: string;
}

export class AutoApplyEngine {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Validate changes before applying
   */
  validateChanges(changes: SuggestedChange[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const change of changes) {
      // Check file path safety
      if (change.filePath.includes('..') || change.filePath.startsWith('/')) {
        errors.push(`Unsafe file path: ${change.filePath}`);
      }

      // Check protected directories
      const protectedDirs = ['.git', '.github', 'node_modules', '.phantomind'];
      if (protectedDirs.some(dir => change.filePath.startsWith(dir))) {
        errors.push(`Cannot modify protected directory: ${change.filePath}`);
      }

      // Check content is provided for create/modify
      if ((change.type === 'create' || change.type === 'modify') && !change.content) {
        errors.push(`Missing content for ${change.type}: ${change.filePath}`);
      }

      // Check file exists for delete
      if (change.type === 'delete' && !existsSync(join(this.projectRoot, change.filePath))) {
        errors.push(`File to delete does not exist: ${change.filePath}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Preview changes without applying
   */
  async previewChanges(changes: SuggestedChange[]): Promise<string> {
    const lines: string[] = [];
    lines.push(`\nPending Changes (${changes.length}):\n`);

    for (const change of changes) {
      lines.push(`  ${change.type.toUpperCase()} ${change.filePath}`);
      lines.push(`    Priority:  ${change.priority}`);
      lines.push(`    Reason:    ${change.reason}`);
      if (change.description) {
        lines.push(`    Details:   ${change.description}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Apply changes to filesystem
   */
  async applyChanges(changes: SuggestedChange[]): Promise<{ applied: number; failed: number; errors: string[] }> {
    const validation = this.validateChanges(changes);

    if (!validation.valid) {
      return {
        applied: 0,
        failed: changes.length,
        errors: validation.errors,
      };
    }

    let applied = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const change of changes) {
      try {
        const fullPath = join(this.projectRoot, change.filePath);

        if (change.type === 'create' || change.type === 'modify') {
          const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
          if (!existsSync(dir)) {
            const fs = await import('node:fs/promises');
            await fs.mkdir(dir, { recursive: true });
          }
          writeFileSync(fullPath, change.content || '', 'utf-8');
          applied++;
        } else if (change.type === 'delete') {
          const fs = await import('node:fs/promises');
          await fs.rm(fullPath);
          applied++;
        }
      } catch (error) {
        failed++;
        errors.push(`Failed to apply change to ${change.filePath}: ${(error as Error).message}`);
      }
    }

    return { applied, failed, errors };
  }

  /**
   * Save changeset for audit trail
   */
  async recordChanges(changeset: ChangeSet): Promise<void> {
    const auditDir = join(this.projectRoot, '.phantomind', 'audit');
    const fs = await import('node:fs/promises');

    if (!existsSync(auditDir)) {
      await fs.mkdir(auditDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = join(auditDir, `changes-${timestamp}.json`);

    writeFileSync(filename, JSON.stringify(changeset, null, 2));
  }

  /**
   * Format changeset for CLI display
   */
  formatChangeset(changeset: ChangeSet): string {
    const lines: string[] = [];
    lines.push(`\n📝 Change Summary`);
    lines.push(`   ${changeset.summary}`);
    lines.push(`   Changes: ${changeset.changes.length}`);
    lines.push(`   Auto-approved: ${changeset.autoApproved ? 'Yes' : 'No'}`);
    lines.push('');

    // Group by priority
    const byPriority: Record<string, SuggestedChange[]> = {};
    for (const change of changeset.changes) {
      if (!byPriority[change.priority]) {
        byPriority[change.priority] = [];
      }
      byPriority[change.priority].push(change);
    }

    const priorities = ['critical', 'high', 'medium', 'low'];
    for (const priority of priorities) {
      const changes = byPriority[priority];
      if (changes && changes.length > 0) {
        lines.push(`   ${priority.toUpperCase()} (${changes.length}):`);
        for (const change of changes) {
          lines.push(`     • ${change.filePath} (${change.type})`);
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }
}
