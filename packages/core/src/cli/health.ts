/**
 * PhantomindAI — CLI Health Command
 * Data-driven project health scoring and reporting.
 */

import { ArchGuard } from '../quality/arch-guard.js';
import { SecretScanner } from '../quality/secret-scanner.js';
import { ConsistencyEnforcer } from '../quality/consistency.js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import fastGlob from 'fast-glob';

export async function healthCommand(projectRoot: string): Promise<void> {
  const chalk = (await import('chalk')).default;
  const ora = (await import('ora')).default;

  console.log(chalk.bold.cyan('\n🩺 PhantomindAI — Project Health Report\n'));

  const spinner = ora('Analyzing project structure and quality...').start();

  try {
    const archGuard = new ArchGuard();
    const secretScanner = new SecretScanner();
    const consistency = new ConsistencyEnforcer(projectRoot);

    const files = await fastGlob('**/*.{ts,tsx,js,jsx,swift,go,py}', {
      cwd: projectRoot,
      ignore: ['node_modules/**', 'dist/**', '.git/**', '.phantomind/**'],
    });

    let archViolations = 0;
    let secretsFound = 0;
    let totalIssues = 0;

    for (const file of files) {
      const content = await readFile(join(projectRoot, file), 'utf-8');
      
      const archIssues = archGuard.check(content, file);
      archViolations += archIssues.length;

      const secrets = secretScanner.scan(content, file);
      secretsFound += secrets.length;
    }

    const consistencyReport = await consistency.scan('all');
    const consistencyIssues = consistencyReport.issues.length;

    spinner.stop();

    // Scoring Algorithm
    let score = 100;
    score -= (archViolations * 10);
    score -= (secretsFound * 25);
    score -= (consistencyIssues * 2);
    score = Math.max(0, score);

    // Render Score
    const scoreColor = score > 90 ? chalk.green.bold : score > 70 ? chalk.yellow.bold : chalk.red.bold;
    console.log(`${chalk.bold('Overall Health Score:')} ${scoreColor(score + '/100')}\n`);

    // Metrics
    console.log(chalk.bold.underline('METRICS:'));
    console.log(`  ${chalk.bold('Files Scanned:')} ${files.length}`);
    console.log(`  ${chalk.bold('Arch Violations:')} ${archViolations > 0 ? chalk.red(archViolations) : chalk.green('0')}`);
    console.log(`  ${chalk.bold('Secrets Leaked:')} ${secretsFound > 0 ? chalk.red(secretsFound) : chalk.green('0')}`);
    console.log(`  ${chalk.bold('Consistency Issues:')} ${consistencyIssues > 0 ? chalk.yellow(consistencyIssues) : chalk.green('0')}\n`);

    // Badges
    console.log(chalk.bold.underline('BADGES:'));
    const badge = (name: string, active: boolean, color: any) => {
      const icon = active ? '✦' : '○';
      const style = active ? color : chalk.dim;
      console.log(`  ${style(`${icon} ${name}`)}`);
    };

    badge('Iron Shield', secretsFound === 0, chalk.blue.bold);
    badge('Clean Architect', archViolations === 0, chalk.magenta.bold);
    badge('Pattern Master', consistencyIssues === 0, chalk.yellow.bold);
    badge("Phantom's Choice", score >= 95, chalk.cyan.bold);

    console.log('');

    if (score < 100) {
      console.log(chalk.dim('Run `phantomind troubleshoot` or `phantomind audit -t arch` for details.'));
      if (archViolations > 0) {
        console.log(chalk.dim('Try `phantomind fix` to automatically resolve some architectural issues.'));
      }
    }

  } catch (error) {
    spinner.fail('Health check failed');
    console.error(chalk.red((error as Error).message));
  }
}
