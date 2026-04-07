# CodeRead - Architecture

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | Frontend + backend in one project |
| Language | TypeScript | Type safety across all files |
| Styling | Tailwind CSS | Utility-first responsive styling |
| Syntax Highlighting | Shiki | Server-side code highlighting with dual theme |
| Database | Supabase (Phase 3+) | User accounts, challenge storage |
| Hosting | Vercel | Deployment, CDN, auto-deploy on push |
| Version Control | GitHub | Source of truth for all code |
| Domain | codeoneread.tech | Custom domain via get.tech |

---

## Complete File Map

### App (Pages)

| File | Type | Purpose |
|------|------|---------|
| `app/layout.tsx` | Server | Root HTML shell. Loads fonts, wraps all pages in ThemeProvider, injects anti-FOUC script in head to prevent dark mode flash on Vercel |
| `app/globals.css` | CSS | Global styles, CSS custom property tokens for light/dark mode, Shiki syntax highlight variable rules |
| `app/page.tsx` | Server | Landing page at /. Hero section, stats bar, featured challenges preview, navbar |
| `app/not-found.tsx` | Server | Custom 404 page. On-brand design with links back to home and /challenges |

### App - Challenges

| File | Type | Purpose |
|------|------|---------|
| `app/challenges/page.tsx` | Server | Challenge list page at /challenges. Imports all challenges and passes them to ChallengeFilters. Includes SEO metadata |
| `app/challenges/[id]/page.tsx` | Server | Dynamic challenge page at /challenges/1 etc. Fetches challenge data, runs Shiki highlighting server-side, passes pre-rendered HTML to ChallengeView. Includes per-challenge SEO metadata via generateMetadata |

### Components - Challenge

| File | Type | Purpose |
|------|------|---------|
| `components/challenge/ChallengeView.tsx` | Client | Interactive challenge page UI. Handles the reveal/hide explanation interaction via useState. Receives pre-highlighted code HTML as a prop and renders it via dangerouslySetInnerHTML |
| `components/challenge/ChallengeFilters.tsx` | Client | Filter bar on /challenges. Lets users filter by difficulty (All / Beginner / Intermediate / Advanced) and language (All / JavaScript / TypeScript / Python). Filters work together with AND logic. Shows challenge count and progress indicator |

### Components - UI

| File | Type | Purpose |
|------|------|---------|
| `components/ui/ThemeProvider.tsx` | Client | Manages light/dark mode state. Reads OS preference and localStorage on mount. Exposes useTheme() hook. SSR-safe - all browser API access is inside useEffect |
| `components/ui/ThemeToggle.tsx` | Client | Sun/moon icon button in the navbar. Calls toggle() from useTheme() to switch between light and dark |

### Data & Types

| File | Purpose |
|------|---------|
| `data/challenges.ts` | All 20 hardcoded challenges. Each challenge has id, title, description, code, language, difficulty, question, explanation, and keyConceptsToSpot. Languages: JavaScript, TypeScript, Python. Difficulties: Beginner, Intermediate, Advanced |
| `types/challenge.ts` | TypeScript type definitions. Exports the Challenge interface and Difficulty / Language union types |

### Lib (Utilities)

| File | Purpose |
|------|---------|
| `lib/highlighter.ts` | Shiki syntax highlighting utility. Singleton pattern - creates the highlighter once and reuses it. Exports highlight(code, lang) async function that returns pre-rendered HTML with dual-theme CSS variables (--shiki-light and --shiki-dark) |

### Config & Docs

| File | Purpose |
|------|---------|
| `ARCHITECTURE.md` | This file. Complete system map |
| `ROADMAP.md` | Product roadmap by phase with checkbox tracking |
| `TEAM.md` | AI team roles (Director, Orion, Claude Code, Copilot Pro, Google Stitch, Codex) |
| `next.config.ts` | Next.js configuration |
| `tsconfig.json` | TypeScript compiler configuration |
| `eslint.config.mjs` | ESLint rules |
| `postcss.config.mjs` | PostCSS config for Tailwind |
| `package.json` | Dependencies and npm scripts |

---

## Folder Structure

```
D:\coderead
├── app/
│   ├── layout.tsx                    # Root layout, ThemeProvider, anti-FOUC script
│   ├── globals.css                   # Global styles, dark mode tokens, Shiki CSS vars
│   ├── page.tsx                      # Landing page (/)
│   ├── not-found.tsx                 # Custom 404 page
│   ├── favicon.ico
│   └── challenges/
│       ├── page.tsx                  # Challenge list with filters (/challenges)
│       └── [id]/
│           └── page.tsx              # Individual challenge (/challenges/1-20)
│
├── components/
│   ├── ui/
│   │   ├── ThemeProvider.tsx         # Light/dark state management
│   │   └── ThemeToggle.tsx           # Sun/moon toggle button
│   └── challenge/
│       ├── ChallengeView.tsx         # Interactive reveal UI
│       └── ChallengeFilters.tsx      # Difficulty + language filter bar
│
├── data/
│   └── challenges.ts                 # 20 hardcoded challenges
│
├── types/
│   └── challenge.ts                  # TypeScript interfaces and union types
│
├── lib/
│   └── highlighter.ts                # Shiki singleton, highlight() function
│
├── public/                           # Static assets
│
├── ARCHITECTURE.md
├── ROADMAP.md
└── TEAM.md
```

---

## Data Flow

### Challenge page request

```
User visits /challenges/4
        down
Next.js [id]/page.tsx (Server Component)
        down
Reads challenge from data/challenges.ts where id === "4"
        down
Calls highlight(challenge.code, challenge.language) from lib/highlighter.ts
        down
Shiki returns HTML string with --shiki-light and --shiki-dark CSS vars on each span
        down
Page passes challenge object + highlightedCode string to ChallengeView
        down
ChallengeView renders code block via dangerouslySetInnerHTML
        down
globals.css applies correct color via .shiki-wrapper span { color: var(--shiki-light) }
        down
User clicks Reveal - useState flips revealed to true - explanation appears
```

### Theme switching

```
User clicks ThemeToggle
        down
useTheme().toggle() called
        down
ThemeProvider toggles document.documentElement.classList ('dark')
        down
localStorage saves preference
        down
Tailwind dark: variants switch instantly (CSS only, no re-render)
        down
Shiki: .dark .shiki-wrapper span switches to --shiki-dark colors
```

---

## Core Data Model

```typescript
type Difficulty = 'beginner' | 'intermediate' | 'advanced'
type Language = 'javascript' | 'typescript' | 'python'

interface Challenge {
  id: string                   // URL identifier (1-20)
  title: string                // Challenge title
  description: string          // One-line context
  code: string                 // The code snippet to read
  language: Language           // javascript | typescript | python
  difficulty: Difficulty       // beginner | intermediate | advanced
  question: string             // What the user must answer
  explanation: string          // Plain English explanation revealed on click
  keyConceptsToSpot: string[]  // Concept tags shown after reveal
}
```

---

## Rendering Strategy

| Route | Strategy | Pages | Why |
|-------|----------|-------|-----|
| `/` | Static (SSG) | 1 | Content never changes |
| `/challenges` | Static (SSG) | 1 | Hardcoded data, filters run client-side |
| `/challenges/[id]` | Static (SSG) | 20 | generateStaticParams pre-builds all 20 |
| `/_not-found` | Static | 1 | Custom 404 |
| Future user pages | SSR | - | Needs auth + dynamic data |

Total static pages: 25. All served from Vercel CDN with no server runtime needed.

---

## Component Roles

| Component | Type | Responsibility |
|-----------|------|----------------|
| `app/layout.tsx` | Server | Root shell, anti-FOUC script, ThemeProvider wrapper |
| `app/page.tsx` | Server | Landing page |
| `app/not-found.tsx` | Server | 404 page |
| `app/challenges/page.tsx` | Server | Challenge list shell, passes data to ChallengeFilters |
| `app/challenges/[id]/page.tsx` | Server | Runs Shiki, passes data to ChallengeView |
| `ChallengeView.tsx` | Client | Reveal interaction (useState) |
| `ChallengeFilters.tsx` | Client | Filter state (useState), renders filtered cards |
| `ThemeProvider.tsx` | Client | Theme state, useTheme() hook |
| `ThemeToggle.tsx` | Client | Toggle button, reads useTheme() |

---

## Phase 3 - Supabase Integration Plan

When user accounts are added:

```
Supabase
├── auth.users          # Managed by Supabase Auth
├── challenges          # Migrated from data/challenges.ts
└── user_progress       # Which challenges each user completed
    ├── user_id (FK)
    ├── challenge_id (FK)
    └── completed_at
```

Data flow changes:
- Challenges fetched from Supabase instead of hardcoded file
- Progress saved to Supabase on reveal click
- User session checked in layout.tsx via Supabase Auth

---

## Environment Variables

```
# Phase 1 + 2: none needed

# Phase 3+
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Deployment Pipeline

```
Phat pushes to GitHub main branch (github.com/Phat1911/coderead)
        down
Vercel detects push via webhook
        down
Vercel runs npm run build
        down
Build output deployed to Vercel CDN
        down
Live at https://codeoneread.tech
```

---

*Built with [Orion](https://meetorion.app)*