# CoPilot Agent Best Practices

## 📘 Purpose
This document provides a modular, audit‑safe guide for selecting and using Copilot agents across CLI, IDE, and cloud contexts.

---

## 🧠 Agent Overview

### GitHub Copilot CLI Agent
- **Interface**: Terminal / CLI
- **Context**: Local shell, file system
- **Strengths**: Command generation, automation, debugging
- **Best Use Cases**: Scripting, traceable pipelines, shell‑native workflows

### Claude Sonnet 4.5 Agent
- **Interface**: IDE / GUI panel
- **Context**: Abstract orchestration logic
- **Strengths**: Semantic reasoning, planning, documentation
- **Best Use Cases**: Architectural design, orchestration flows, audit‑safe documentation

### GitHub Copilot Cloud Agent
- **Interface**: Cloud IDE / browser
- **Context**: GitHub repo + cloud workspace
- **Strengths**: Inline code suggestions, refactoring, test scaffolding
- **Best Use Cases**: Cloud‑based coding, deployment logic, browser‑native workflows

---

## 🔍 Comparison Table

| Agent | Interface | Context | Strengths | Best Use Cases |
|-------|-----------|---------|-----------|----------------|
| CLI Agent | Terminal | Local shell, file system | Command generation, automation | Scripting, debugging, pipelines |
| Claude Sonnet 4.5 | IDE / GUI | Abstract orchestration logic | Semantic reasoning, planning | Documentation, orchestration |
| Cloud Agent | Cloud IDE | GitHub repo + browser workspace | Inline suggestions, refactoring | Cloud coding, deployment |

---

## 🚦 Routing Guide

- **CLI Agent** → Use for shell‑native automation, script generation, and debugging  
- **Claude Agent** → Use for architectural planning, orchestration flows, and documentation  
- **Cloud Agent** → Use for cloud‑hosted repo interaction, inline edits, and refactoring  

---

## 🛠️ Practical Workflow

1. **Start with Claude** to plan logic or document goals  
2. **Switch to CLI Agent** to generate and validate shell commands  
3. **Use Cloud Agent** if working in a browser‑based repo for inline edits  
4. **Return to Claude** to finalize documentation or orchestrate next steps  

---

## ✅ Rule of Thumb

- **CLI Agent** → “Do this in the shell.”  
- **Claude Agent** → “Think, explain, scaffold.”  
- **Cloud Agent** → “Edit and refactor in the cloud.”  


🚦 The Three Copilot Lanes
CLI Agent (Terminal lane) Works in your shell. It’s session‑aware only within that CLI run. Once you end the session, it doesn’t carry history into other lanes.

Claude Sonnet 4.5 Agent (IDE/GUI lane) Operates in your editor panel. It’s aware of prompts and context inside that IDE session, but not of what happened in your terminal unless you explicitly paste or reference it.

Cloud Agent (Cloud IDE lane) Lives in browser‑based repos. It tracks context inside the cloud workspace, but doesn’t automatically sync with your local CLI or Claude’s IDE reasoning.

🔍 Key Point
These lanes are not natively aware of each other’s history. Each agent maintains its own conversational/session state. If you want continuity across them, you need to manually bridge context — for example:

Copying CLI outputs into Claude for reasoning.

Using Claude to draft orchestration, then pasting commands into CLI.

Letting Cloud Agent refactor code, then documenting changes with Claude.

🛠️ Best Practice for History Bridging
Treat each lane as modular: CLI = execution, Claude = reasoning, Cloud = inline editing.

Pass artifacts explicitly: Move logs, commands, or snippets between lanes.

Document transitions: Use audit‑safe notes so you know what was handed off.