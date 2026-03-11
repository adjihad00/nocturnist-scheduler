# AI Response Contract

This document defines how AI assistants must structure responses when contributing to this repository.

The goal is to ensure responses are **concise, deterministic, and immediately executable**.

All AI agents working on this project (ChatGPT, Claude, Codex, Copilot, etc.) must follow these rules when producing answers, instructions, or code changes.

---

# Core Principles

1. **Execution First**
   - Responses must prioritize actionable steps over explanation.
   - Provide the minimum steps required to complete the task.

2. **Deterministic Output**
   - Provide a single best solution.
   - Do not provide alternatives unless explicitly requested.

3. **No Speculative Improvements**
   - Do not suggest optional enhancements unless the user asks.

4. **Complete Deliverables**
   - Code must be complete and runnable.
   - Commands must be copy-paste ready.

5. **Minimal Explanation**
   - Only explain when explicitly requested or when necessary to avoid error.

---

# Standard Response Format

AI responses must follow this structure:

Goal
<one sentence describing the objective>

Steps

Step one

Step two

Step three

Commands
<pasteable shell or PowerShell commands>

Files Modified
<list of files changed>

Code
<complete code blocks>


Sections that do not apply may be omitted.

---

# Command Rules

Commands must be:

• complete  
• sequential  
• copy/paste ready  

Example:

`bash
git checkout main
git pull
git merge feature-branch
git push

Do not describe commands without providing the full command.

# Code Rules

When providing code:

• return the entire file unless a patch is explicitly requested
• include file path
• ensure code compiles or runs

Example:
 -File: tools/finish-task.ps1

</> PowerShell
 -full file contents here
 
# File Edit Rules

When modifying existing files, one of the following must be used:

Option A — Full File Replacement
File: path/to/file.lua
</> Lua
<complete file>

Option B — Patch
Edit: path/to/file.lua

Replace:
<old code>

With:
<new code>

Do not describe edits without showing exact replacements.

#Git Workflow Rules

When interacting with the repository:

• always show exact commands
• assume repository root unless specified
• do not omit staging or commit steps

Example format:

Commands
git checkout -b feature/new-module
git add modules/new_module.lua
git commit -m "Add new module"
git push origin feature/new-module

Agent Behavior Rules

# AI assistants must:

• follow repository architecture
• respect existing file structure
• avoid moving assets unless instructed
• avoid modifying unrelated files

If a required file is missing, the assistant should:

state the missing file

request it from the user

# Forbidden Behaviors

AI assistants must NOT:

• provide multiple alternative solutions
• provide optional improvements
• speculate about future features
• produce partially complete code
• produce pseudocode unless explicitly requested

# When Explanation Is Allowed

Explanation may be included only when:

• debugging an error
• architectural decisions are requested
• the user explicitly asks "why"

When included, explanation must be placed after the execution steps.

# Multi-Agent Coordination

When instructions are intended for another AI agent (Claude, Codex, etc.):

• responses must be deterministic
• avoid conversational language
• provide machine-readable structure

Example:
Agent Task
Update renderer.lua to load icons from ui_core assets directory.

# Summary

All responses must be:

• concise
• deterministic
• executable
• structured