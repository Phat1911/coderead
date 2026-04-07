# CodeRead - AI Task Separation Guide

> Who handles what, when to hand off, and what to do when limits hit.

---

## Who Does What

| Task Type | Primary Tool | Notes |
|-----------|-------------|-------|
| System architecture decisions | **Orion** | Plan first, document in chat |
| Planning a new feature before coding | **Orion** | Define scope, data model, API shape |
| Explaining what existing code does | **Orion** | Ask in chat with file/snippet pasted |
| Building a new full feature end-to-end | **Claude Code** | Multi-file changes, `claude` in terminal |
| Refactoring across multiple files | **Claude Code** | Scope the refactor in Orion first |
| Small edit within a single file | **Copilot Pro** | Inline edit in VS Code editor |
| Autocomplete while typing | **Copilot Pro** | Always-on, no action needed |
| Reviewing code logic for bugs | **Codex (GPT-5.4)** | Open Codex tab, paste or select code |
| Designing a new page UI | **Google Stitch** | stitch.withgoogle.com, export HTML |
| Converting Stitch UI to Next.js TSX | **Claude Code** | Use `stitch-html-to-nextjs-tsx` skill |
| Debugging a production issue | **Claude Code** | Full context needed, terminal access |
| Writing SQL or Supabase schema | **Claude Code** | Schema migrations, RLS policies |
| Setting up environment variables | **Orion** | Verify `.env` format, no secrets in logs |
| Git commits and deployment | **Orion** | Commit message + deploy command via chat |

---

## Task Decision Flow

```
Is this a decision, architecture question, or planning task?
  YES -> Orion first. Document outcome before coding.

Does this require building or changing multiple files?
  YES -> Claude Code (run `claude` in VS Code terminal)

Is this a visual/UI design from scratch?
  YES -> Google Stitch to design, then Claude Code to integrate

Is this a quick single-line or single-block edit?
  YES -> Copilot Pro inline (just type, let it suggest)

Does this need a logic/security review before merging?
  YES -> Codex tab in VS Code
```

---

## When to Use Each Tool

### Orion (Lead Developer + Mentor)
**Best for:**
- Architecture decisions and tradeoffs
- Feature planning before writing a single line
- Explaining unfamiliar code or concepts
- Reviewing plans, catching issues early
- Git commit messages and deployment steps
- Anything requiring judgment or context across the whole project

**Not good for:**
- Writing large blocks of new code directly
- Multi-file refactors (use Claude Code)
- Real-time autocomplete (use Copilot)

**How to activate:** Chat interface - just ask.

---

### Claude Code (Senior Engineer)
**Best for:**
- Building complete features (multiple files, components, API routes)
- Large refactors that touch 3+ files
- Debugging complex production issues with full codebase context
- Writing and applying SQL migrations
- Converting Stitch HTML exports into proper TSX components

**Not good for:**
- Quick single-line edits (Copilot is faster)
- High-level planning (Orion first)
- UI visual design

**How to activate:** Open VS Code integrated terminal -> run `claude`

---

### GitHub Copilot Pro (Inline Assistant)
**Best for:**
- Autocomplete while typing
- Small targeted edits within a single file
- Boilerplate code generation inline
- Completing repetitive patterns quickly

**Not good for:**
- Multi-file changes
- Architecture decisions
- Anything requiring project-wide context

**How to activate:** Always on in VS Code editor. Tab to accept suggestions. Use inline chat with `Ctrl+I`.

---

### Google Stitch (UI Generator)
**Best for:**
- Generating page layouts and component designs visually
- Rapid UI prototyping before writing code
- Exploring design options without committing to code

**Not good for:**
- Production-ready TSX (always needs Claude Code integration pass)
- Logic, state management, API calls

**How to activate:** Go to [stitch.withgoogle.com](https://stitch.withgoogle.com), describe the UI, export HTML/CSS.

---

### Codex / GPT-5.4 (Code Reviewer)
**Best for:**
- Reviewing code logic for correctness and edge cases
- Spotting potential bugs before merge
- Suggesting performance improvements
- Security review on sensitive code paths

**Not good for:**
- Writing new features
- Real-time autocomplete
- Project-wide refactors

**How to activate:** Open Codex tab in VS Code -> select code or paste snippet -> ask for review.

---

## Handoff Protocol

### Standard Feature Flow
```
Orion (plan + scope)
  -> Claude Code (build feature, multi-file)
    -> Copilot Pro (polish while editing)
      -> Codex (review before merge)
        -> Orion (commit message + deploy)
```

### UI Feature Flow
```
Google Stitch (design page)
  -> Orion (review design, write integration spec)
    -> Claude Code (convert HTML to TSX, wire up data)
      -> Copilot Pro (inline adjustments)
        -> Codex (final review)
```

### Quick Fix Flow
```
Orion (confirm what needs fixing)
  -> Copilot Pro (make the edit inline)
    -> Orion (verify + commit)
```

**Handoff rules:**
- Always start with Orion when scope is unclear
- Give Claude Code a clear written spec (from Orion) before running `claude`
- Never skip Codex review for auth, payment, or data-sensitive code
- After Stitch export, do NOT use the HTML directly in production - always run through Claude Code

---

## Usage Limit Fallbacks

| Tool | When Limit Hit | Fallback |
|------|---------------|---------|
| **Orion** | Daily quota exceeded | Use Claude Code with more detailed prompts; check `AI-TASKS.md` for guidance |
| **Claude Code** | Session/daily limit | Break task into smaller pieces; use Copilot for file-level edits + Orion for planning |
| **Copilot Pro** | Monthly limit | Use Claude Code for edits via terminal; use Codex for single-file suggestions |
| **Google Stitch** | Usage cap | Sketch UI in a plain markdown spec, hand to Claude Code to build from scratch |
| **Codex (GPT-5.4)** | Limit reached | Paste code into Orion chat for review; use Claude Code with explicit "review this" prompt |

**General rule:** If any tool is unavailable, escalate up to Orion for guidance on how to proceed with remaining tools.

---

*Last updated: 2026-04-07*
