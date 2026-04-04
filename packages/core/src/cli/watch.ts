import { watch } from 'node:fs';
import { join } from 'node:path';
import { learnCommand } from './learn.js';
import { syncCommand } from './sync.js';
import { AutoModeManager } from './auto-mode.js';

export interface WatchOptions {
  sync?: boolean;
  auto?: boolean; // Auto-learn and sync without prompting
  agent?: boolean; // Get improvement suggestions from agent
  autoApply?: boolean; // Automatically apply agent suggestions
  setup?: boolean; // Setup auto-mode configuration
  daemon?: boolean; // Run as background daemon
}

function shouldIgnore(path: string): boolean {
  return [
    '.phantomind/',
    '.github/',
    '.continue/',
    '.zed/',
    '.claude/',
    'node_modules/',
    '.git/',
    'dist/',
    'build/',
    '.github/copilot-instructions.md',
    '.cursorrules',
    '.clinerules',
    '.windsurfrules',
    '.aider.conf.yml',
    'AGENTS.md',
  ].some(pattern => path.includes(pattern));
}

export async function watchCommand(projectRoot: string, options: WatchOptions): Promise<void> {
  const chalk = (await import('chalk')).default;

  // Handle auto-mode setup
  if (options.setup) {
    await setupAutoMode(projectRoot);
    return;
  }

  const autoManager = new AutoModeManager(projectRoot);

  if (options.daemon) {
    const { spawn } = await import('node:child_process');
    const { writeFile, mkdir } = await import('node:fs/promises');
    
    const logDir = join(projectRoot, '.phantomind', 'logs');
    await mkdir(logDir, { recursive: true });
    const logFile = join(logDir, 'watch.log');
    
    // Remove --daemon from args
    const args = process.argv.slice(2).filter(a => a !== '--daemon' && a !== '-d');
    
    const child = spawn(process.argv[0], [process.argv[1], ...args], {
      detached: true,
      stdio: 'ignore',
      cwd: projectRoot,
    });

    child.unref();
    
    console.log(chalk.green.bold('🚀 PhantomindAI Watcher started in background.'));
    console.log(`${chalk.bold('PID:')} ${child.pid}`);
    console.log(`${chalk.bold('Log:')} ${logFile}`);
    console.log(chalk.dim('\nUse `kill <PID>` to stop the background process.'));
    return;
  }

  console.log(chalk.bold.cyan('\n👀 PhantomindAI — Watch Mode\n'));

  if (options.auto) {
    console.log(chalk.green('  Auto-mode enabled'));
    if (options.agent) {
      console.log(chalk.blue('  Agent suggestions enabled'));
    }
    if (options.autoApply) {
      console.log(chalk.yellow('  Auto-apply enabled (experimental)'));
    }
  }

  console.log(chalk.dim('  Watching project files. Press Ctrl+C to stop.'));
  console.log('');

  let timer: NodeJS.Timeout | undefined;
  let running = false;

  const run = async (): Promise<void> => {
    if (running) return;
    running = true;
    try {
      await learnCommand(projectRoot, { verbose: false, onlyChanges: true });
      
      if (options.sync || options.auto) {
        await syncCommand(projectRoot, { verbose: false });
      }

      if (options.agent && options.auto) {
        console.log(chalk.blue('\n  🤖 Asking agent for improvement suggestions...'));
        // Agent integration would go here in Phase 3.5
        console.log(chalk.dim('  (Agent integration coming in v0.5.0)'));
      }
    } finally {
      running = false;
    }
  };

  const watcher = watch(projectRoot, { recursive: true }, (_eventType, fileName) => {
    if (!fileName) return;
    if (shouldIgnore(String(fileName))) return;
    
    clearTimeout(timer);
    const debounce = options.auto 
      ? (autoManager.getConfig().debounce_ms || 1000)
      : 500;
    
    timer = setTimeout(() => {
      void run();
    }, debounce);
  });

  process.on('SIGINT', () => {
    watcher.close();
    console.log(chalk.dim('\n  Watch stopped.'));
    process.exit(0);
  });
}

/**
 * Setup auto-mode interactively
 */
async function setupAutoMode(projectRoot: string): Promise<void> {
  const chalk = (await import('chalk')).default;
  const inquirer = (await import('inquirer')).default;
  const autoManager = new AutoModeManager(projectRoot);

  console.log(chalk.bold.cyan('\n⚙️  PhantomindAI — Auto-Mode Setup\n'));

  const current = autoManager.getConfig();

  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'enabled',
      message: 'Enable auto-mode?',
      default: current.enabled,
    },
    {
      type: 'confirm',
      name: 'auto_learn',
      message: 'Auto-learn on file changes?',
      default: current.auto_learn,
      when: (ans: any) => ans.enabled,
    },
    {
      type: 'confirm',
      name: 'auto_sync',
      message: 'Auto-sync adapters after learning?',
      default: current.auto_sync,
      when: (ans: any) => ans.enabled && ans.auto_learn,
    },
    {
      type: 'confirm',
      name: 'agent_suggestions',
      message: 'Show AI improvement suggestions?',
      default: current.agent_suggestions,
      when: (ans: any) => ans.enabled,
    },
    {
      type: 'confirm',
      name: 'auto_apply',
      message: 'Automatically apply suggestion changes? (requires approval method)',
      default: current.auto_apply,
      when: (ans: any) => ans.enabled && ans.agent_suggestions,
    },
    {
      type: 'list',
      name: 'approval_method',
      message: 'How should changes be approved?',
      choices: [
        { name: 'Prompt for each change', value: 'prompt' },
        { name: 'Auto-approve only safe changes', value: 'auto' },
        { name: 'Manual review (ask me to review)', value: 'manual-review' },
      ],
      default: current.approval_method,
      when: (ans: any) => ans.enabled && ans.auto_apply,
    },
  ]);

  const updates: any = {};
  if (answers.enabled !== undefined) updates.enabled = answers.enabled;
  if (answers.auto_learn !== undefined) updates.auto_learn = answers.auto_learn;
  if (answers.auto_sync !== undefined) updates.auto_sync = answers.auto_sync;
  if (answers.agent_suggestions !== undefined) updates.agent_suggestions = answers.agent_suggestions;
  if (answers.auto_apply !== undefined) updates.auto_apply = answers.auto_apply;
  if (answers.approval_method !== undefined) updates.approval_method = answers.approval_method;

  await autoManager.updateConfig(updates);

  console.log('');
  console.log(chalk.green('✅ Auto-mode configured!\n'));
  console.log(chalk.dim('Configuration saved to .phantomind/auto.config.yaml'));
  console.log('');
  console.log(chalk.bold('Next steps:'));
  console.log(chalk.dim(`  Run ${chalk.white('phantomind watch --auto')} to start auto-watching`));
  console.log(chalk.dim(`  Or add to your workflow with git hooks`));
  console.log('');
}