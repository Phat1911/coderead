# CodeRead - Product Roadmap

---

## Phase 1 - MVP (Current)
**Goal:** Validate the concept. Ship fast, get feedback.

- [x] Project setup (Next.js + TypeScript + Tailwind)
- [x] Folder architecture
- [x] 5 hardcoded code reading challenges (beginner + intermediate)
- [x] Landing page with hero + featured challenges
- [x] Challenge list page
- [x] Individual challenge page with reveal interaction
- [x] Difficulty badges (beginner, intermediate, advanced)
- [x] Previous / Next navigation between challenges
- [x] Team roles file (TEAM.md)
- [ ] Deploy to Vercel
- [ ] Set up GitHub repository
- [ ] Share with first users and collect feedback

---

## Phase 2 - Content + Polish
**Goal:** Make it worth coming back to.

- [ ] Expand to 20+ challenges
- [ ] Add advanced difficulty challenges
- [ ] Add syntax highlighting to code blocks (Shiki)
- [ ] Add difficulty filter on challenges list page
- [ ] Add language filter (JavaScript, TypeScript, Python)
- [ ] Add challenge count and progress indicator
- [ ] Improve mobile layout
- [ ] Add SEO metadata per challenge page (generateMetadata)
- [ ] Custom 404 page

---

## Phase 3 - User Accounts
**Goal:** Track progress, increase retention.

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

## Current Sprint (Phase 1 Completion)

| Task | Owner | Status |
|------|-------|--------|
| Deploy to Vercel | Claude Code | Pending |
| Set up GitHub repo | Claude Code | Pending |
| First user feedback | Phát | Pending |

---

*Built with [Orion](https://meetorion.app)*
