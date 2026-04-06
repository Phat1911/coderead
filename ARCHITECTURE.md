# CodeRead - Architecture

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | Frontend + backend in one project |
| Language | TypeScript | Type safety across all files |
| Styling | Tailwind CSS | Utility-first responsive styling |
| Database | Supabase (Phase 3+) | User accounts, challenge storage |
| Hosting | Vercel | Deployment, CDN, auto-deploy on push |
| Version Control | GitHub | Source of truth for all code |

---

## Folder Structure

```
D:\coderead
├── app/                          # Next.js App Router - pages live here
│   ├── layout.tsx                # Root layout - wraps every page
│   ├── page.tsx                  # Landing page (/)
│   └── challenges/
│       ├── page.tsx              # Challenge list (/challenges)
│       └── [id]/
│           └── page.tsx          # Single challenge (/challenges/1)
│
├── components/                   # Reusable UI pieces
│   ├── ui/                       # Generic UI (buttons, badges, theme toggle)
│   └── challenge/
│       └── ChallengeView.tsx     # Interactive challenge reveal component
│
├── data/
│   └── challenges.ts             # Hardcoded challenge content (Phase 1)
│
├── types/
│   └── challenge.ts              # TypeScript type definitions
│
├── lib/                          # Utilities and helpers (currently empty)
│
├── public/                       # Static assets (images, icons)
│
├── ARCHITECTURE.md               # This file
├── ROADMAP.md                    # Product roadmap by phase
└── TEAM.md                       # AI team roles and workflow
```

---

## Data Flow

```
User visits /challenges/1
        down
Next.js [id]/page.tsx reads challenges array from data/challenges.ts
        down
Finds challenge where id === "1"
        down
Passes challenge object as props to ChallengeView component
        down
ChallengeView renders code block + question
        down
User clicks "Reveal" - useState flips revealed to true
        down
Explanation and key concepts appear
```

---

## Core Data Model

```typescript
Challenge {
  id: string                  // URL identifier
  title: string               // Challenge title
  description: string         // One-line context
  code: string                // The code snippet to read
  language: string            // "javascript" or "typescript"
  difficulty: Difficulty      // "beginner" | "intermediate" | "advanced"
  question: string            // What the user must answer
  explanation: string         // Plain English explanation revealed on click
  keyConceptsToSpot: string[] // Tags shown after reveal
}
```

---

## Rendering Strategy

| Route | Strategy | Why |
|-------|----------|-----|
| `/` | Static (SSG) | Content never changes, fast load |
| `/challenges` | Static (SSG) | Same - list from hardcoded data |
| `/challenges/[id]` | Static (SSG) | generateStaticParams pre-builds all 5 pages |
| Future user pages | Server-Side (SSR) | Needs auth + dynamic user data |

All Phase 1 pages are fully static - no server required at runtime. Vercel serves them from CDN instantly.

---

## Component Roles

| Component | Type | Responsibility |
|-----------|------|----------------|
| `app/layout.tsx` | Server | Root HTML shell, fonts, ThemeProvider |
| `app/page.tsx` | Server | Landing page, hero, featured challenges |
| `app/challenges/page.tsx` | Server | Full challenge list with filters |
| `app/challenges/[id]/page.tsx` | Server | Fetches challenge data, passes to view |
| `ChallengeView.tsx` | Client | Reveal interaction (needs useState) |
| `ThemeProvider.tsx` (Phase 2) | Client | Light/dark mode state, localStorage |
| `ThemeToggle.tsx` (Phase 2) | Client | Sun/moon toggle button |

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

## Environment Variables (Phase 3+)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Phase 1 has zero environment variables - no .env file needed.

---

## Deployment Pipeline

```
Phát pushes to GitHub main branch
        down
Vercel detects push via webhook
        down
Vercel runs npm run build
        down
Build output deployed to Vercel CDN
        down
Live at coderead.vercel.app (or custom domain)
```

---

*Built with [Orion](https://meetorion.app)*
