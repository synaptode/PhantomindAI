/**
 * PhantomindAI — CLI Audit Command
 * View audit trail and cost reports.
 */

import { AuditTrail } from '../observability/audit.js';
import { CostTracker } from '../observability/cost-tracker.js';
import { AnalyticsDashboard } from '../observability/dashboard.js';
import { loadConfig } from '../config/loader.js';

export interface AuditOptions {
  period?: 'today' | 'week' | 'month' | 'all';
  format?: 'terminal' | 'markdown' | 'json';
  type?: 'costs' | 'actions' | 'dashboard' | 'arch';
}

export async function auditCommand(
  projectRoot: string,
  options: AuditOptions,
): Promise<void> {
  const chalk = (await import('chalk')).default;
  const ora = (await import('ora')).default;

  console.log(chalk.bold.cyan('\n📊 PhantomindAI — Audit & Analytics\n'));

  const spinner = ora('Loading audit data...').start();

  try {
    const config = await loadConfig(projectRoot);
    const auditTrail = new AuditTrail(projectRoot);
    const costTracker = new CostTracker(projectRoot, {
      daily: config.budget?.maxCostPerDay,
    });

    await auditTrail.loadFromDisk();
    await costTracker.load();

    spinner.stop();

    const type = options.type ?? 'dashboard';
    const period = options.period ?? 'today';

    if (type === 'dashboard' || type === 'costs') {
      const dashboard = new AnalyticsDashboard(costTracker, auditTrail);

      if (options.format === 'json') {
        console.log(JSON.stringify(dashboard.toJSON(period), null, 2));
      } else if (options.format === 'markdown') {
        console.log(dashboard.formatMarkdown(period));
      } else {
        console.log(dashboard.formatTerminal(period));
      }
    }

    if (type === 'costs') {
      console.log('');
      console.log(costTracker.formatMarkdown(period));
    }

    if (type === 'actions') {
      const entries = auditTrail.getRecent(50);
      console.log(chalk.bold(`Recent Actions (${entries.length}):\n`));

      for (const entry of entries) {
        const time = new Date(entry.timestamp).toLocaleTimeString();
        console.log(`  ${chalk.dim(time)} ${chalk.cyan(entry.action)} ${chalk.dim(`by ${entry.agent}`)}`);
      }
    }

    if (type === 'arch') {
      const { ArchGuard } = await import('../quality/arch-guard.js');
      const { ArchReport } = await import('./arch-report.js');
      const glob = (await import('fast-glob')).default;
      const { readFile } = await import('node:fs/promises');
      const { join } = await import('node:path');

      const archSpinner = ora('Scanning codebase for architectural violations...').start();
      
      try {
        const files = await glob(['**/*.{ts,js,tsx,jsx}'], { 
          cwd: projectRoot,
          ignore: ['node_modules/**', 'dist/**', '.git/**', '.phantomind/**'] 
        });

        const archGuard = new ArchGuard();
        const allIssues = [];

        for (const file of files) {
          const content = await readFile(join(projectRoot, file), 'utf-8');
          const issues = archGuard.check(content, file);
          allIssues.push(...issues);
        }

        archSpinner.stop();

        if (options.format === 'json') {
          console.log(JSON.stringify(allIssues, null, 2));
        } else if (options.format === 'markdown') {
          console.log(ArchReport.formatMarkdown(allIssues));
        } else {
          console.log(ArchReport.formatTerminal(allIssues));
        }
      } catch (err) {
        archSpinner.fail('Architectural scan failed');
        throw err;
      }
    }

    // Budget check
    const budgetCheck = costTracker.checkBudget();
    if (budgetCheck.exceeded) {
      console.log('');
      console.log(chalk.red.bold(`⚠️  Budget exceeded! (${budgetCheck.type}: $${budgetCheck.spent.toFixed(4)} / $${budgetCheck.limit?.toFixed(4)})`));
    }

    console.log('');
  } catch (error) {
    spinner.fail('Audit failed');
    console.error(chalk.red((error as Error).message));
    process.exit(1);
  }
}
