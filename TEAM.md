# CodeRead - AI Team Roles

## The Team

| Role | Who | Where |
|------|-----|-------|
| Director | Phát (you) | Anywhere |
| Lead Developer + Mentor | Orion | Orion app (chat) |
| Senior Engineer | Claude Code | VS Code terminal |
| Inline Assistant | GitHub Copilot Pro | VS Code editor (inline) |
| UI Generator | Google Stitch | stitch.withgoogle.com |
| Code Reviewer | Codex (GPT-5.4) | VS Code Codex tab |

---

## Role Definitions

### Phát - Director
- Owns all product decisions: what to build, what to cut, what matters
- Defines goals and priorities each session
- Reviews output and gives final approval before anything ships
- Does not write code directly - delegates to the engineering team
- Responsible for understanding the system at a high level (not line-by-line)

---

### Orion - Lead Developer + Mentor
- First point of contact for every task
- Plans the architecture before any code is written
- Explains the "why" behind every decision in plain language
- Reviews what Claude Code produces and flags issues
- Breaks down complex tasks into clear instructions for Claude Code
- Teaches Phát to read and understand the code being built
- Keeps the project vision coherent across sessions

---

### Claude Code - Senior Engineer
- Executes large implementation tasks end-to-end
- Works across multiple files and understands full project context
- Takes clear specs from Orion and produces working code
- Best for: building new features, refactoring, complex logic
- Runs inside the VS Code integrated terminal (claude command)
- Reports blockers back to Orion for resolution

---

### GitHub Copilot Pro - Inline Assistant
- Provides real-time autocomplete while editing files in VS Code
- Suggests the next line or block as you type
- Best for: boilerplate, repetitive patterns, quick edits within a single file
- Does not understand full project context - works file by file
- Shortcut: suggestions appear automatically while typing

---

### Google Stitch - UI Generator
- Generates UI components and full page layouts from text prompts
- Best for: rapidly prototyping new pages, generating component ideas, visual design exploration
- Output is HTML/CSS or React components - handed to Claude Code for integration
- Use before building any new page to visualize the layout first
- Access at: stitch.withgoogle.com

---

### Codex (GPT-5.4) - Code Reviewer
- Secondary reviewer for code quality and alternative approaches
- Useful for getting a second opinion on logic Claude Code produced
- Best for: reviewing specific functions, spotting edge cases, comparing approaches
- Runs inside the VS Code Codex tab
- Does not replace Orion review - adds a different perspective

---

## Workflow

```
Phát defines goal
    down
Orion plans + explains the system logic
    down
Stitch generates UI layout (for new pages)
    down
Claude Code builds the implementation
    down
Copilot Pro assists with inline edits during review
    down
Codex reviews specific logic if needed
    down
Orion does final review + explains what was built
    down
Phát approves and understands before shipping
```

---

## Usage Limit Fallbacks

| If this tool hits its limit | Do this instead |
|-----------------------------|-----------------|
| Claude Code | Bring task to Orion - get smaller focused instructions, execute manually or via Copilot |
| Copilot Pro | Use Claude Code in terminal for the current task |
| Google Stitch | Describe layout to Orion - get component specs instead |
| Codex | Ask Orion for the review instead |
| Both Claude Code + Copilot | Orion explains exactly what to change - Phát edits manually |

---

## Communication Rules

- All decisions go through Phát first
- Orion is the single source of architectural truth
- Claude Code does not make product decisions - only implements what is specified
- When tools disagree on approach, Orion makes the final call
- Every feature must be understood by Phát before it is shipped

---

*Built with [Orion](https://meetorion.app)*
