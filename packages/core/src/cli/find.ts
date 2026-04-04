/**
 * PhantomindAI — CLI Find Command
 * Semantic search across codebase without API keys.
 */

import { CodebaseEmbedder } from '../context/embedder.js';

export async function findCommand(
  projectRoot: string,
  query: string,
  options: { limit?: number; verbose?: boolean } = {},
): Promise<void> {
  const chalk = (await import('chalk')).default;
  const ora = (await import('ora')).default;

  console.log(chalk.bold.cyan(`\n🔍 PhantomindAI — Semantic Finder\n`));
  console.log(`${chalk.dim('Query:')} ${chalk.italic(query)}\n`);

  const spinner = ora('Searching codebase...').start();

  try {
    const embedder = new CodebaseEmbedder(projectRoot);
    const results = await embedder.search(query, options.limit ?? 5);

    spinner.stop();

    if (results.length === 0) {
      console.log(chalk.yellow('No relevant code found.'));
      return;
    }

    console.log(chalk.bold(`Top Matches (${results.length}):\n`));

    for (const result of results) {
      console.log(`${chalk.bold.green('📄 ' + result.path)} ${chalk.dim(`(Score: ${result.score.toFixed(2)})`)}`);
      
      const snippet = result.snippet.trim();
      const framed = snippet.split('\n').map(l => `  ${chalk.dim('│')} ${l}`).join('\n');
      
      console.log(framed);
      console.log(chalk.dim('  ╰' + '─'.repeat(40)));
      console.log('');
    }
  } catch (error) {
    spinner.fail('Search failed');
    console.error(chalk.red((error as Error).message));
  }
}
