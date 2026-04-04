/**
 * PhantomindAI — ArchReport Formatter
 * Formats architectural check results into a beautiful terminal report.
 */

import { VerificationIssue } from '../types.js';

export class ArchReport {
  /**
   * Format issues into a text-based terminal report
   */
  static formatTerminal(issues: VerificationIssue[]): string {
    const chalk = require('chalk');
    if (issues.length === 0) {
      return chalk.green.bold('\n✅ No architectural violations detected. Codebase follows all rules.\n');
    }

    const groups = this.groupIssues(issues);
    let output = chalk.bold.red(`\n🏗️  Architectural Audit — ${issues.length} violations found\n\n`);

    for (const [category, groupIssues] of Object.entries(groups)) {
      output += `${chalk.bold.underline(category.toUpperCase())}\n`;
      for (const issue of groupIssues) {
        const icon = issue.severity === 'error' ? chalk.red('✖') 
          : issue.severity === 'warning' ? chalk.yellow('⚠') 
          : chalk.blue('ℹ');
        
        output += `  ${icon} ${chalk.bold(issue.description)}\n`;
        if (issue.suggestion) {
          output += `    ${chalk.dim('Suggestion:')} ${issue.suggestion}\n`;
        }
      }
      output += '\n';
    }

    return output;
  }

  /**
   * Format issues into Markdown
   */
  static formatMarkdown(issues: VerificationIssue[]): string {
    if (issues.length === 0) {
      return '### ✅ No architectural violations detected.\n';
    }

    const groups = this.groupIssues(issues);
    let output = `### 🏗️ Architectural Audit — ${issues.length} violations found\n\n`;

    for (const [category, groupIssues] of Object.entries(groups)) {
      output += `#### ${category}\n`;
      for (const issue of groupIssues) {
        const icon = issue.severity === 'error' ? '🔴' : issue.severity === 'warning' ? '🟠' : '🔵';
        output += `- ${icon} **${issue.description}**\n`;
        if (issue.suggestion) {
          output += `  - *Suggestion:* ${issue.suggestion}\n`;
        }
      }
      output += '\n';
    }

    return output;
  }

  private static groupIssues(issues: VerificationIssue[]): Record<string, VerificationIssue[]> {
    return issues.reduce((acc, issue) => {
      const category = (issue as any).category || 'General';
      if (!acc[category]) acc[category] = [];
      acc[category].push(issue);
      return acc;
    }, {} as Record<string, VerificationIssue[]>);
  }
}
