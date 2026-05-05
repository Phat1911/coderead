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
**Status: Complete**

- [x] Integrate Supabase Auth (email — Google login deferred to Phase 5)
- [x] Email OTP verification before account creation (prevents wasted auth records)
- [x] User profile page
- [x] Mark challenges as completed
- [x] Progress bar showing X of Y challenges done
- [x] Streak tracking (days practiced in a row)
- [ ] Migrate challenges from hardcoded to Supabase database (deferred — no value until user submissions or admin panel is needed)
- [ ] Admin panel for adding/editing challenges (deferred — depends on Supabase migration)

---

## Phase 4 - Learning Experience
**Goal:** Make the learning deeper and more structured.
**Status: Complete**

- [x] Concept tags per challenge (e.g. "async/await", "useEffect")
- [x] Filter challenges by concept tag
- [x] Learning paths (curated sequences of challenges by topic)
- [x] "Explain this to me" button - AI explains the code in plain language
- [x] Hint system - progressive hints before revealing full explanation
- [x] Bookmarks - save challenges to revisit
- [x] Search challenges by keyword

---

## Phase 5 - Growth
**Goal:** Bring in users and build the community.

- [x] Leaderboard
- [x] Analytics (PostHog)
- [x] Landing page redesign with social proof
- [x] Debug challenges (Find the Bug)
- [ ] Public challenge submission by users
- [ ] Share challenge as image (for social media)
- [ ] Weekly email digest with a new challenge
- [ ] Referral system

---

## Tech Debt + Ongoing

- [ ] Write unit tests for challenge data validation
- [ ] Set up error monitoring (Sentry)
- [ ] Lighthouse performance audit
- [ ] Accessibility audit (WCAG 2.1)
- [ ] Environment variable management (Vercel env drift prevention)

---
