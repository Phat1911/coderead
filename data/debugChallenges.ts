/**
 * @file data/debugChallenges.ts
 * @description Hardcoded "Find the Bug" challenges.
 *
 *              Lives in code (not Supabase) for the same reasons as data/challenges.ts:
 *              every debug page is pre-rendered at build time, changes go through code
 *              review, and the content is version-controlled next to the UI that reads it.
 *
 *              bugLineIndex is 0-based and indexes into code.split('\n'). The render
 *              layer converts to 1-based for display. Each snippet is written to look
 *              like plausible AI-generated output — the bug is subtle by design.
 *
 * Built with Orion (meetorion.app)
 */

import { DebugChallenge } from '@/types/challenge'

export const debugChallenges: DebugChallenge[] = [
  {
    id: '1',
    title: 'The order that never saves',
    description: 'A checkout handler that logs success but leaves an empty database.',
    language: 'javascript',
    difficulty: 'beginner',
    code: `async function placeOrder(cart, userId) {
  const total = cart.reduce((sum, item) => sum + item.price, 0)
  const order = { userId, items: cart, total, createdAt: new Date() }
  db.orders.insert(order)
  await sendConfirmationEmail(userId, order)
  console.log('Order placed:', order)
  return order
}`,
    bugLineIndex: 3,
    bugDescription: 'The database insert is fire-and-forget — the email may send before the row is ever written.',
    explanation: `db.orders.insert() returns a Promise, but the call is missing await. The function keeps going to sendConfirmationEmail and console.log while the insert is still in flight. If the DB write fails (constraint violation, network blip), the confirmation email has already gone out to the customer.

Fix: add await in front of db.orders.insert(order). Now the function only proceeds once the row is durable.

Why AI loves producing this bug: async calls that are "fire and forget" look fine — the code reads top to bottom, the happy path works in dev, and the bug only surfaces under load or failure.`,
    aiExplanation: 'Imagine a cashier who announces "sold!" over the intercom before actually scanning the item. Most of the time it works because scanning is fast. But if the scanner jams, the store has already told everyone the sale happened. Adding await is like waiting for the beep before announcing — you only commit to the next step once the previous one is truly done.',
    keyConceptsToSpot: ['async/await', 'missing await', 'promise ordering', 'fire-and-forget bugs'],
    tags: ['async/await', 'database', 'subtle'],
  },
  {
    id: '2',
    title: 'The admin check that lets everyone in',
    description: 'A role guard that compiles, runs, and protects nothing.',
    language: 'javascript',
    difficulty: 'beginner',
    code: `function canAccessAdminPanel(user) {
  if (!user) return false
  if (user.role == 'admin') {
    return true
  }
  if (user.permissions.includes('admin:write')) {
    return true
  }
  return false
}`,
    bugLineIndex: 2,
    bugDescription: 'Loose equality lets truthy-but-wrong values slip through the admin check.',
    explanation: `user.role == 'admin' uses loose equality (==) instead of strict (===). On paper it still compares strings, so it *looks* harmless. The bug bites when user.role is something weird — a Number wrapper from a badly-deserialised JSON, an object with a coerced toString(), or a value like ['admin'] that coerces to the string 'admin'.

Fix: change == to ===. Strict equality compares type AND value, so only the exact string 'admin' gets through.

Why AI loves producing this bug: lots of older JS tutorials use ==, so the pattern is baked into training data. In a role check, loose equality is a security hole — not a style issue.`,
    aiExplanation: 'Think of == as a bouncer who only checks if your name "sort of sounds like" the one on the list. Usually fine, but someone named "ADMIN " with a trailing space or the array ["admin"] can still slip past. === is the strict bouncer who requires an exact match, character for character, type for type. For anything security-related, always use the strict bouncer.',
    keyConceptsToSpot: ['== vs ===', 'type coercion', 'auth checks', 'security bugs'],
    tags: ['equality', 'security', 'basics'],
  },
  {
    id: '3',
    title: 'The todo that refuses to re-render',
    description: 'A React handler that updates state, yet the UI stays frozen.',
    language: 'typescript',
    difficulty: 'intermediate',
    code: `function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])

  function toggleDone(id: string) {
    const target = todos.find((t) => t.id === id)
    if (!target) return
    target.done = !target.done
    setTodos(todos)
  }

  return <List items={todos} onToggle={toggleDone} />
}`,
    bugLineIndex: 6,
    bugDescription: 'Mutating an item inside the array keeps the array reference stable, so React bails on the re-render.',
    explanation: `target.done = !target.done mutates the object that lives inside the todos array. Because the array reference itself never changes, React's Object.is check on setTodos(todos) decides "nothing changed" and skips the re-render. The data is updated — but the UI doesn't know.

Fix: return a new array with a new object for the toggled todo:

setTodos(todos.map((t) => t.id === id ? { ...t, done: !t.done } : t))

Why AI loves producing this bug: mutating-then-setting feels natural if you came from an imperative background, and the code runs without any error. It's only wrong in the way React specifically requires.`,
    aiExplanation: 'React watches for a fresh box, not a rearranged box. When you flip an item inside the old box and hand the same box back, React looks at it and says "yep, same box I already rendered." You have to hand it a brand-new box (a new array, with a new object for the toggled todo) so React knows something actually changed.',
    keyConceptsToSpot: ['React state immutability', 'reference equality', 'why setState did not re-render', 'spread operator'],
    tags: ['react', 'state', 'immutability'],
  },
  {
    id: '4',
    title: 'The last customer no one calls',
    description: 'A batch emailer that misses exactly one person every run.',
    language: 'python',
    difficulty: 'intermediate',
    code: `def send_reminders(customers):
    sent = 0
    for i in range(len(customers) - 1):
        customer = customers[i]
        if customer.subscribed:
            send_email(customer.email, "Reminder")
            sent += 1
    print(f"Sent {sent} reminders")
    return sent`,
    bugLineIndex: 2,
    bugDescription: 'range(len(customers) - 1) stops one short, so the final customer is never emailed.',
    explanation: `range(len(customers) - 1) produces indices 0 through len(customers) - 2, meaning the loop skips the last element. For a list of 100 subscribers, only 99 get emailed — and the bug is silent because len(customers) - 1 *looks* defensive.

The author probably confused "last valid index" (which is len - 1) with "stop argument for range" (which is exclusive, so you want len).

Fix: use range(len(customers)) — or better, iterate directly: for customer in customers:.

Why AI loves producing this bug: off-by-one is the canonical AI mistake. The - 1 tends to drift from one context (array indexing) to another (loop bounds) where it doesn't belong.`,
    aiExplanation: 'The cashier says "I\'ll serve customers number 1 through one-less-than-the-last." Sounds careful — actually skips the person at the end of the queue. range is exclusive on the upper end, so range(len(customers)) already stops at the right place. Subtracting 1 on top of that drops the last person every single run.',
    keyConceptsToSpot: ['off-by-one errors', 'range() is exclusive', 'indexing vs iteration', 'silent bugs'],
    tags: ['off-by-one', 'loops', 'python'],
  },
  {
    id: '5',
    title: 'The payment that always "succeeds"',
    description: 'An API wrapper that swallows every failure and reports green.',
    language: 'typescript',
    difficulty: 'advanced',
    code: `async function chargeCustomer(customerId: string, amountCents: number) {
  try {
    const response = await fetch('/api/charge', {
      method: 'POST',
      body: JSON.stringify({ customerId, amountCents }),
    })
    const data = await response.json()
    return { success: true, chargeId: data.id }
  } catch {
    return { success: true, chargeId: null }
  }
}`,
    bugLineIndex: 8,
    bugDescription: 'The catch block reports success: true even when the charge blew up.',
    explanation: `The catch block returns { success: true, chargeId: null }. Every network error, parse failure, or thrown exception now looks like a successful charge to the caller. The caller ships the product, the customer is never billed, and no one finds out until the month-end reconciliation.

There is a second, quieter bug on the same line of defence: fetch() does NOT throw on HTTP 4xx/5xx — you'd need to check response.ok. So even a 500 from the payment API would return { success: true, chargeId: undefined } (because data.id is missing).

Fix: return { success: false, error: ... } on catch, and explicitly check response.ok before trusting the JSON.

Why AI loves producing this bug: "always return a consistent shape" is good advice, misapplied. Defaulting every field to a happy value turns the error channel off.`,
    aiExplanation: 'Imagine a smoke alarm wired to only ever chirp "all clear" — even when the house is on fire. That\'s what this catch block does: it converts every kind of failure into a fake success. The correct shape for an error branch is to actually report the error, not to paper over it with optimistic defaults.',
    keyConceptsToSpot: ['error swallowing', 'fetch does not throw on 4xx/5xx', 'honest error shapes', 'silent failures'],
    tags: ['error handling', 'fetch', 'payments'],
  },
  {
    id: '6',
    title: 'The cache that never expires',
    description: 'A memoized function that never invalidates cached values.',
    language: 'javascript',
    difficulty: 'intermediate',
    code: `const cache = new Map()

function getUserProfile(id) {
  if (cache.has(id)) return cache.get(id)
  const profile = fetchFromDb(id)
  cache.set(id, profile)
  return profile
}

function fetchFromDb(id) {
  // expensive DB call
  return { id, name: 'User ' + id }
}
`,
    bugLineIndex: 3,
    bugDescription: 'Cached values are never invalidated, so stale profiles are served forever.',
    explanation: `The function stores DB results in an in-memory cache but never provides any invalidation policy (TTL, versioning, or explicit purge). If the underlying user data changes, callers will keep receiving stale data indefinitely. This is especially problematic in long-running processes or multi-instance deployments where cache coherence is not handled.

Fix: add TTL or a cache-busting mechanism, or move to a bounded cache that supports entry expiry or manual invalidation when updates occur.`,
    aiExplanation: 'Think of a bulletin board where notices are pinned once and never removed — eventually the notices are wrong but nobody replaces them. Caches need a plan for lifespan or invalidation.',
    keyConceptsToSpot: ['caching', 'stale data', 'invalidation', 'TTL'],
    tags: ['cache', 'stale-data', 'invalidation'],
  },
  {
    id: '7',
    title: 'The map that returns all undefined',
    description: 'An array transform that accidentally returns undefined for every item.',
    language: 'javascript',
    difficulty: 'beginner',
    code: `const names = users.map((u) => {
  u.full = u.first + ' ' + u.last
})

console.log(names)
`,
    bugLineIndex: 1,
    bugDescription: 'Arrow function uses a block without an explicit return, so `map` fills the array with undefined.',
    explanation: `When using curly braces in an arrow function, you must explicitly return a value. The callback mutates each user but does not return the computed full name, so 'names' becomes [undefined, undefined, ...]. Fix by returning the value or removing braces: users.map(u => (u.first + ' ' + u.last)) or users.map(u => { return u.first + ' ' + u.last }).`,
    aiExplanation: 'Imagine asking workers to paint a sign but never telling them to hand it back — you end up with nothing to hang. `map` expects the callback to return the new value.',
    keyConceptsToSpot: ['arrow functions', 'implicit return', 'Array.map', 'return value'],
    tags: ['javascript', 'arrays', 'basics'],
  },
  {
    id: '8',
    title: 'The UPDATE that nukes the table',
    description: 'An SQL update executed without a WHERE clause.',
    language: 'sql',
    difficulty: 'advanced',
    code: `-- Intended to disable a single user, but this updates every row
UPDATE users
SET enabled = FALSE;
`,
    bugLineIndex: 3,
    bugDescription: 'Missing WHERE clause causes the UPDATE to affect all rows.',
    explanation: `Executing UPDATE without a WHERE applies the change to every row in the table. The author likely intended to target a single user but forgot the predicate. Always double-check destructive statements, use transactions, and prefer running a SELECT with the same predicate first.

Fix: add an appropriate WHERE (e.g. WHERE id = :id) and run in a transaction or with a LIMIT if supported by the dialect.`,
    aiExplanation: 'This is like telling a clerk "close all accounts" instead of "close account #123" — a tiny omission with catastrophic scope. SQL requires explicit predicates for targeted changes.',
    keyConceptsToSpot: ['SQL UPDATE', 'WHERE clause', 'destructive queries', 'transactions'],
    tags: ['sql', 'database', 'safety'],
  },
  {
    id: '9',
    title: 'The generator emptied by a peek',
    description: 'A Python generator is iterated prematurely, leaving nothing for the caller.',
    language: 'python',
    difficulty: 'intermediate',
    code: `def numbers(n):
    for i in range(n):
        yield i

it = numbers(5)
print(list(it))  # consumes the generator
# later, trying to iterate again
for x in it:
    print(x)
`,
    bugLineIndex: 6,
    bugDescription: 'Converting the generator to a list consumes it; subsequent iteration yields nothing.',
    explanation: `Generators are single-use iterators. Calling list(it) exhausts it, so the later for-loop receives no items. If multiple passes are needed, materialize the data into a list once (assign to a variable) or recreate the generator each time.

  Fix: either use a list upfront: vals = list(numbers(5)) and iterate 'vals' multiple times, or avoid consuming the generator until the final consumer needs it.`,
    aiExplanation: 'A generator is a one-way conveyor belt — once objects pass by, they are gone. If you need them twice, stash them in a box (list) first.',
    keyConceptsToSpot: ['generators', 'iterator protocol', 'single-use', 'consumption'],
    tags: ['python', 'iterators', 'generators'],
  },
  {
    id: '10',
    title: 'The buffer index off-by-one',
    description: 'A C loop that writes one past the buffer end, risking corruption.',
    language: 'c',
    difficulty: 'advanced',
    code: `void fill(char *buf, int len) {
  for (int i = 0; i <= len; i++) {
    buf[i] = '\0';
  }
}
`,
    bugLineIndex: 2,
    bugDescription: 'The loop uses `<= len` which writes one past the allocated buffer (`buf[len]`).',
    explanation: `Buffers are indexed 0..len-1. Using <= writes to index len which is outside the buffer and causes undefined behavior. The correct loop condition is i < len. When working with low-level memory, off-by-one errors can lead to crashes or security vulnerabilities.

Fix: change the loop to for (int i = 0; i < len; i++).`,
    aiExplanation: 'Indexes are fences: step one too far and you fall off. C doesn\'t warn you — it lets you corrupt memory silently. Be strict with bounds checks.',
    keyConceptsToSpot: ['off-by-one', 'buffer overflow', 'undefined behavior', 'bounds checking'],
    tags: ['c', 'memory', 'security'],
  },
]
