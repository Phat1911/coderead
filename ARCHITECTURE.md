# CodeRead - Architecture

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | Frontend + backend in one project |
| Language | TypeScript | Type safety across all files |
| Styling | Tailwind CSS | Utility-first responsive styling |
| Syntax Highlighting | Shiki | Server-side code highlighting with dual theme |
| Database | Supabase | User accounts, challenge progress storage |
| Auth | @supabase/supabase-js + @supabase/ssr | Authentication, session management, SSR cookie handling |
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
| `app/login/page.tsx` | Client | Email/password login form. Uses useSearchParams (wrapped in Suspense). Calls Supabase signInWithPassword. Redirects to returnUrl after success |
| `app/signup/page.tsx` | Client | Email/password signup form. Calls Supabase signUp with emailRedirectTo for confirmation. Shows success state with email confirmation message |
| `app/profile/page.tsx` | Server | Protected by proxy.ts. Fetches user session and user_progress from Supabase. Shows overall progress bar (X of 20), percentage, and checklist of all 20 challenges with green checkmark for completed ones |

### App - Auth

| File | Type | Purpose |
|------|------|---------|
| `app/auth/callback/route.ts` | Route Handler | Exchanges OAuth code for session after email confirmation. Redirects to / on success or /login?error=auth_failed on failure |

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
| `components/ui/NavbarAuth.tsx` | Client | Shows Sign in link when logged out, Profile link when logged in. Uses onAuthStateChange to react to login/logout in real time |

### Data & Types

| File | Purpose |
|------|---------|
| `data/challenges.ts` | All 20 hardcoded challenges. Each challenge has id, title, description, code, language, difficulty, question, explanation, and keyConceptsToSpot. Languages: JavaScript, TypeScript, Python. Difficulties: Beginner, Intermediate, Advanced |
| `types/challenge.ts` | TypeScript type definitions. Exports the Challenge interface and Difficulty / Language union types |

### Lib (Utilities)

| File | Purpose |
|------|---------|
| `lib/highlighter.ts` | Shiki syntax highlighting utility. Singleton pattern - creates the highlighter once and reuses it. Exports highlight(code, lang) async function that returns pre-rendered HTML with dual-theme CSS variables (--shiki-light and --shiki-dark) |
| `lib/supabase/client.ts` | Browser-side Supabase client using createBrowserClient from @supabase/ssr. Used in Client Components |
| `lib/supabase/server.ts` | Server-side Supabase client using createServerClient. Reads/sets cookies via next/headers. Used in Server Components and Route Handlers |
| `lib/supabase/middleware.ts` | Supabase session refresh utility for proxy.ts. Calls updateSession() which refreshes the auth token and returns { supabaseResponse, user } |

### Config & Docs

| File | Purpose |
|------|---------|
| `proxy.ts` | Next.js 16 proxy (middleware). Exported as `proxy` function (not `middleware`). Protects /profile route - redirects unauthenticated users to /login?returnUrl=/profile |
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
│   ├── login/
│   │   └── page.tsx                  # Email/password login form (/login)
│   ├── signup/
│   │   └── page.tsx                  # Email/password signup form (/signup)
│   ├── profile/
│   │   └── page.tsx                  # User progress dashboard (/profile)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts              # OAuth callback handler (/auth/callback)
│   └── challenges/
│       ├── page.tsx                  # Challenge list with filters (/challenges)
│       └── [id]/
│           └── page.tsx              # Individual challenge (/challenges/1-20)
│
├── components/
│   ├── ui/
│   │   ├── ThemeProvider.tsx         # Light/dark state management
│   │   ├── ThemeToggle.tsx           # Sun/moon toggle button
│   │   └── NavbarAuth.tsx            # Auth-aware nav links (Sign in / Profile)
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
│   ├── highlighter.ts                # Shiki singleton, highlight() function
│   └── supabase/
│       ├── client.ts                 # Browser-side Supabase client
│       ├── server.ts                 # Server-side Supabase client
│       └── middleware.ts             # updateSession() for proxy.ts
│
├── public/                           # Static assets
│
├── proxy.ts                          # Next.js 16 middleware (auth protection)
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

### Auth flow (Phase 3)

```
User visits /profile (unauthenticated)
        down
proxy.ts intercepts request
        down
lib/supabase/middleware.ts updateSession() - no valid session found
        down
proxy.ts redirects to /login?returnUrl=/profile
        down
User submits login form - Supabase signInWithPassword
        down
Session cookie set - router.push(returnUrl)
        down
User lands on /profile - proxy.ts allows through
        down
app/profile/page.tsx fetches user_progress from Supabase
        down
Renders progress bar and challenge checklist
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
| `/login` | Static (SSG) | 1 | Static form shell, dynamic via client JS |
| `/signup` | Static (SSG) | 1 | Static form shell, dynamic via client JS |
| `/profile` | Dynamic (f) | 1 | Protected route, fetches live user data |
| `/auth/callback` | Dynamic (f) | 1 | Route handler, exchanges auth code |
| `/_not-found` | Static | 1 | Custom 404 |

Total static pages: 26. /profile and /auth/callback require server runtime.

---

## Component Roles

| Component | Type | Responsibility |
|-----------|------|----------------|
| `app/layout.tsx` | Server | Root shell, anti-FOUC script, ThemeProvider wrapper |
| `app/page.tsx` | Server | Landing page |
| `app/not-found.tsx` | Server | 404 page |
| `app/login/page.tsx` | Client | Email/password login form, redirects on success |
| `app/signup/page.tsx` | Client | Email/password signup form, shows confirmation state |
| `app/profile/page.tsx` | Server | Protected progress dashboard, reads user_progress |
| `app/auth/callback/route.ts` | Route Handler | Exchanges auth code for session |
| `app/challenges/page.tsx` | Server | Challenge list shell, passes data to ChallengeFilters |
| `app/challenges/[id]/page.tsx` | Server | Runs Shiki, passes data to ChallengeView |
| `ChallengeView.tsx` | Client | Reveal interaction (useState) |
| `ChallengeFilters.tsx` | Client | Filter state (useState), renders filtered cards |
| `NavbarAuth.tsx` | Client | Auth-aware nav: Sign in or Profile link via onAuthStateChange |
| `ThemeProvider.tsx` | Client | Theme state, useTheme() hook |
| `ThemeToggle.tsx` | Client | Toggle button, reads useTheme() |

---

## Environment Variables

```
# Active (Phase 3)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
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