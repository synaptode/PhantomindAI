import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { deepMerge, loadConfig } from './loader.js';

const tempDirs: string[] = [];

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'phantomind-loader-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe('loadConfig', () => {
  it('loads yaml config from .phantomind/config.yaml', async () => {
    const dir = makeTempDir();
    mkdirSync(join(dir, '.phantomind'), { recursive: true });
    writeFileSync(join(dir, '.phantomind', 'config.yaml'), [
      'providers:',
      '  primary:',
      '    name: openai',
      '    model: gpt-4.1-mini',
      'adapters:',
      '  - copilot',
      '  - cursor',
    ].join('\n'));

    const config = await loadConfig(dir);
    expect(config.providers.primary.name).toBe('openai');
    expect(config.adapters).toEqual(['copilot', 'cursor']);
  });

  it('falls back to legacy json config', async () => {
    const dir = makeTempDir();
    writeFileSync(join(dir, 'phantomind.config.json'), JSON.stringify({
      providers: {
        primary: { name: 'groq', model: 'llama-3.3-70b-versatile' },
      },
      adapters: ['copilot'],
    }, null, 2));

    const config = await loadConfig(dir);
    expect(config.providers.primary.name).toBe('groq');
    expect(config.adapters).toEqual(['copilot']);
  });
});

describe('deepMerge', () => {
  it('merges nested objects and replaces arrays', () => {
    const merged = deepMerge(
      { a: { b: 1, c: [1, 2] }, d: true },
      { a: { b: 2, c: [3] } },
    ) as { a: { b: number; c: number[] }; d: boolean };

    expect(merged.a.b).toBe(2);
    expect(merged.a.c).toEqual([3]);
    expect(merged.d).toBe(true);
  });
});