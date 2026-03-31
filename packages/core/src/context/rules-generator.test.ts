import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { generateRulesContent } from './rules-generator.js';

const tempDirs: string[] = [];

function makeProject(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'phantomind-rules-'));
  tempDirs.push(dir);
  for (const [path, content] of Object.entries(files)) {
    const fullPath = join(dir, path);
    mkdirSync(fullPath.slice(0, fullPath.lastIndexOf('/')), { recursive: true });
    writeFileSync(fullPath, content);
  }
  mkdirSync(join(dir, '.phantomind', 'memory'), { recursive: true });
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe('generateRulesContent', () => {
  it('uses explicit template and project config signals', async () => {
    const dir = makeProject({
      'package.json': JSON.stringify({
        name: 'demo-cli',
        type: 'module',
        scripts: { build: 'tsc', test: 'vitest' },
        bin: { demo: 'dist/index.js' },
        dependencies: { commander: '^13.1.0' },
        devDependencies: { typescript: '^5.8.2', vitest: '^3.1.1' },
      }, null, 2),
      'tsconfig.json': JSON.stringify({
        compilerOptions: { strict: true, noImplicitAny: true, module: 'NodeNext' },
      }, null, 2),
      'eslint.config.js': 'export default [{ rules: { "no-console": "error", "import/order": "error", "@typescript-eslint/consistent-type-imports": "error" } }];',
      'src/index.ts': 'import { Command } from "commander";\nexport const cli = new Command();\n',
    });

    const content = await generateRulesContent(dir, { template: 'node-cli' });

    expect(content).toContain('# demo-cli — AI Rules & Guidelines');
    expect(content).toContain('Keep command handlers focused and side-effect boundaries clear.');
    expect(content).toContain('Do not weaken strict TypeScript compiler options.');
    expect(content).toContain('Use type-only imports when importing types.');
    expect(content).toContain('Console logging in production code paths');
  });
});