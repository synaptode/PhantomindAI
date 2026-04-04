/**
 * PhantomindAI — Diagnoser Agent
 * Specialized agent for Root Cause Analysis (RCA) and troubleshooting.
 */

import { ProviderRouter } from '../providers/router.js';
import { ContextEngine } from '../context/engine.js';
import { PhantomConfig, TokenUsage } from '../types.js';

export interface DiagnosticResult {
  rootCause: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  filesInvolved: string[];
  remediation: string;
  suggestedCommand?: string;
  confidence: number;
}

export class DiagnoserAgent {
  constructor(
    private router: ProviderRouter,
    private contextEngine: ContextEngine,
    private config: PhantomConfig
  ) {}

  /**
   * Diagnose an issue based on a symptom or error message
   */
  async diagnose(symptom: string): Promise<DiagnosticResult> {
    const context = await this.contextEngine.getProjectContext({
      maxTokens: 5000,
      includeSkills: true,
      includeRules: true,
    });

    const contextText = context.layers.map(l => l.content).join('\n\n');

    const prompt = `You are an expert software architect and troubleshooter. Your task is to perform a Deep Root Cause Analysis (RCA) for the following symptom in the context of this project.

## Project Context
${contextText}

## Symptom / Error
${symptom}

## Instructions
1. Analyze the project structure and context to identify the MOST LIKELY cause.
2. Consider edge cases, dependency conflicts, and architectural violations.
3. Provide a clear remediation plan with code if applicable.

Respond in exact JSON format:
{
  "rootCause": "Detailed explanation of the root cause.",
  "severity": "low|medium|high|critical",
  "impact": "What parts of the system are affected.",
  "filesInvolved": ["path/to/file1.ts", "path/to/file2.ts"],
  "remediation": "Clear, actionable steps to fix the issue, including code snippets.",
  "suggestedCommand": "Optional shell command to help fix it.",
  "confidence": 0.85
}

Only respond with the JSON.`;

    const response = await this.router.complete({
      prompt,
      temperature: 0.2,
      maxTokens: 2500,
    });

    return this.parseResponse(response.content);
  }

  private parseResponse(content: string): DiagnosticResult {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        rootCause: parsed.rootCause || 'Unknown root cause',
        severity: parsed.severity || 'medium',
        impact: parsed.impact || 'Unknown impact',
        filesInvolved: parsed.filesInvolved || [],
        remediation: parsed.remediation || 'No remediation suggested',
        suggestedCommand: parsed.suggestedCommand,
        confidence: parsed.confidence || 0,
      };
    } catch (e) {
      return {
        rootCause: 'Failed to analyze diagnostic response.',
        severity: 'high',
        impact: 'Unable to determine impact.',
        filesInvolved: [],
        remediation: `Raw response: ${content}`,
        confidence: 0,
      };
    }
  }
}
