import { describe, expect, it } from 'vitest';
import { TemplateEngine } from './engine.js';

describe('TemplateEngine', () => {
  it('renders scalar variables and array sections', async () => {
    const content = await TemplateEngine.renderRules({
      projectName: 'demo-app',
      primaryLanguage: 'TypeScript',
      framework: 'Node CLI',
      languageRules: ['Use strict mode'],
      frameworkRules: ['Keep commands focused'],
      fileOrganization: ['One command per file'],
      importRules: ['Use node: imports'],
      testingRules: ['Cover branching behavior'],
      branchNaming: 'feature/*',
      commitFormat: 'conventional commits',
      prRequirements: 'Describe behavior changes',
      securityRules: ['Validate input'],
      performanceRules: ['Avoid blocking startup'],
      documentationRules: ['Document command flags'],
      forbiddenPatterns: ['Hidden destructive behavior'],
      customRules: ['Prefer dry-run before destructive actions'],
    });

    expect(content).toContain('# demo-app — AI Rules & Guidelines');
    expect(content).toContain('Use strict mode');
    expect(content).toContain('Hidden destructive behavior');
    expect(content).toContain('Prefer dry-run before destructive actions');
  });
});