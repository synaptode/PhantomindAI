/**
 * PhantomindAI — CLI Snapshot Command
 * Local codebase context versioning and comparison.
 */

import { mkdir, copyFile, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

export async function snapshotCommand(
  projectRoot: string,
  options: { name?: string; restore?: boolean; list?: boolean; diff?: boolean } = {},
): Promise<void> {
  const chalk = (await import('chalk')).default;
  const ora = (await import('ora')).default;

  const snapshotDir = join(projectRoot, '.phantomind', 'snapshots');
  const configDir = join(projectRoot, '.phantomind');

  if (options.list) {
    if (!existsSync(snapshotDir)) {
      console.log(chalk.yellow('No snapshots found.'));
      return;
    }
    const snapshots = await readdir(snapshotDir);
    console.log(chalk.bold.cyan('\n📜 PhantomindAI Snapshots:'));
    snapshots.forEach(s => console.log(`  • ${chalk.green(s)}`));
    return;
  }

  if (options.restore && options.name) {
    const spinner = ora(`Restoring snapshot: ${options.name}...`).start();
    try {
      const source = join(snapshotDir, options.name);
      if (!existsSync(source)) throw new Error(`Snapshot '${options.name}' not found.`);
      
      const files = await readdir(source);
      for (const file of files) {
        await copyFile(join(source, file), join(configDir, file));
      }
      spinner.succeed(`Snapshot '${options.name}' restored successfully.`);
    } catch (error) {
      spinner.fail(`Restore failed: ${(error as Error).message}`);
    }
    return;
  }

  // Default: Create snapshot
  const name = options.name ?? `snap_${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const target = join(snapshotDir, name);
  const spinner = ora(`Creating context snapshot: ${name}...`).start();

  try {
    await mkdir(target, { recursive: true });
    
    // Files to snapshot
    const filesToSnap = ['config.yaml', 'SKILLS.md', 'RULES.md', 'learned_patterns.json'].filter(f => 
      existsSync(join(configDir, f))
    );

    for (const file of filesToSnap) {
      await copyFile(join(configDir, file), join(target, file));
    }

    spinner.succeed(`Snapshot '${name}' created in ${target}`);
  } catch (error) {
    spinner.fail(`Snapshot failed: ${(error as Error).message}`);
  }
}
