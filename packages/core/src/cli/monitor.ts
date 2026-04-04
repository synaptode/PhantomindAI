/**
 * PhantomindAI — CLI Live Monitor
 * Real-time terminal dashboard for observability.
 */

import { ObservabilityService } from '../observability/observability-service.js';
import { loadConfig } from '../config/loader.js';

export async function monitorCommand(projectRoot: string): Promise<void> {
  const chalk = (await import('chalk')).default;
  const readline = await import('node:readline');

  const obs = new ObservabilityService(projectRoot);
  await obs.init();

  const clear = () => {
    process.stdout.write('\x1Bc');
  };

  const render = async () => {
    await obs.refresh();
    const metrics = obs.getDashboardMetrics('today');
    const status = await obs.getAgentStatus();
    const recent = obs.getRecentAudit(8);

    clear();
    console.log(chalk.bold.cyan('🖥️  PhantomindAI — Live Terminal Monitor\n'));

    // Status Row
    const stateIcon = status.active ? chalk.green('● ACTIVE') : chalk.dim('○ IDLE');
    console.log(`${chalk.bold('Agent Status:')} ${stateIcon}  ${chalk.dim(`| Last: ${status.lastAction}`)}`);
    console.log(`${chalk.dim('Reasoning:')} ${chalk.italic(status.lastReasoning.slice(0, 100))}${status.lastReasoning.length > 100 ? '...' : ''}\n`);

    // Metrics Grid
    console.log(chalk.bold.underline('METRICS (TODAY)'));
    const grid = [
      [`Requests: ${chalk.bold(metrics.overview.totalRequests)}`, `Cost: ${chalk.green(`$${metrics.overview.totalCost.toFixed(4)}`)}`],
      [`Tokens: ${chalk.yellow(`${(metrics.overview.totalTokens / 1000).toFixed(1)}k`)}`, `Success: ${chalk.green(`${(metrics.performance.successRate * 100).toFixed(1)}%`)}`],
      [`Secrets: ${metrics.quality.secretsDetected > 0 ? chalk.red(metrics.quality.secretsDetected) : '0'}`, `Arch Issues: ${metrics.quality.consistencyIssues > 0 ? chalk.yellow(metrics.quality.consistencyIssues) : '0'}`]
    ];

    grid.forEach(row => {
      console.log(`  ${row[0].padEnd(25)} ${row[1]}`);
    });

    console.log('');

    // Recent Actions
    console.log(chalk.bold.underline('RECENT ACTIVITY'));
    recent.forEach(entry => {
      const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const actionColor = entry.success === false ? chalk.red : chalk.cyan;
      console.log(`  ${chalk.dim(time)} ${actionColor(entry.action.padEnd(20))} ${chalk.dim(`(${entry.agent})`)}`);
    });

    console.log(`\n${chalk.dim('Refreshing every 3s... Press Ctrl+C to exit.')}`);
  };

  // Initial render
  await render();

  // Polling loop
  const interval = setInterval(async () => {
    try {
      await render();
    } catch (err) {
      clearInterval(interval);
      console.error(chalk.red('\nMonitor update failed.'));
    }
  }, 3000);

  // Handle exit
  process.on('SIGINT', () => {
    clearInterval(interval);
    process.exit();
  });
}
