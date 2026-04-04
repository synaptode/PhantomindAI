/**
 * PhantomindAI — CLI Fix Command
 * Autonomous rule-based code remediation without API keys.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import fastGlob from 'fast-glob';
import { ArchGuard } from '../quality/arch-guard.js';

export async function fixCommand(
  projectRoot: string,
  options: { dryRun?: boolean; branch?: boolean; verbose?: boolean } = {},
): Promise<void> {
  const chalk = (await import('chalk')).default;
  const ora = (await import('ora')).default;

  console.log(chalk.bold.cyan('\n🛠️  PhantomindAI — Ghost Fixer\n'));

  const spinner = ora('Scanning for fixable violations...').start();

  try {
    const archGuard = new ArchGuard();
    const rules = archGuard.getRules().filter(r => r.fixRegex && r.fixReplacement);
    
    const files = await fastGlob('**/*.{ts,js,tsx,jsx}', {
      cwd: projectRoot,
      ignore: ['node_modules/**', 'dist/**', '.git/**'],
    });

    const fixes: Array<{ path: string; ruleId: string; count: number }> = [];

    for (const file of files) {
      const fullPath = join(projectRoot, file);
      let content = await readFile(fullPath, 'utf-8');
      let modified = false;
      let fileFixCount = 0;

      for (const rule of rules) {
        if (rule.fixRegex && rule.fixReplacement) {
          const matches = content.match(rule.fixRegex);
          if (matches) {
            content = content.replace(rule.fixRegex, rule.fixReplacement);
            modified = true;
            fileFixCount += matches.length;
            fixes.push({ path: file, ruleId: rule.id, count: matches.length });
          }
        }
      }

      if (modified && !options.dryRun) {
        // Create branch if requested
        if (options.branch) {
          try {
            const branchName = `phantomind/fix-${Date.now()}`;
            execSync(`git checkout -b ${branchName}`, { cwd: projectRoot, stdio: 'ignore' });
            options.branch = false; // Only once per session
            console.log(chalk.dim(`  Created branch: ${branchName}`));
          } catch {
            // Git may not be available or repo not clean
          }
        }
        await writeFile(fullPath, content, 'utf-8');
      }
    }

    spinner.stop();

    if (fixes.length === 0) {
      console.log(chalk.green('No fixable architectural violations found. Your codebase is clean! ✨'));
      return;
    }

    console.log(chalk.bold(`${options.dryRun ? 'Potential' : 'Applied'} Fixes (${fixes.length}):\n`));

    for (const fix of fixes) {
      console.log(`  ${chalk.green('✓')} ${chalk.bold(fix.path)}: ${chalk.cyan(fix.count)} fix(es) for ${chalk.yellow(fix.ruleId)}`);
    }

    if (options.dryRun) {
      console.log(`\n${chalk.yellow('Dry run complete. No files were modified.')}`);
      console.log(`${chalk.dim('Run without --dry-run to apply these fixes.')}`);
    } else {
      console.log(`\n${chalk.green.bold('Success!')} All fixes applied successfully.`);
    }

  } catch (error) {
    spinner.fail('Fix command failed');
    console.error(chalk.red((error as Error).message));
  }
}
