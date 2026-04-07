# CodeRead - Product Roadmap

---

## Phase 1 - MVP
**Goal:** Validate the concept. Ship fast, get feedback.
**Status: Complete**

- [x] Project setup (Next.js + TypeScript + Tailwind)
- [x] Folder architecture
- [x] 5 hardcoded code reading challenges (beginner + intermediate)
- [x] Landing page with hero + featured challenges
- [x] Challenge list page
- [x] Individual challenge page with reveal interaction
- [x] Difficulty badges (beginner, intermediate, advanced)
- [x] Previous / Next navigation between challenges
- [x] Team roles file (TEAM.md)
- [x] Deploy to Vercel
- [x] Set up GitHub repository (github.com/Phat1911/coderead)
- [x] Custom domain (codeoneread.tech)

---

## Phase 2 - Content + Polish
**Goal:** Make it worth coming back to.
**Status: Complete**

- [x] Expand to 20+ challenges (20 total)
- [x] Add advanced difficulty challenges (7 advanced)
- [x] Add Python as third language (3 Python challenges)
- [x] Add syntax highlighting to code blocks (Shiki, dual light/dark theme)
- [x] Add difficulty filter on challenges list page
- [x] Add language filter (JavaScript, TypeScript, Python)
- [x] Add challenge count and progress indicator
- [x] Improve mobile layout
- [x] Add SEO metadata per challenge page (generateMetadata)
- [x] Custom 404 page
- [x] Light / dark mode with theme toggle
- [x] Anti-FOUC script (no flash on Vercel)
- [x] ARCHITECTURE.md with full file map

---

## Phase 3 - User Accounts
**Goal:** Track progress, increase retention.
**Status: Next**

- [ ] Integrate Supabase Auth (email + Google login)
- [ ] User profile page
- [ ] Mark challenges as completed
- [ ] Progress bar showing X of Y challenges done
- [ ] Streak tracking (days practiced in a row)
- [ ] Migrate challenges from hardcoded to Supabase database
- [ ] Admin panel for adding/editing challenges

---

## Phase 4 - Learning Experience
**Goal:** Make the learning deeper and more structured.

- [ ] Concept tags per challenge (e.g. "async/await", "useEffect")
- [ ] Filter challenges by concept tag
- [ ] Learning paths (curated sequences of challenges by topic)
- [ ] "Explain this to me" button - AI explains the code in plain language
- [ ] Hint system - progressive hints before revealing full explanation
- [ ] Bookmarks - save challenges to revisit
- [ ] Search challenges by keyword

---

## Phase 5 - Growth
**Goal:** Bring in users and build the community.

- [ ] Public challenge submission by users
- [ ] Leaderboard (most challenges completed)
- [ ] Share challenge as image (for social media)
- [ ] Weekly email digest with a new challenge
- [ ] Referral system
- [ ] Analytics (Posthog or Plausible)
- [ ] Landing page redesign with social proof

---

## Tech Debt + Ongoing

- [ ] Write unit tests for challenge data validation
- [ ] Set up error monitoring (Sentry)
- [ ] Lighthouse performance audit
- [ ] Accessibility audit (WCAG 2.1)
- [ ] Environment variable management (Vercel env drift prevention)

---

## Current Sprint (Phase 3 Start)

| Task | Owner | Status |
|------|-------|--------|
| Set up Supabase project | Phat + Orion | Pending |
| Integrate Supabase Auth | Claude Code | Pending |
| User profile page | Claude Code | Pending |
| Mark challenges as completed | Claude Code | Pending |

---

*Built with [Orion](https://meetorion.app)*