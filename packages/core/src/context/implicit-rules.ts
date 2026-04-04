/**
 * PhantomindAI — Implicit Rules Engine
 * Maps tech stacks and features to framework-specific best practices.
 */

import type { TechStackInfo } from './learner.js';

export interface ImplicitRule {
  id: string;
  framework: string;
  rule: string;
  reasoning: string;
  check?: (ts: TechStackInfo) => boolean;
}

const FRAMEWORK_RULES: ImplicitRule[] = [
  // React
  {
    id: 'react-hooks',
    framework: 'React',
    rule: 'Use functional components and hooks. Avoid class components.',
    reasoning: 'Modern React standard for better readability and performance.',
  },
  {
    id: 'react-key-props',
    framework: 'React',
    rule: 'Always provide unique "key" props when rendering lists.',
    reasoning: 'Crucial for Reacts reconciliation algorithm and performance.',
  },
  // Next.js
  {
    id: 'nextjs-app-router',
    framework: 'Next.js',
    rule: 'Use App Router patterns (app/ directory). Use Server Components by default.',
    reasoning: 'Project detected as using Next.js App Router architecture.',
    check: (ts) => ts.architectureStyle === 'Feature-based' && ts.frameworks.includes('Next.js'),
  },
  {
    id: 'nextjs-use-client',
    framework: 'Next.js',
    rule: 'Add "use client" directive at the top of files that use hooks or browser APIs.',
    reasoning: 'Required for client-side interactivity in Next.js App Router.',
    check: (ts) => ts.frameworks.includes('Next.js'),
  },
  // NestJS
  {
    id: 'nestjs-di',
    framework: 'NestJS',
    rule: 'Use Dependency Injection via constructors for services and repositories.',
    reasoning: 'Core architectural principle of NestJS for testability and decoupling.',
  },
  {
    id: 'nestjs-decorators',
    framework: 'NestJS',
    rule: 'Use decorators (@Controller, @Get, @Injectable) consistently.',
    reasoning: 'Standard NestJS way of defining metadata and routing.',
  },
  // TypeScript
  {
    id: 'ts-strict',
    framework: 'TypeScript',
    rule: 'Avoid "any" type. Use unknown or specific interfaces/types.',
    reasoning: 'Maintains type safety and prevents runtime errors.',
  },
];

/**
 * Get implicit rules based on the current tech stack
 */
export function getImplicitRules(ts: TechStackInfo): string[] {
  const activeRules: string[] = [];

  for (const rule of FRAMEWORK_RULES) {
    const frameworkMatch = ts.frameworks.some(f => f.toLowerCase() === rule.framework.toLowerCase()) ||
                           ts.languages.some(l => l.toLowerCase() === rule.framework.toLowerCase());

    if (frameworkMatch) {
      if (!rule.check || rule.check(ts)) {
        activeRules.push(`- **[${rule.framework}]**: ${rule.rule}`);
      }
    }
  }

  // Feature specific context
  if (ts.activeFeature) {
    activeRules.push(`- **[Feature Context]**: You are currently working on the "${ts.activeFeature}" feature. Ensure your changes stay localized to this domain.`);
  }

  return activeRules;
}
