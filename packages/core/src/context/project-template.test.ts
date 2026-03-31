import { describe, expect, it } from 'vitest';
import { detectProjectTemplate } from './project-template.js';

describe('detectProjectTemplate', () => {
  it('prefers nextjs when Next.js is detected', () => {
    expect(detectProjectTemplate({
      frameworks: ['React', 'Next.js'],
      entryPoints: [],
      projectType: 'ESM (ES Modules)',
    })).toBe('nextjs-app');
  });

  it('detects node cli from entry points', () => {
    expect(detectProjectTemplate({
      frameworks: [],
      entryPoints: ['demo -> dist/cli.js', 'bin -> dist/index.js'],
      projectType: 'CommonJS',
    })).toBe('node-cli');
  });

  it('detects node library from monorepo/module style projects', () => {
    expect(detectProjectTemplate({
      frameworks: [],
      entryPoints: [],
      projectType: 'Monorepo',
    })).toBe('node-library');
  });
});