# 🔮 PhantomindAI

**Universal AI Development Enhancement Layer with Real-Time Automation**

> *"You already pay for Copilot, Cursor, or Claude. PhantomindAI makes what you already have 10x more effective — automatically."*

[![npm version](https://img.shields.io/npm/v/@phantomind/core.svg)](https://www.npmjs.com/package/@phantomind/core)
[![npm downloads](https://img.shields.io/npm/dm/@phantomind/core.svg)](https://www.npmjs.com/package/@phantomind/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js >=18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org)
[![MCP Compatible](https://img.shields.io/badge/MCP-compatible-purple)](https://modelcontextprotocol.io)

---

## What is PhantomindAI?

PhantomindAI solves the **context amnesia problem**: AI assistants forget everything about your project every session, every context switch, and every time a new team member onboards.

### Core Features

- **Persistent context layer** — one source of truth (`SKILLS.md`, `RULES.md`, `schema.json`) synced to every AI assistant automatically
- **Real-time automation (v0.5.0+)** — watch files, auto-learn changes, suggest improvements, and apply changes without manual commands
- **Universal LLM abstraction** — one API for Anthropic, OpenAI, Gemini, Groq, Mistral, Ollama, DeepSeek, and OpenRouter with automatic fallback and budget routing
- **Agentic task execution** — multi-role agent orchestration (architect, implementer, security reviewer, test writer, documenter) with human-in-the-loop checkpoints
- **AI output quality enforcement** — secret scanning, hallucination detection, dual-model verification, consistency checking
- **MCP Server** — expose project intelligence as a Model Context Protocol server for Cursor, Continue, Claude Code, and more
- **Full observability** — cost tracking, audit trails, and analytics dashboard
- **Multi-adapter support** — sync to GitHub Copilot, Cursor, Cline, Continue, Windsurf, Zed, Aider, Claude Code, and more

---

## Table of Contents

- [Installation](#installation)
- [Quick Start (30 seconds)](#quick-start-30-seconds)
- [Real-Time Automation (v0.5.0)](#real-time-automation-v050)
- [CLI Reference](#cli-reference)
- [Configuration](#configuration)
- [Supported AI Assistants](#supported-ai-assistants)
- [Supported LLM Providers](#supported-llm-providers)
- [Programmatic API](#programmatic-api)
- [MCP Server](#mcp-server)
- [Agent System](#agent-system)
- [Quality Layer](#quality-layer)
- [Observability](#observability)
- [Real-World Workflows](#real-world-workflows)
- [Architecture](#architecture)
- [Development](#development)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Installation

```bash
# Install globally (recommended — enables `phantomind` CLI)
npm install -g @phantomind/core

# Or install as a project dependency
npm install @phantomind/core

# Verify
phantomind --version
```

**Requirements:** Node.js ≥ 18

---

## Quick Start (30 seconds)

### Step 1: Initialize

```bash
npx phantomind init
```

### Step 2: (Optional) Set up real-time automation

```bash
npx phantomind watch --setup
```

This guides you through automating context learning, syncing, AI suggestions, and change application on every file save. **Skip this if you prefer manual control.**

### Step 3: Start using with your AI tool

With manual mode:
```bash
phantomind sync          # Sync to all AI adapters once
phantomind watch --sync  # Keep context in sync as you work
```

With automation (if configured):
```bash
phantomind watch --auto  # Full automation: learn, suggest, apply changes
```

Or just keep your AI assistant open — PhantomindAI's embedded learning will run in the background.

---

## Real-Time Automation (v0.5.0)

PhantomindAI v0.5.0 introduces **complete real-time automation**: initialize once, then everything happens automatically as you code.

### How It Works

1. **File Watcher**: Monitors changes in your project (configurable patterns)
2. **Auto-Learn**: Detects new patterns and updates SKILLS.md
3. **Auto-Sync**: Pushes changes to all AI adapters (Copilot, Cursor, etc.)
4. **AI Agent**: Analyzes diffs and suggests improvements
5. **Auto-Apply**: Applies approved changes without manual intervention

### Setup for Full Automation

```bash
# Interactive setup — configures everything in one command
phantomind watch --setup
```

You'll be prompted for:
- Enable real-time automation? (`yes`/`no`)
- What triggers learning? (file save, git commit, manual)
- Auto-apply changes? (prompt, auto, manual-review)
- Debounce time (milliseconds between checks)
- Max changes per run (safety limit)

Result: `.phantomind/auto.config.yaml` is created and persisted.

### Manual Configuration

Edit `.phantomind/auto.config.yaml`:

```yaml
# .phantomind/auto.config.yaml
enabled: true
on_save: true                    # Watch files on save
watch_patterns:                  # Glob patterns to monitor
  - 'src/**/*.{ts,tsx,js,jsx}'
  - 'lib/**/*.{ts,js}'
  - 'pages/**/*'

auto_learn: true                 # Auto-learn new patterns
auto_sync: true                  # Auto-sync to adapters
agent_suggestions: true          # Get AI improvement suggestions
auto_apply: false                # Manual approval required
approval_method: prompt          # Options: prompt|auto|manual-review

debounce_ms: 1000                # Wait 1s before processing
max_changes_per_run: 5           # Limit changes per trigger
```

### Running Automation

Once configured:

```bash
# Full automation respecting your config
phantomind watch --auto

# Or with all flags explicit
phantomind watch --auto --sync --agent --auto-apply

# With additional verbose output
phantomind watch --auto --sync --agent --auto-apply --verbose

# Run as daemon (background process)
phantomind watch --auto --daemon
```

### Approval Workflows

**approval_method: `prompt`** (default)
- Shows each suggestion before applying
- You can accept, skip, or review each change

**approval_method: `auto`**
- Applies changes automatically
- All changes logged to `.phantomind/audit/changes-*.json` for review

**approval_method: `manual-review`**
- Generates suggestions without applying
- You manually review and apply via `phantomind apply-changes [id]`

### Change Approval Flow

```bash
# Watch and suggest (no automatic changes)
phantomind watch --agent
# Shows suggestions in terminal

# When ready, review and apply
phantomind apply-changes --preview
# Shows all pending changes

# Apply specific change set
phantomind apply-changes [change-set-id]
```

### Disabling Automation

```bash
# Temporarily disable auto-mode this session
phantomind watch --auto --disabled

# Permanently disable in config
# Edit .phantomind/auto.config.yaml: enabled: false

# Or reset to manual control
phantomind init --reset-automation
```

### Automation Audit Trail

All automatic actions are logged:

```bash
# View recent auto-applied changes
cat .phantomind/audit/changes-latest.json

# View all automation activity
phantomind audit --type automation

# View with filtering
phantomind audit --type automation --period week --format json
```

### Real-World Example: Workflow

**Initial Setup (one time)**

```bash
$ phantomind init
$ phantomind watch --setup
? Enable real-time automation? (y/n) y
? What to automate? (select all) learn, sync, suggestions, apply
? Approval method? (prompt/auto) prompt
✓ Configuration saved to .phantomind/auto.config.yaml
```

**Daily Development**

```bash
# In terminal 1: Start automation
$ phantomind watch --auto
☝ Watching src/ for changes
⚙️  Auto-mode: enabled (learn, sync, suggest, apply on prompt)
🔄 Debounce: 1000ms | Max changes: 5

# No prompts needed for most changes — work in VSCode/IDE

# When you save a file:
# 1. PhantomindAI detects change (after 1s debounce)
# 2. Learns new patterns → updates SKILLS.md
# 3. Syncs to Copilot, Cursor, etc.
# 4. Analyzes changes for improvements
# 5. Shows suggestions in terminal
# 6. (If approval_method=prompt) Waits for your response
# 7. Applies approved changes

# In VSCode: Just keep using Copilot/Cursor as normal
# Both you AND the AI can make changes
# Context stays perfectly synced
```

**Audit Review (end of day)**

```bash
# See what automation did today
$ phantomind audit --type automation --period today
┌────────────────────────────────────────┐
│ Automation Activity - Today             │
├────────────────────────────────────────┤
│ Auto-learned patterns: 8 updates       │
│ Sync operations: 12 completed          │
│ AI suggestions: 23 generated           │
│ Changes applied: 18 approved, 5 skipped│
│ Cost: $0.42 today                      │
└────────────────────────────────────────┘
```

---

## CLI Reference

```
phantomind [command] [options]
```

### Command Summary

| Command | Description | New in v0.5.0? |
|---------|-------------|--------|
| `phantomind init` | Initialize PhantomindAI in the current project | ✓ |
| `phantomind learn` | Scan codebase and regenerate learned project context | ✓ |
| `phantomind sync` | Sync context to all configured AI assistant adapters | |
| `phantomind diff` | Preview adapter output diffs without writing files | |
| `phantomind context` | Preview ranked context or search context sections | |
| `phantomind compare` | Compare generated adapter payloads | |
| `phantomind watch` | **NEW**: Watch project files & auto-learn/sync/apply | ✓ |
| `phantomind apply-changes` | **NEW**: Manually review and apply AI-suggested changes | ✓ |
| `phantomind hooks` | Install git hooks to keep context in sync | |
| `phantomind serve` | Start the MCP server (stdio or HTTP transport) | |
| `phantomind dashboard` | Start the observability dashboard server | |
| `phantomind eval` | Test and benchmark LLM provider connections | |
| `phantomind validate [files...]` | Scan code for secrets, hallucinations, and consistency issues | |
| `phantomind audit` | View cost reports, automation activity, and audit trail | |
| `phantomind stats` | Display project context statistics | |
| `phantomind agent <task>` | Execute an agentic task from the CLI | |
| `phantomind schema [name]` | List or display schema definitions | |
| `phantomind check` | Run pre-flight doctor: verify setup, adapters, provider & security | |
| `phantomind upgrade` | Self-update to the latest published version | |

### `phantomind init`

```bash
phantomind init [options]

Options:
  --provider <name>   Optional LLM provider for agent/eval workflows
  --adapters <list>   Space-separated adapter list (e.g. copilot cursor cline)
  --template <name>   auto|default|node-library|node-cli|react-app|nextjs-app
  --guided            Interactive setup wizard (recommended for first-time users)
  --diagnose          Run health check during initialization
  --yes               Skip interactive prompts
  --reset-automation  Reset automation config to defaults
```

### `phantomind learn`

```bash
phantomind learn [options]

Options:
  --sync              Run adapter sync after learning
  --packages          Only learn package/dependency information (faster)
  --only-changes      Only learn from changed files since last learn
  --verbose           Show detailed output
```

### `phantomind sync`

```bash
phantomind sync [options]

Options:
  --adapters <list>   Only sync specific adapters
  --dry-run           Preview changes without writing files
  --diagnose          Run health check after sync
  --verbose           Show per-file diff
```

### `phantomind diff`

```bash
phantomind diff [options]

Options:
  --adapters <list>   Only diff specific adapters
  --verbose           Show full diff output
```

### `phantomind context`

```bash
phantomind context [options]

Options:
  --file <path>       Rank context for a specific file
  --search <query>    Search across context sections
  --max-tokens <n>    Token budget for preview output
  --json              Emit raw JSON
```

### `phantomind compare`

```bash
phantomind compare [options]

Options:
  --adapters <list>   Only compare specific adapters
  --preview           Show generated content preview
```

### `phantomind watch`

**NEW IN v0.5.0** — Real-time file watcher with optional automation.

```bash
phantomind watch [options]

Options:
  --sync              Automatically run sync after detecting changes
  --auto              Enable full automation (learn + sync + agent suggestions + auto-apply)
  --agent             Enable AI agent suggestions (requires --auto or independent use)
  --auto-apply        Automatically apply suggested changes (requires --agent)
  --setup             Interactive wizard to configure automation settings
  --daemon            Run as background process (logs to .phantomind/logs/)
  --verbose           Show detailed output including all file changes
  --only-changes      When using auto-learn, only learn changed files (faster)
  --disabled          Temporarily disable automation this session (config-agnostic)
```

**Examples:**

```bash
# Interactive configuration (first time)
phantomind watch --setup

# Full automation from configured settings
phantomind watch --auto

# Watch with just sync (no agent suggestions)
phantomind watch --sync

# Watch with agent suggestions but prompt before applying
phantomind watch --agent

# Watch with full automation + verbose logging
phantomind watch --auto --verbose

# Run as background daemon (useful in CI/CD or terminal multiplexers)
phantomind watch --auto --daemon

# Temporarily disable automation this session
phantomind watch --auto --disabled

# Rerun and only learn changed files (faster for large projects)
phantomind watch --auto --verbose --only-changes

# Preview suggestions without applying anything
phantomind watch --agent --verbose
```

**Output Example:**

```
☝ Watching src/ for changes...
⚙️  Auto-mode: ENABLED
   ├─ Auto-learn: true
   ├─ Auto-sync: true
   ├─ Agent suggestions: true
   └─ Auto-apply: prompt

🔄 Debounce: 1000ms | Max changes: 5

[12:34:56] Detected change: src/auth/jwt.ts
[12:35:57] ✓ Learning complete (patterns: +2, total: 45)
[12:35:58] ✓ Sync complete (Copilot, Cursor, Continue)
[12:35:59] 🤖 Agent suggestions (priority: 2):
   1. Add input validation to verifyToken()
      Cost: $0.012 | Risk: low
   2. Extract constants from jwt.ts → constants.ts
      Cost: $0.008 | Risk: very-low

? Apply suggestions? [y]es [n]o [r]eview: r
[12:36:02] → Reviewing change 1: Add input validation...
? Apply this change? (y/n) y
[12:36:05] ✓ Applied: Add input validation to verifyToken()
[12:36:06] 💾 Saved .phantomind/audit/changes-1234567890.json
```

### `phantomind apply-changes`

**NEW IN v0.5.0** — Manually review and apply saved change suggestions.

```bash
phantomind apply-changes [options]

Options:
  --preview           Show all pending changes without applying
  --list              List recent change sets
  [change-set-id]     Apply a specific change set
  [--force]           Skip confirmation prompts
```

### `phantomind hooks`

```bash
phantomind hooks [options]

Options:
  --force             Overwrite existing git hooks
```

### `phantomind serve` (MCP Server)

```bash
phantomind serve [options]

Options:
  --transport <type>  stdio|http (default: stdio)
  --port <n>          HTTP port (default: 3333)
  --host <host>       HTTP host (default: 127.0.0.1)
  --stdio-mode        Use stdio transport (default for pipes)
```

### `phantomind dashboard`

```bash
phantomind dashboard [options]

Options:
  --port <n>          Server port (default: 3101)
  --host <host>       Server host (default: 127.0.0.1)
  --ui <path>         Path to built dashboard assets
  --cors              Enable CORS for local development
  --token <token>     Require token for API access
  --token-env <name>  Env var containing dashboard token
  --token-query <q>   Optional query parameter name for token auth
```

### `phantomind validate`

```bash
phantomind validate [files...] [options]

Options:
  --no-secrets         Skip secret scanning
  --no-hallucinations  Skip hallucination detection
  --no-consistency     Skip consistency checking
  --fix                Auto-fix detected secrets (redaction)
```

### `phantomind audit`

```bash
phantomind audit [options]

Options:
  --type <t>          dashboard|costs|actions|automation (default: dashboard)
  --period <p>        today|week|month|all (default: today)
  --format <f>        terminal|markdown|json
```

### `phantomind eval`

```bash
phantomind eval [options]

Options:
  --provider <name>   Specific provider to test
  --all               Test all configured providers
  --benchmark         Run performance benchmarks
```

### `phantomind stats`

```bash
phantomind stats [options]

Options:
  --detailed          Show extended statistics
  --json              Emit raw JSON
  --period <p>        today|week|month|all (default: today)
```

### `phantomind check`

```bash
phantomind check [options]

Options:
  --fix               Attempt to auto-fix simple issues
  --json              Output results as JSON (useful for CI)
```

Runs comprehensive pre-flight diagnostics:
- Node.js version compatibility
- `.phantomind/` directory and key files (config, SKILLS.md, RULES.md)
- API key / provider configuration
- Adapter sync status
- Security (`.env` gitignored)
- Automation configuration (v0.5.0+)

### `phantomind upgrade`

```bash
phantomind upgrade
```

Checks npm for the latest `@phantomind/core` release and upgrades the global installation automatically.

### `phantomind schema`

```bash
phantomind schema [name] [options]

Options:
  --list              List all available schemas
  --json              Emit schema as JSON
  --zod               Emit schema as Zod code
```

### `phantomind agent`

```bash
phantomind agent <task> [options]

Options:
  --role <role>       architect|implementer|securityReviewer|testWriter|documenter
  --orchestrate       Use multi-role orchestration
  --roles <list>      Comma-separated roles (e.g. architect,implementer,testWriter)
  --max-steps <n>     Maximum agent steps (default: 30)
```

---

## Configuration

PhantomindAI is configured via `.phantomind/config.yaml`:

```yaml
# .phantomind/config.yaml

providers:
  primary:
    name: anthropic
    model: claude-opus-4-5
    apiKey: ${ANTHROPIC_API_KEY}
  fallback:
    name: openai
    model: gpt-4o
    apiKey: ${OPENAI_API_KEY}
  budget:
    name: groq
    model: llama-3.3-70b-versatile
    apiKey: ${GROQ_API_KEY}

adapters:
  - copilot
  - cursor
  - cline
  - continue

mcp:
  enabled: true
  port: 3333

budget:
  maxCostPerDay: 5.00
  warningAt: 0.80
  fallbackOnBudget: budget

agent:
  maxSteps: 30
  memory:
    enabled: true
    maxEntries: 200

quality:
  secretScanning: true
  hallucinationDetection: true
  dualVerification: false
```

### Environment Variables

| Variable | Provider |
|----------|----------|
| `ANTHROPIC_API_KEY` | Anthropic (Claude) |
| `OPENAI_API_KEY` | OpenAI (GPT) |
| `GEMINI_API_KEY` | Google Gemini |
| `GROQ_API_KEY` | Groq |
| `MISTRAL_API_KEY` | Mistral |
| `DEEPSEEK_API_KEY` | DeepSeek |
| `OPENROUTER_API_KEY` | OpenRouter |

Provider-backed commands load `.phantomind/.env` when present. Core flows like `init`, `learn`, `sync`, `diff`, and `context` do not require API keys.

### Dashboard UI

If you build the optional Angular dashboard package, PhantomindAI can serve both the API and the static UI:

```bash
npm run dashboard:build
phantomind dashboard
```

Without a built UI, `phantomind dashboard` still starts an API-only observability server.

---

## Supported AI Assistants

| Adapter | File Generated | Status |
|---------|---------------|--------|
| GitHub Copilot | `.github/copilot-instructions.md` | ✅ |
| Cursor | `.cursorrules` | ✅ |
| Cline | `.clinerules` | ✅ |
| Continue | `.continue/config.json` | ✅ |
| Windsurf | `.windsurfrules` | ✅ |
| Zed | `.zed/settings.json` | ✅ |
| Aider | `.aider.conf.yml` | ✅ |
| Claude Code | `.claude/CLAUDE.md` | ✅ |
| OpenAI Codex | `AGENTS.md` | ✅ |

---

## Supported LLM Providers

| Provider | Models | Notes |
|----------|--------|-------|
| **Anthropic** | claude-opus-4-5, claude-sonnet-4-5, claude-haiku-3-5 | Recommended primary |
| **OpenAI** | gpt-4o, gpt-4o-mini, o3, o4-mini | Excellent fallback |
| **Google Gemini** | gemini-2.0-flash, gemini-2.5-pro | Best for large context |
| **Groq** | llama-3.3-70b, mixtral-8x7b | Best budget option |
| **Mistral** | mistral-large-latest, codestral | Strong for code |
| **Ollama** | any local model | No API key, fully local |
| **DeepSeek** | deepseek-chat, deepseek-reasoner | Cost-efficient |
| **OpenRouter** | 200+ models | Meta-provider |

### Provider Routing

```yaml
providers:
  primary:   # Highest quality — used by default
    name: anthropic
    model: claude-opus-4-5
  fallback:  # Used if primary fails
    name: openai
    model: gpt-4o
  budget:    # Used when daily cost threshold exceeded
    name: groq
    model: llama-3.3-70b-versatile
  local:     # Used for offline/sensitive tasks
    name: ollama
    model: llama3.2
```

---

## Programmatic API

```typescript
import { phantom } from '@phantomind/core';

// Initialize (loads config, connects providers)
await phantom.init();

// Get project context (intelligent multi-layer Context)
const ctx = await phantom.ctx({ maxTokens: 4000 });

// Complete with context injection and auto-routing
const response = await phantom.complete('Explain the auth module', {
  maxTokens: 1000,
  temperature: 0.3,
});

// Complete with intelligent retry on failure
const result = await phantom.completeWithRetry('Implement JWT refresh logic');

// Run an agentic task (single role)
const agentResult = await phantom.agent('Refactor the payment service to use dependency injection', {
  role: 'implementer',
  maxSteps: 25,
});

// Multi-agent orchestration
const orchestrated = await phantom.orchestrate(
  'Build a rate limiting middleware',
  ['architect', 'implementer', 'securityReviewer', 'testWriter'],
);

// Semantic search across codebase
const matches = await phantom.search('database connection pooling', 5);
// returns: Array<{ path, score, snippet }>

// Sync adapters
await phantom.sync(['copilot', 'cursor'], /* dryRun */ false);

// Validate code
const { secrets, hallucinations } = await phantom.validate(code, 'auth.ts');

// Cost report
const costs = phantom.costs('today'); // 'today' | 'week' | 'month' | 'all'

// Analytics dashboard
const dashboard = phantom.dashboard();
console.log(dashboard.formatTerminal());

// Learn project patterns
const skills = await phantom.learn();

// Save state
await phantom.save();
```

---

## MCP Server

PhantomindAI exposes a [Model Context Protocol](https://modelcontextprotocol.io) server providing 9 tools to any MCP-compatible AI assistant:

```bash
phantomind serve
```

### MCP Tools

| Tool | Description |
|------|-------------|
| `get_project_context` | Full project context (skills, rules, schema) |
| `search_codebase` | Semantic search across indexed files |
| `validate_code` | Secret + hallucination scan |
| `get_schema` | Retrieve a named JSON/Zod schema |
| `list_schemas` | List all registered schemas |
| `complete` | LLM completion via provider router |
| `run_agent` | Execute an agentic task |
| `get_cost_report` | Current cost breakdown |
| `get_audit_log` | Recent audit entries |

### MCP Configuration (Claude Desktop / Continue)

```json
{
  "mcpServers": {
    "phantomind": {
      "command": "npx",
      "args": ["phantomind", "serve"],
      "cwd": "/path/to/your/project"
    }
  }
}
```

---

## Agent System

### Roles

| Role | Specialization |
|------|---------------|
| `architect` | System design, architecture decisions, dependency planning |
| `implementer` | Feature implementation, code generation, refactoring |
| `securityReviewer` | Vulnerability scanning, threat modeling, secure coding |
| `testWriter` | Unit tests, integration tests, edge cases, mocks |
| `documenter` | API docs, README, inline comments, changelogs |

### Single-Agent Execution

```bash
phantomind agent "Add rate limiting to the API" --role implementer --max-steps 20
```

### Multi-Agent Orchestration

```bash
phantomind agent "Build OAuth2 integration" --orchestrate \
  --roles architect,implementer,securityReviewer,testWriter
```

Orchestration phases run sequentially with output aggregation between phases.

### Task Queue (Programmatic)

```typescript
import { phantom } from '@phantomind/core';

await phantom.init();

// Enqueue tasks
phantom.enqueue('Refactor database layer', { role: 'implementer', priority: 'high' });
phantom.enqueue('Write migration tests', { role: 'testWriter', priority: 'normal' });
```

---

## Quality Layer

### Secret Scanning

Detects and redacts API keys, tokens, passwords, and credentials:

```bash
phantomind validate src/ --secrets
```

Detects: AWS keys, GitHub tokens, Stripe keys, OpenAI keys, JWT secrets, PEM certificates, database connection strings, and 20+ other patterns.

### Hallucination Detection

Checks AI-generated code for:
- `import` statements referencing non-existent packages
- References to files that don't exist in the project
- Usage of type names not defined in the codebase

### Consistency Checking

Identifies inconsistencies across the codebase:
- Naming convention violations (camelCase vs snake_case drift)
- Mixed async patterns (callbacks vs promises vs async/await)
- Architectural boundary violations

### Dual-Model Verification

For critical outputs, a second model independently verifies correctness before acceptance.

---

## Observability

### Cost Tracking

```bash
phantomind audit --type costs --period week
```

Tracks cost per provider, per model, per day with budget alerts.

### Audit Trail

All agent actions are logged to `.phantomind/audit/audit.jsonl`:

```bash
phantomind audit --type actions
```

### Analytics Dashboard

```bash
phantomind audit --type dashboard
```

Displays: request count, total cost, success rate, response time, quality events, agent task completion.

---

## Architecture

```
packages/core/src/
├── types.ts              ← All shared TypeScript interfaces
├── index.ts              ← PhantomMind class + phantom singleton
│
├── config/               ← Config loading (cosmiconfig, .env, deep-merge)
├── providers/            ← LLM provider abstractions + router
│   ├── anthropic.ts
│   ├── openai.ts
│   ├── gemini.ts
│   ├── groq.ts
│   ├── mistral.ts
│   ├── ollama.ts
│   ├── deepseek.ts
│   ├── openrouter.ts
│   └── router.ts         ← Budget routing + fallback + EventEmitter
│
├── context/              ← Project context management
│   ├── engine.ts         ← Context orchestration
│   ├── embedder.ts       ← TF-IDF codebase indexer + semantic search
│   ├── learner.ts        ← Pattern learning → SKILLS.md generation
│   └── versioning.ts     ← SHA-256 change tracking
│
├── adapters/             ← AI assistant adapter sync
│   ├── base.ts
│   ├── copilot.ts, cursor.ts, cline.ts, continue.ts
│   ├── windsurf.ts, zed.ts, aider.ts, claude-code.ts, codex.ts
│   └── index.ts          ← syncAllAdapters()
│
├── mcp/                  ← MCP Server (9 tools)
│   └── server.ts
│
├── agent/                ← Agentic execution engine
│   ├── executor.ts       ← Single-agent loop (plan→act→verify)
│   ├── orchestrator.ts   ← Multi-agent orchestration
│   ├── decomposer.ts     ← Task decomposition (4 phases)
│   ├── roles.ts          ← Role system prompts
│   ├── memory.ts         ← Cross-session persistent memory
│   ├── retry.ts          ← 5 retry strategies
│   ├── queue.ts          ← Priority queue + cron scheduler
│   └── index.ts
│
├── quality/              ← Output quality enforcement
│   ├── secret-scanner.ts
│   ├── hallucination-guard.ts
│   ├── consistency.ts
│   ├── dual-verifier.ts
│   ├── regression.ts
│   └── anomaly.ts
│
├── schemas/              ← Schema registry (Zod + JSON Schema)
│   ├── registry.ts
│   └── index.ts          ← 7 prebuilt schemas
│
├── templates/            ← SKILLS.md + RULES.md templates
│   ├── SKILLS.template.md
│   ├── RULES.template.md
│   └── engine.ts
│
├── observability/        ← Audit, cost, dashboard
│   ├── audit.ts
│   ├── cost-tracker.ts
│   └── dashboard.ts
│
└── cli/                  ← CLI commands (Commander.js)
    ├── main.ts
    ├── init.ts, sync.ts, serve.ts, eval.ts
    ├── validate.ts, audit.ts, stats.ts, agent.ts
    └── index.ts
```

---

## Development

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Setup

```bash
git clone https://github.com/your-username/PhantomindAI
cd PhantomindAI
npm install
```

### Commands

```bash
# Build TypeScript
make build

# Watch mode (rebuild on changes)
make dev

# Run CLI locally (without building)
make run CMD="init"

# Run tests
make test

# Clean build artifacts
make clean

# Full rebuild
make rebuild

# Check types without emitting
make typecheck
```

### Project Structure

```
PhantomindAI/
├── packages/
│   └── core/           ← @phantomind/core package
│       ├── src/
│       ├── dist/       ← Built output (gitignored)
│       ├── package.json
│       └── tsconfig.json
├── docs/
│   └── PhantomMindAI_PRD.md
├── package.json         ← Monorepo root
├── tsconfig.json
├── Makefile
└── README.md
```

---

## Tutorial Lengkap

Panduan komprehensif langkah demi langkah tersedia di **[docs/TUTORIAL.md](docs/TUTORIAL.md)**, mencakup:

| # | Topik |
|---|-------|
| 1 | [Persiapan & Instalasi](docs/TUTORIAL.md#1-persiapan--instalasi) |
| 2 | [Inisialisasi Project Pertama](docs/TUTORIAL.md#2-inisialisasi-project-pertama) |
| 3 | [Memahami Struktur File](docs/TUTORIAL.md#3-memahami-struktur-file) |
| 4 | [Konfigurasi Provider LLM](docs/TUTORIAL.md#4-konfigurasi-provider-llm) |
| 5 | [Sync ke AI Assistant](docs/TUTORIAL.md#5-sync-ke-ai-assistant) |
| 6 | [Menggunakan CLI](docs/TUTORIAL.md#6-menggunakan-cli) |
| 7 | [Penggunaan Programmatic API](docs/TUTORIAL.md#7-penggunaan-programmatic-api) |
| 8 | [Sistem Agent](docs/TUTORIAL.md#8-sistem-agent) |
| 9 | [MCP Server](docs/TUTORIAL.md#9-mcp-server) |
| 10 | [Quality Validation](docs/TUTORIAL.md#10-quality-validation) |
| 11 | [Observability & Cost Tracking](docs/TUTORIAL.md#11-observability--cost-tracking) |
| 12 | [Schema Registry](docs/TUTORIAL.md#12-schema-registry) |
| 13 | [Workflow Tim](docs/TUTORIAL.md#13-workflow-tim) |
| 14 | [Tips & Trik](docs/TUTORIAL.md#14-tips--trik) |
| 15 | [Troubleshooting](docs/TUTORIAL.md#15-troubleshooting) |

---

## Real-World Workflows

### Workflow 1: Solo Developer with Automation

**Goal**: Maximize productivity with minimal commands.

```bash
# Day 1: Setup
$ npm install -g @phantomind/core
$ cd my-project
$ phantomind init                    # Initialize context
$ phantomind watch --setup           # Configure automation
? Full automation? (y/n) y
? Approval method? (prompt/auto) auto
✓ Configuration complete

# Day 2+: Just code
$ phantomind watch --auto --daemon   # Start as background daemon
# Now whenever you save:
#   1. SKILLS.md auto-learns patterns
#   2. Copilot/Cursor are synced automatically
#   3. AI suggests improvements
#   4. Changes auto-apply (with audit trail)

# End of day: Review what happened
$ phantomind audit --type automation --period today
```

### Workflow 2: Team Project with Manual Control

**Goal**: Team alignment with explicit approval steps.

```bash
# Setup (team lead)
$ phantomind init
$ phantomind watch --setup
? Full automation? (y/n) n
? Just watch and sync? (y/n) y

# In CI/CD pipeline (GitHub Actions example):
- name: Keep context in sync
  run: |
    phantomind sync --dry-run          # Preview changes
    phantomind sync                   # Apply changes
    git add .github/copilot-instructions.md
    git commit -m "chore: update AI context"
    git push

# Day-to-day (any team member):
$ phantomind watch --sync             # Watch and sync, no automation
$ phantomind agent "Add pagination to user list"  # Explicit agent request

# Code review dashboard:
$ phantomind audit --type dashboard
```

### Workflow 3: Multi-Package Monorepo

**Goal**: Per-package context precision.

```bash
# Root setup
$ cd monorepo-root
$ phantomind init --template monorepo

# Per-package context (optional):
$ cd packages/api-server
$ phantomind init                     # Creates local .phantomind/
$ phantomind watch --auto --daemon   # Auto-learns just for this package

# Per-package sync works independently:
# Each package's SKILLS.md → .cursorrules, etc.
```

### Workflow 4: Agent-Driven Development

**Goal**: Multi-agent task orchestration.

```bash
# Task: "Build user authentication with JWT, tests, and documentation"
$ phantomind agent \
  "Implement JWT-based authentication with refresh tokens" \
  --orchestrate \
  --roles architect,implementer,securityReviewer,testWriter,documenter

# Each role runs sequentially:
# 1. architect:          → system design & decisions
# 2. implementer:        → code implementation
# 3. securityReviewer:   → vulnerability check
# 4. testWriter:         → unit + integration tests
# 5. documenter:         → API docs + README

# All outputs aggregated into .phantomindcache/orchestration-[id].md

# Manual review and apply:
$ phantomind apply-changes --preview
? Accept changes? (y/n/review): review
[review agent outputs...]
? Apply changes? (y/n): y
```

### Workflow 5: CI/CD Integration

**Indonesian-flavored real Workflow:**

```yaml
# .github/workflows/context.yml
name: Keep AI Context Fresh

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'package.json'
  pull_request:
    branches: [main]

jobs:
  sync-context:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install PhantomindAI
        run: npm install -g @phantomind/core

      - name: Learn from changes
        run: |
          phantomind learn --only-changes
          phantomind check

      - name: Sync to adapters
        run: phantomind sync

      - name: Audit changes
        run: phantomind audit --type dashboard

      - name: Commit updated context
        if: ${{ github.event_name == 'push' }}
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "PhantomindAI Bot"
          git add .github/copilot-instructions.md .cursorrules .continue/
          git commit -m "chore: update AI context via PhantomindAI"
          git push
```

---

## FAQ

### General

**Q: Do I need to pay for PhantomindAI?**
A: No. PhantomindAI is open-source and free. You only pay for the underlying LLM providers (Anthropic, OpenAI, etc.) at your existing rates.

**Q: Can I use PhantomindAI with local-only LLMs (Ollama)?**
A: Yes! Ollama is fully supported. Set `providers.primary.name: ollama` in `.phantomind/config.yaml` and no API keys are required.

**Q: What if my LLM provider is offline?**
A: PhantomindAI auto-routes to a fallback provider. If both fail, the command completes gracefully (e.g., sync still works without AI suggestions).

**Q: How much does automation cost?**
A: Only for AI-powered commands (agent, suggestions, validation). Pure sync/learn costs zero. Most projects spend $1-5/day in v0.5.0 with full automation enabled.

### Automation & Watch

**Q: Can automation accidentally break my code?**
A: Changes are logged to `.phantomind/audit/` before application. With `approval_method: prompt`, you review each change first. With `approval_method: manual-review`, changes are staged but not applied until you explicitly approve.

**Q: What if I don't want automation?**
A: Run `phantomind watch --sync` (no `--auto` flag) instead. Or disable via config: `enabled: false` in `.phantomind/auto.config.yaml`.

**Q: Can I temporarily disable automation?**
A: Yes. Use `phantomind watch --auto --disabled` to respect your config but skip automation just this session.

**Q: How do I review what automation did today?**
A:

 ```bash
phantomind audit --type automation --period today --format terminal
```

### Sync & Adapters

**Q: Why should I sync to multiple adapters (Copilot, Cursor, Cline)?**
A: Different adapters support different features. Cursor reads `.cursorrules`, Cline reads `.clinerules`. Syncing to all ensures max compatibility.

**Q: Can I exclude certain adapters from sync?**
A: Yes: `phantomind sync --adapters copilot cursor` (skip others).

**Q: What if an adapter doesn't exist yet?**
A: PhantomindAI creates the adapter structure automatically on first sync. You just need to enable it in your IDE settings.

### Monorepos & Large Projects

**Q: Does PhantomindAI work with monorepos?**
A: Yes. Each package can have its own `.phantomind/` config or share one at the root. Run `phantomind init --template monorepo` for guidance.

**Q: How does PhantomindAI handle 100k+ line codebases?**
A: It uses TF-IDF indexing for smart context ranking. Large files are summarized, and you can set `--max-tokens` to fit any token budget.

**Q: Can I version-control `.phantomind/` files?**
A: **Yes** (SKILLS.md and RULES.md — these are useful in git diff for documentation). **No** (config.yaml and .env — these contain secrets and personal preferences). Add to `.gitignore`:

```
.phantomind/.env
.phantomind/config.yaml
.phantomind/auto.config.yaml
.phantomind/audit/*
.phantomind/logs/*
.phantomind/cache/*
```

### Agent System

**Q: What's the difference between `phantomind agent` and `phantomind watch --agent`?**
A: `watch --agent` watches files and suggests improvements reactively. `agent <task>` is a manual, proactive task executor.

**Q: Can I use multiple agents simultaneously?**
A: No, but `--orchestrate` runs 5 roles sequentially on one task. This often produces better results than a single agent.

**Q: How do I know if an agent's suggestion is good?**
A: The agent includes a confidence score and breakdown. With `approval_method: prompt`, you review before applying. With `--no-approval`, check `.phantomind/audit/` afterward.

### Quality & Validation

**Q: What does "hallucination detection" do?**
A: Scans generated code for:
- Imports of packages not in `package.json`
- File references that don't exist
- Type references undefined in the codebase

**Q: Can I auto-fix detected secrets?**
A: Yes: `phantomind validate src/ --fix` auto-redacts secrets in place. Always commit to see diffs first.

**Q: Does PhantomwindAI send my code to external servers?**
A: For LLM completions, yes (to your configured provider: Anthropic, OpenAI, etc.). For local indexing (learn, sync), no — everything stays on your machine.

---

## Troubleshooting

### CLI Issues

**Issue: `phantomind: command not found`**

```bash
# If installed globally:
npm link @phantomind/core

# Or reinstall:
npm install -g @phantomind/core

# Verify:
phantomind --version
```

**Issue: `EACCES: permission denied` on install**

```bash
# Use a Node version manager (recommended):
# Install nvm: https://github.com/nvm-sh/nvm
nvm install 18
npm install -g @phantomind/core

# Or use sudo (not recommended):
sudo npm install -g @phantomind/core
```

### Configuration Issues

**Issue: `.phantomind/config.yaml` not found**

```bash
# Initialize again:
phantomind init

# Or manually restore:
cp node_modules/@phantomind/core/dist/templates/config.yaml .phantomind/config.yaml
```

**Issue: API key not recognized**

```bash
# Check .env first:
cat .phantomind/.env  # or check system env vars

# If missing:
export ANTHROPIC_API_KEY="sk-ant-..."
# Or add to .phantomind/.env (not git-tracked):
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .phantomind/.env

# Verify it loads:
phantomind check
```

**Issue: `Invalid config file` error**

```bash
# Validate YAML syntax:
phantomind check --fix

# Or manually fix syntax errors in .phantomind/config.yaml
# (YAML is strict about indentation — use 2 spaces, not tabs)
```

### Watch & Automation Issues

**Issue: `phantomind watch` exits immediately**

```bash
# Check for errors:
phantomind watch --verbose

# If automation is misconfigured:
phantomind init --reset-automation
phantomind watch --setup

# If still failing:
phantomind check --json > debug.json
# Share debug.json in GitHub issues
```

**Issue: Auto-apply never applies changes**

```bash
# Check approval method:
cat .phantomind/auto.config.yaml | grep approval_method

# If approval_method: prompt, you need to approve changes:
# PhantomwindAI will pause and ask in terminal

# If approval_method: auto and still not applying:
phantomind watch --auto --verbose
# Look for error messages in output
```

**Issue: Automation is too slow**

```bash
# Increase debounce time:
# Edit .phantomind/auto.config.yaml:
debounce_ms: 2000  # Wait 2 seconds instead of 1

# Or reduce max changes:
max_changes_per_run: 3  # Process fewer changes per trigger

# Or learn only changed files:
phantomind watch --auto --only-changes
```

### Sync Issues

**Issue: Adapters not syncing**

```bash
# Check adapter configuration:
phantomind diff --adapters copilot cursor  # Preview diffs

# Force resync:
phantomind sync --verbose

# If specific adapter fails:
# Check if the target file can be written (permissions):
ls -la .cursorrules  # If exists, check permissions
touch .cursorrules  # If creation fails, check directory permissions
```

**Issue: `.cursorrules` not picked up by Cursor**

```bash
# 1. Restart Cursor completely
# 2. Check that .cursorrules is in the root of your project
# 3. In Cursor settings, verify "Custom rules file" points to .cursorrules
# 4. If still not picked up:
phantomind diff --adapters cursor --verbose  # Check what was generated
```

### Agent Issues

**Issue: Agent response is slow**

```bash
# Agent tasks can take 30-60 seconds for multi-step problems
# Use --max-steps to limit:
phantomind agent "My task" --max-steps 10  # Faster but less thorough

# Or check provider performance:
phantomind eval --provider anthropic
```

**Issue: Agent suggests bad code**

```bash
# Use multi-agent orchestration:
phantomind agent "My task" --orchestrate --roles architect,implementer,securityReviewer

# This catches bugs that single agents miss

# Or reduce temperature for more conservative suggestions:
# Edit .phantomind/config.yaml:
agent:
  temperature: 0.3  # Lower = more conservative (default 0.7)
```

### Performance Issues

**Issue: `phantomind learn` is very slow**

```bash
# Learn only changed files:
phantomind learn --only-changes

# Or only learn packages (faster):
phantomind learn --packages

# Or exclude large directories in .phantomind/config.yaml:
ignore:
  - node_modules/
  - dist/
  - .git/
  - build/
```

**Issue: High memory usage**

```bash
# Reduce `max-tokens` in context:
phantomind context --max-tokens 2000

# Or split into multiple smaller projects
```

### Cost Issues

**Issue: Unexpected high costs**

```bash
# Check where costs are coming from:
phantomind audit --type costs --period today --format json

# Common causes:
# 1. Agent tasks on large codebases (use --max-steps 10)
# 2. Hallucination detection enabled (disable if not needed)
# 3. Validation on many files (phantomind validate src/ is expensive)

# To reduce costs:
# - Disable agent_suggestions in automation
# - Use cheaper fallback provider (Groq, DeepSeek)
# - Use local Ollama instead where possible
```

---

## Release History

| Version | Date | Highlights |
|---------|------|-----------|
| **v0.5.0** | 2025 | Real-time automation, watch --auto, apply-changes command |
| **v0.4.0** | 2025 | Health scoring, incremental learning, diagnostics |
| **v0.3.0** | 2025 | Agent executor, multi-role orchestration, quality layer |
| **v0.2.0** | 2025 | Provider routing, budget management, MCP server, UI/UX learning |
| **v0.1.11** | 2025 | Context sync, adapter generation, CLI foundation |

---

## Roadmap

| Version | Features |
|---------|---------|
| **v0.1** | Context sync, adapter generation, CLI init/sync |
| **v0.2** | Provider router, budget management, MCP server |
| **v0.3** | Agent executor, orchestrator, task queue |
| **v0.4** | Quality layer (secrets, hallucinations, consistency) |
| **v0.5** | Real-time automation, watch, apply-changes |
| **v1.0** | Schema registry, templates, stable API |
| **v1.x** | VS Code extension, advanced Git workflows, CI/CD templates |

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Stack

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js ≥ 18
- **Test Framework**: Vitest
- **Build Tool**: TypeScript Compiler
- **Monorepo**: npm workspaces

### Quick Start for Contributors

```bash
git clone https://github.com/your-username/PhantomwindAI
cd PhantomwindAI
npm install
npm run build    # Build all packages
npm run test     # Run all tests (21 test files, 170+ tests)
npm run dev      # Watch mode
```

### Testing

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- src/agent/retry.test.ts

# Watch mode
npm run test -- --watch

# Coverage
npm run test -- --coverage
```

### Code Style

```bash
# Format & lint
npm run format
npm run lint

# Type check
npm run typecheck
```

---

## License

MIT © Synaptode
