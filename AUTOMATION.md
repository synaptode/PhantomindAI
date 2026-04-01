# PhantomindAI v0.5.0 — Complete Automation

## Overview
PhantomindAI v0.5.0 introduces **complete automation** — after initial setup, your project learns and syncs automatically without needing commands.

## Quick Start (30 seconds)

```bash
# 1. Initialize project (one-time)
phantomind init --guided

# 2. Setup auto-mode (one-time)
phantomind watch --setup

# 3. Done! Project now auto-learns and syncs on file changes
phantomind watch --auto --sync
```

---

## Automation Modes

### Mode 1: Simple Watch + Learn
```bash
phantomind watch --sync
```
**What it does:**
- Watches project files for changes
- Auto-runs `learn` on file save (500ms debounce)
- Auto-runs `sync` to update adapter configs
- Best for: Basic project monitoring

### Mode 2: Full Automation (--auto)
```bash
phantomind watch --auto --sync
```
**What it does:**
- Everything from Mode 1
- Respects auto-mode config (debounce, patterns, etc.)
- Shows configuration on startup
- Best for: Development workflow

### Mode 3: Smart Improvement Suggestions (--agent)
```bash
phantomind watch --auto --agent
```
**What it does:**
- Watches files + learns + syncs
- Shows AI suggestions for improvements
- *(Agent integration coming in v0.5.1)*
- Best for: Continuous code quality monitoring

### Mode 4: Auto-Apply Changes (--auto-apply)
```bash
phantomind watch --auto --agent --auto-apply
```
**What it does:**
- Everything above +
- Automatically applies safe improvements
- Requires approval method configuration
- Best for: Advanced automation workflows

---

## Configuration: .phantomind/auto.config.yaml

### Generate Config
```bash
phantomind watch --setup
```

### Example Configuration
```yaml
automation:
  enabled: true
  on_save: true              # Trigger on file save
  on_commit: false           # Trigger on git commit (future)
  
  watch_patterns:            # Glob patterns to monitor
    - 'src/**/*.ts'
    - 'src/**/*.tsx'
    - 'package.json'
    - 'tsconfig.json'
    
  auto_learn: true           # Auto-learn on changes
  auto_sync: true            # Auto-sync adapters
  agent_suggestions: false   # Show AI suggestions
  auto_apply: false          # Apply changes automatically
  
  approval_method: 'prompt'  # 'prompt' | 'auto' | 'manual-review'
  debounce_ms: 1000          # Delay before triggering (prevents spamming)
  max_changes_per_run: 5     # Safety limit on changes
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | false | Master switch for auto-mode |
| `on_save` | boolean | true | Trigger on file save |
| `on_commit` | boolean | false | Trigger on git commit (future) |
| `watch_patterns` | string[] | [src/**, package.json, ...] | Which files to monitor |
| `auto_learn` | boolean | true | Auto-scan for tech stack |
| `auto_sync` | boolean | true | Auto-sync to adapters |
| `agent_suggestions` | boolean | false | Show AI improvements |
| `auto_apply` | boolean | false | Automatically apply changes |
| `approval_method` | string | 'prompt' | How to approve: 'prompt' / 'auto' / 'manual-review' |
| `debounce_ms` | number | 1000 | Wait time before triggering (ms) |
| `max_changes_per_run` | number | 5 | Max changes per automation run |

---

## Usage Workflows

### Workflow A: Basic Developer Setup
```bash
# One time
phantomind init --guided
phantomind watch --setup  # Enable on_save, auto_learn, auto_sync

#Then
phantomind watch --auto --sync

# Your adapters (Copilot, Cursor, etc.) now update automatically
# SKILLS.md stays in sync
```

### Workflow B: Continuous Improvement (with Agent)
```bash
# Config enables agent_suggestions
phantomind watch --auto --agent

# Watch output:
# 👀 PhantomindAI — Watch Mode
#   Auto-mode enabled
#   Agent suggestions enabled
#   Watching project files...
#
# [File change detected]
# ✔ Project context learned!
# ✔ Synced 1/1 adapters successfully
# 🤖 Asking agent for improvement suggestions...
# → [Suggestions showing recommendation]
```

### Workflow C: Full Automation with Review
```bash
# Config sets approval_method: 'manual-review'
phantomind watch --auto --agent --auto-apply

# Suggested changes show with approval prompt
# User can review in .phantomind/audit/changes-*.json
# Then press Enter to apply
```

### Workflow D: CI/CD Integration
```yaml
# .github/workflows/phantomind.yml
names: PhantomMind Auto-Sync
on: [push]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g @phantomind/core
      - run: phantomind learn --only-changes --sync
      - run: git diff --exit-code
```

---

## Safety Features

###1. **Validation**
- Invalid file paths abort changes
- Protected directories (`.git`, `node_modules`) not modifiable
- Content validation before applying

### 2. **Approval Methods**
- **prompt**: Ask user for each change (safest)
- **auto**: Auto-approve only low-risk changes
- **manual-review**: Show changes in file, require yes/no

### 3. **Audit Trail**
All changes recorded in `.phantomind/audit/changes-*.json`:
```json
{
  "timestamp": "2026-04-01T12:00:00Z",
  "changes": [
    {
      "filePath": "src/utils.ts",
      "type": "modify",
      "reason": "Add missing error handling",
      "priority": "high"
    }
  ],
  "autoApproved": false
}
```

### 4. **Debouncing & Rate Limiting**
- Default 1000ms debounce prevents spam
- Max 5 changes per run by default
- `max_changes_per_run` configurable

---

## Architecture

### Three Layers of Automation

```
Layer 1: File System Watcher
  ↓ (on file change)
Layer 2: Auto-Learn Engine
  ↓ (learns project changes)
Layer 3: Agent + Auto-Apply
  ↓ (suggests & applies improvements)
Project stays up-to-date
```

###Components

1. **AutoModeManager** (`auto-mode.ts`)
   - Manages configuration
   - Provides safe defaults
   - Validates settings

2. **AutoApplyEngine** (`auto-apply.ts`)
   - Validates changes
   - Applies to filesystem
   - Records audit trail

3. **Enhanced Watch** (`watch.ts`)
   -Integrated file watcher
   - Respects config
   - Coordinates layers

---

## Commands at a Glance

```bash
# Setup
phantomind init                    # Normal init
phantomind init --guided           # Guided init
phantomind watch --setup           # Configure auto-mode

# Automation
phantomind watch                   # Basic watch mode
phantomind watch --auto            # Full auto (respects config)
phantomind watch --auto --sync     # Auto learn + sync
phantomind watch --agent           # With improvement suggestions
phantomind watch --auto-apply      # Auto-apply changes

# One-time runs
phantomind learn --only-changes    # Fast incremental learn
phantomind stats                   # View health insights
phantomind sync                    # Manual sync
```

---

## FAQ

**Q: Do I need to run commands anymore?**
A: After `init` and `watch --setup`, only `phantomind watch --auto` (once), then no commands needed.

**Q: Is auto-apply safe?**
A: Yes! Changes are validated, paths are sanitized, and audit trail is recorded.

**Q: Can I roll back auto-applied changes?**
A: Check `.phantomind/audit/changes-*.json` for what changed, then use git to revert.

**Q: What if I want to disable auto-mode?**
A: Run `phantomind watch --setup` and toggle `enabled: false`, or just run normal commands.

**Q: Does this work with monorepos?**
A: Yes! Use `phantomind learn --packages core adapter` with `--only-changes` for scoped automation.

**Q: Can I automate specific adapters only?**
A: Config supports adapter filtering (coming in v0.5.1).

---

## What's Next (Phase 4)

- [ ] Git hook integration
- [ ] CI/CD templates (GitHub Actions, GitLab CI)
- [ ] Slack/Discord notifications on changes
- [ ] Dashboard for automation history
- [ ] Advanced filtering (per-adapter, per-file-type)
- [ ] Rollback automation for failed changes
