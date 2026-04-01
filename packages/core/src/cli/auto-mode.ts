/**
 * PhantomindAI — Auto Mode Configuration
 * Manages automatic watch, learn, sync, and agent settings
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { mkdirSync } from 'node:fs';
import yaml from 'js-yaml';

export interface AutoModeConfig {
  enabled: boolean;
  on_save: boolean; // Trigger on file save
  on_commit: boolean; // Trigger on git commit
  watch_patterns: string[]; // Glob patterns to watch
  auto_learn: boolean; // Auto-run learn command
  auto_sync: boolean; // Auto-run sync command
  agent_suggestions: boolean; // Ask agent for improvements
  auto_apply: boolean; // Automatically apply agent suggestions
  approval_method: 'prompt' | 'auto' | 'manual-review'; // How to approve changes
  debounce_ms: number; // Debounce rapid changes
  max_changes_per_run: number; // Safety limit on changes per run
}

export const DEFAULT_AUTO_CONFIG: AutoModeConfig = {
  enabled: false,
  on_save: true,
  on_commit: false,
  watch_patterns: [
    'src/**/*.ts',
    'src/**/*.tsx',
    'src/**/*.js',
    'src/**/*.jsx',
    'package.json',
    'tsconfig.json',
    'tailwind.config.*',
    'vite.config.*',
    'jest.config.*',
    'vitest.config.*',
    'eslint.config.*',
  ],
  auto_learn: true,
  auto_sync: true,
  agent_suggestions: false, // Off by default (requires provider config)
  auto_apply: false, // Off by default (safety)
  approval_method: 'prompt',
  debounce_ms: 1000,
  max_changes_per_run: 5,
};

export class AutoModeManager {
  private configPath: string;
  private config: AutoModeConfig;

  constructor(projectRoot: string) {
    this.configPath = join(projectRoot, '.phantomind', 'auto.config.yaml');
    this.config = this.loadConfig();
  }

  /**
   * Load auto config from file or return defaults
   */
  private loadConfig(): AutoModeConfig {
    if (!existsSync(this.configPath)) {
      return DEFAULT_AUTO_CONFIG;
    }

    try {
      const content = readFileSync(this.configPath, 'utf-8');
      const parsed = yaml.load(content) as AutoModeConfig;
      return { ...DEFAULT_AUTO_CONFIG, ...parsed };
    } catch {
      return DEFAULT_AUTO_CONFIG;
    }
  }

  /**
   * Get current auto config
   */
  getConfig(): AutoModeConfig {
    return this.config;
  }

  /**
   * Update auto config and save to file
   */
  async updateConfig(updates: Partial<AutoModeConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };

    const dir = dirname(this.configPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(this.configPath, yaml.dump(this.config, { lineWidth: 120 }));
  }

  /**
   * Enable auto-mode
   */
  async enable(): Promise<void> {
    await this.updateConfig({ enabled: true });
  }

  /**
   * Disable auto-mode
   */
  async disable(): Promise<void> {
    await this.updateConfig({ enabled: false });
  }

  /**
   * Check if auto-mode is fully configured
   */
  isFullyConfigured(): boolean {
    return this.config.enabled && this.config.auto_learn && this.config.auto_sync;
  }

  /**
   * Check if agent suggestions are enabled and has provider config
   */
  canSuggestImprovements(): boolean {
    return this.config.agent_suggestions && this.config.enabled;
  }

  /**
   * Check if auto-apply is enabled
   */
  canAutoApply(): boolean {
    return this.config.auto_apply && this.config.enabled && this.config.agent_suggestions;
  }

  /**
   * Format config for display
   */
  formatDisplay(): string {
    const lines: string[] = [];
    lines.push(`Enabled:              ${this.config.enabled ? '✓' : '✗'}`);
    lines.push(`Auto Learn:           ${this.config.auto_learn ? '✓' : '✗'}`);
    lines.push(`Auto Sync:            ${this.config.auto_sync ? '✓' : '✗'}`);
    lines.push(`Agent Suggestions:    ${this.config.agent_suggestions ? '✓' : '✗'}`);
    lines.push(`Auto-Apply Changes:   ${this.config.auto_apply ? '✓' : '✗'}`);
    lines.push(`Approval Method:      ${this.config.approval_method}`);
    lines.push(`Debounce:             ${this.config.debounce_ms}ms`);
    lines.push(`Max Changes/Run:      ${this.config.max_changes_per_run}`);
    lines.push(`Watch Patterns:       ${this.config.watch_patterns.length} patterns`);
    return lines.join('\n');
  }
}
