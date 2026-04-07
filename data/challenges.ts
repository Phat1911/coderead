import { Challenge } from '@/types/challenge'
// Updated: added 15 new challenges (ids 6-20), total 20

export const challenges: Challenge[] = [
  {
    id: '1',
    title: 'What does this function return?',
    description: 'A common JavaScript function used in almost every AI-generated app.',
    language: 'javascript',
    difficulty: 'beginner',
    code: `function formatName(firstName, lastName) {
  if (!firstName && !lastName) {
    return 'Anonymous'
  }
  return \`\${firstName} \${lastName}\`.trim()
}`,
    question: 'What does this function return if you call formatName("", "Tran")?',
    explanation: `It returns "Tran". 
Here is why: the first check (!firstName && !lastName) requires BOTH to be empty to return "Anonymous". Since lastName is "Tran", that condition is false. 
The template literal produces " Tran" (with a leading space), and .trim() removes that space, giving you "Tran".
Key insight: && means BOTH conditions must be true. If only one is empty, it falls through to the return statement.`,
    keyConceptsToSpot: ['&& vs || logic', 'template literals', '.trim()', 'truthy/falsy values']
  },
  {
    id: '2',
    title: 'Spot the async pattern',
    description: 'AI generates this pattern constantly when fetching data from an API.',
    language: 'javascript',
    difficulty: 'beginner',
    code: `async function getUser(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return null
  }
}`,
    question: 'What does this function return if the API call fails?',
    explanation: `It returns null.
When the fetch fails (network error, server down), JavaScript throws an error. The catch block catches that error, logs it to the console, and returns null instead of crashing.
Key insight: async/await functions always need try/catch. Without it, errors would crash your app silently. The return null is a safe fallback so the rest of your code does not break.`,
    keyConceptsToSpot: ['async/await', 'try/catch error handling', 'fetch API', 'return null as fallback']
  },
  {
    id: '3',
    title: 'Read this React hook',
    description: 'The most common React pattern AI writes for managing component data.',
    language: 'typescript',
    difficulty: 'beginner',
    code: `import { useState, useEffect } from 'react'

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return width
}`,
    question: 'What does the "return () =>" line inside useEffect do?',
    explanation: `It is a cleanup function. React runs it when the component is removed from the screen.
Without it, every time this component mounts it would add a new resize listener. Over time you would have dozens of listeners stacking up, causing memory leaks and performance issues.
The cleanup says: "When this component is gone, remove the listener you added."
Key insight: The [] at the end of useEffect means "run this once when the component appears." The return function means "run this when it disappears."`,
    keyConceptsToSpot: ['useState', 'useEffect cleanup', 'event listeners', 'memory leaks', 'empty dependency array']
  },
  {
    id: '4',
    title: 'Trace this array transformation',
    description: 'AI uses this pattern to transform lists of data before displaying them.',
    language: 'typescript',
    difficulty: 'intermediate',
    code: `const users = [
  { id: 1, name: 'Phat', active: true },
  { id: 2, name: 'Nam', active: false },
  { id: 3, name: 'Linh', active: true },
]

const activeNames = users
  .filter(user => user.active)
  .map(user => user.name.toUpperCase())`,
    question: 'What is the value of activeNames after this code runs?',
    explanation: `The value is ["PHAT", "LINH"].
Step 1 - .filter(): Goes through every user, keeps only the ones where active is true. That gives you Phat and Linh. Nam is removed.
Step 2 - .map(): Takes each remaining user and returns just their name in uppercase.
Result: ["PHAT", "LINH"]
Key insight: filter reduces the array (removes items), map transforms it (changes each item). Chaining them is one of the most common patterns in AI-generated code.`,
    keyConceptsToSpot: ['.filter()', '.map()', 'method chaining', 'arrow functions', '.toUpperCase()']
  },
  {
    id: '5',
    title: 'Read this error message pattern',
    description: 'Understanding how AI structures error responses from a backend API.',
    language: 'typescript',
    difficulty: 'intermediate',
    code: `async function createPost(title: string, content: string) {
  if (!title.trim()) {
    throw new Error('Title is required')
  }
  if (content.length < 10) {
    throw new Error('Content must be at least 10 characters')
  }

  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }

  return response.json()
}`,
    question: 'How many different ways can this function throw an error?',
    explanation: `Three ways:
1. If title is empty or just spaces - throws "Title is required" before any network call.
2. If content is shorter than 10 characters - throws the length error before any network call.
3. If the server responds with a non-OK status (400, 404, 500, etc.) - reads the error from the server and throws it.
Key insight: Good AI-generated functions validate input BEFORE calling the API. This saves unnecessary network requests. The !response.ok check is how you detect server errors - a response can "succeed" technically (no network failure) but still return an error status from the server.`,
    keyConceptsToSpot: ['input validation', 'throw new Error', 'response.ok', 'JSON.stringify', 'multiple error paths']
  },
  {
    id: '6',
    title: 'What does this string method return?',
    description: 'AI uses string methods constantly. This one trips up beginners.',
    language: 'javascript',
    difficulty: 'beginner',
    code: `function getInitials(fullName) {
  return fullName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
}`,
    question: 'What does getInitials("john doe smith") return?',
    explanation: `It returns "JDS".
Here is why: split(' ') breaks the string into an array ["john", "doe", "smith"]. Then map(word => word[0]) takes the first character of each word, giving ["j", "d", "s"]. join('') glues them together into "jds". Finally toUpperCase() converts to "JDS".
Key insight: These four steps form a common chain pattern in AI-generated code. Each method returns a new value that the next method operates on. Reading it top to bottom like a recipe makes it easy to follow.`,
    keyConceptsToSpot: ['string split', 'array map', 'array join', 'method chaining', 'toUpperCase']
  },
  {
    id: '7',
    title: 'Array basics: find vs filter',
    description: 'Two array methods that look similar but behave very differently.',
    language: 'javascript',
    difficulty: 'beginner',
    code: `const users = [
  { id: 1, name: 'Alice', active: true },
  { id: 2, name: 'Bob', active: false },
  { id: 3, name: 'Carol', active: true }
]

const result1 = users.find(u => u.active)
const result2 = users.filter(u => u.active)`,
    question: 'What is the difference between result1 and result2?',
    explanation: `result1 is a single object: { id: 1, name: "Alice", active: true }. result2 is an array of two objects: [{ id: 1, name: "Alice", active: true }, { id: 3, name: "Carol", active: true }].
Here is why: find stops at the FIRST match and returns that one item directly (not wrapped in an array). filter goes through ALL items and returns every match as an array.
Key insight: If you use find and try to call .length or .map on the result, you will get an error because it is a single object, not an array. AI sometimes mixes these up when the intent is to get all matches.`,
    keyConceptsToSpot: ['Array.find', 'Array.filter', 'single vs array return', 'short-circuit evaluation', 'truthy object properties']
  },
  {
    id: '8',
    title: 'Object destructuring with defaults',
    description: 'AI generates this pattern in function parameters constantly.',
    language: 'javascript',
    difficulty: 'beginner',
    code: `function createButton({ 
  label = 'Click me', 
  color = 'blue', 
  disabled = false 
} = {}) {
  return { label, color, disabled }
}

const a = createButton({ label: 'Submit', color: 'green' })
const b = createButton()
const c = createButton({ disabled: true })`,
    question: 'What are the values of a, b, and c?',
    explanation: `a is { label: "Submit", color: "green", disabled: false }. b is { label: "Click me", color: "blue", disabled: false }. c is { label: "Click me", color: "blue", disabled: true }.
Here is why: Destructuring with = signs sets default values. When you pass an object, only the keys you provide override the defaults. When you call createButton() with no argument at all, the = {} at the end kicks in so the function does not crash trying to destructure undefined.
Key insight: The = {} after the destructuring pattern is a safety net. Without it, calling createButton() with no argument would throw "Cannot destructure property of undefined".`,
    keyConceptsToSpot: ['destructuring defaults', 'default parameter value', 'shorthand object creation', 'undefined safety', 'function parameters']
  },
  {
    id: '9',
    title: 'Promise chaining order',
    description: 'Understanding the order of operations in Promise chains is critical for debugging AI code.',
    language: 'javascript',
    difficulty: 'intermediate',
    code: `function processOrder(orderId) {
  return fetch(\`/api/orders/\${orderId}\`)
    .then(res => res.json())
    .then(order => {
      if (order.status === 'pending') {
        return fetch(\`/api/orders/\${orderId}/confirm\`, { method: 'POST' })
      }
      return order
    })
    .then(result => {
      if (result instanceof Response) {
        return result.json()
      }
      return result
    })
    .catch(err => {
      console.error('Order failed:', err)
      return null
    })
}`,
    question: 'If the order status is "shipped", what does the second .then receive as its argument?',
    explanation: `It receives the order object directly, not a Response.
Here is why: The first .then converts the response to JSON, giving an order object. The second .then checks if status is "pending". Since it is "shipped", it hits the return order line, passing the order object straight to the next .then. The third .then checks if result is a Response instance - it is not, so it just returns the order object as-is.
Key insight: In Promise chains, whatever you return from one .then becomes the argument of the next .then. Returning a fetch() call passes a Response object forward; returning a plain value passes that value forward. The instanceof check is a defensive pattern to handle both cases.`,
    keyConceptsToSpot: ['Promise chaining', '.then return values', 'instanceof check', '.catch error handling', 'conditional branching in promises']
  },
  {
    id: '10',
    title: 'React useState with objects',
    description: 'A subtle bug AI commonly introduces when updating state that is an object.',
    language: 'javascript',
    difficulty: 'intermediate',
    code: `function ProfileForm() {
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    bio: ''
  })

  function handleChange(field, value) {
    setForm({ [field]: value })
  }

  return (
    <div>
      <input onChange={e => handleChange('name', e.target.value)} />
      <input onChange={e => handleChange('email', e.target.value)} />
    </div>
  )
}`,
    question: 'What is the bug in handleChange, and what happens when you type in the name field then the email field?',
    explanation: `The bug is that setForm({ [field]: value }) replaces the ENTIRE state object with just one key, wiping out all other fields.
After typing in name: form becomes { name: "whatever you typed" } - email and bio are gone.
After then typing in email: form becomes { email: "whatever you typed" } - name is now gone too.
The fix is to spread the existing state first: setForm({ ...form, [field]: value }). The spread (...form) copies all existing keys, then [field]: value overrides just the one you want to change.
Key insight: React does not merge object state automatically like class components did with setState. With hooks, you must manually spread the old state when updating nested properties.`,
    keyConceptsToSpot: ['useState object state', 'spread operator', 'computed property names', 'state replacement vs merge', 'React hooks']
  },
  {
    id: '11',
    title: 'Python list comprehension',
    description: 'Python list comprehensions are dense but powerful. AI generates them everywhere.',
    language: 'python',
    difficulty: 'intermediate',
    code: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

evens = [n for n in numbers if n % 2 == 0]
squares_of_evens = [n ** 2 for n in numbers if n % 2 == 0]
words = ['hello', 'world', 'python']
upper = [w.upper() for w in words]`,
    question: 'What are the values of evens, squares_of_evens, and upper?',
    explanation: `evens is [2, 4, 6, 8, 10]. squares_of_evens is [4, 16, 36, 64, 100]. upper is ["HELLO", "WORLD", "PYTHON"].
Here is why: A list comprehension has three parts: the expression (what to produce), the loop variable (for n in numbers), and an optional filter (if n % 2 == 0). It is equivalent to a for loop that appends to a list. The % operator is the modulo/remainder operator - n % 2 == 0 means n divides evenly by 2, so it is even. n ** 2 raises n to the power of 2 (squaring it).
Key insight: List comprehensions are more concise than for loops for building lists. Reading them left to right: "give me [expression] for each [item] in [collection] where [condition]".`,
    keyConceptsToSpot: ['list comprehension', 'modulo operator', 'exponentiation', 'filter condition', 'string methods in comprehension']
  },
  {
    id: '12',
    title: 'TypeScript generics basics',
    description: 'Generics appear in almost every TypeScript codebase. AI uses them to write reusable functions.',
    language: 'typescript',
    difficulty: 'intermediate',
    code: `function getFirst<T>(arr: T[]): T | undefined {
  return arr[0]
}

function wrap<T>(value: T): { data: T; timestamp: number } {
  return { data: value, timestamp: Date.now() }
}

const num = getFirst([1, 2, 3])
const str = getFirst(['a', 'b', 'c'])
const empty = getFirst([])`,
    question: 'What are the TypeScript types of num, str, and empty?',
    explanation: `num is type number | undefined. str is type string | undefined. empty is type unknown | undefined (TypeScript infers the array as never[] for an empty array, so T becomes unknown or never depending on context).
Here is why: The <T> is a type parameter - a placeholder that TypeScript fills in based on what you pass. When you call getFirst([1, 2, 3]), TypeScript sees an array of numbers and sets T to number, so the return type becomes number | undefined. The | undefined covers the case where the array is empty and arr[0] returns undefined.
Key insight: Generics let one function work with many types while keeping full type safety. Without generics, you would either write separate functions for each type or use any (which loses all type checking).`,
    keyConceptsToSpot: ['generic type parameter', 'type inference', 'union type with undefined', 'reusable typed functions', 'array type syntax']
  },
  {
    id: '13',
    title: 'Array reduce explained',
    description: 'reduce is the most powerful and most misunderstood array method. AI uses it for aggregations.',
    language: 'javascript',
    difficulty: 'intermediate',
    code: `const orders = [
  { product: 'Book', price: 12, qty: 2 },
  { product: 'Pen', price: 3, qty: 5 },
  { product: 'Notebook', price: 8, qty: 1 }
]

const total = orders.reduce((acc, order) => {
  return acc + (order.price * order.qty)
}, 0)

const byProduct = orders.reduce((acc, order) => {
  acc[order.product] = order.price * order.qty
  return acc
}, {})`,
    question: 'What are the values of total and byProduct?',
    explanation: `total is 47. byProduct is { Book: 24, Pen: 15, Notebook: 8 }.
Here is why: reduce takes a callback and a starting value (the second argument after the comma). For total: it starts at 0, then adds 12*2=24 (total: 24), then adds 3*5=15 (total: 39), then adds 8*1=8 (total: 47). For byProduct: it starts with an empty object {}, and each iteration adds a key using the product name and sets the value to price times qty. The acc (accumulator) is the running result that gets passed to each iteration.
Key insight: reduce is like a snowball rolling downhill - it accumulates a result as it goes. The second argument (0 or {}) sets what shape the result starts as. The callback must always return acc or the accumulation breaks.`,
    keyConceptsToSpot: ['Array.reduce', 'accumulator pattern', 'initial value', 'building objects with reduce', 'multiplication in iteration']
  },
  {
    id: '14',
    title: 'Closure and counter',
    description: 'Closures are a fundamental JavaScript concept. AI uses this pattern for factories and encapsulation.',
    language: 'javascript',
    difficulty: 'intermediate',
    code: `function makeCounter(start = 0) {
  let count = start

  return {
    increment() { count += 1 },
    decrement() { count -= 1 },
    reset() { count = start },
    value() { return count }
  }
}

const counter = makeCounter(10)
counter.increment()
counter.increment()
counter.increment()
counter.decrement()
const result = counter.value()
counter.reset()
const afterReset = counter.value()`,
    question: 'What are result and afterReset?',
    explanation: `result is 12. afterReset is 10.
Here is why: makeCounter(10) sets count to 10 and start to 10. Three increment calls bring count to 13. One decrement brings it to 12. counter.value() returns 12. counter.reset() sets count back to start which is 10 (not 0, because start captured the original argument). So afterReset is 10.
Key insight: This is a closure. The inner functions (increment, decrement, reset, value) all "close over" the count and start variables from the outer function. Even after makeCounter finishes running, those variables stay alive because the returned object holds references to them. Each call to makeCounter creates its own independent count and start.`,
    keyConceptsToSpot: ['closure', 'lexical scope', 'factory function', 'encapsulated state', 'default parameters']
  },
  {
    id: '15',
    title: 'Python decorator pattern',
    description: 'Decorators are everywhere in Python - Flask routes, logging, caching. AI generates them constantly.',
    language: 'python',
    difficulty: 'advanced',
    code: `import time

def timer(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.2f}s")
        return result
    return wrapper

@timer
def slow_sum(numbers):
    time.sleep(0.1)
    return sum(numbers)

output = slow_sum([1, 2, 3, 4, 5])`,
    question: 'What does @timer do, and what is the value of output?',
    explanation: `@timer replaces the slow_sum function with the wrapper function that timer returns. output is 15.
Here is why: A decorator is syntactic sugar. Writing @timer above slow_sum is exactly the same as writing slow_sum = timer(slow_sum) after the function definition. When you call slow_sum([1,2,3,4,5]), you are actually calling wrapper([1,2,3,4,5]). wrapper records the start time, calls the ORIGINAL slow_sum (stored as func), records the end time, prints how long it took, and returns the result. The *args and **kwargs mean wrapper can accept any arguments and pass them through to func.
Key insight: Decorators are wrappers. They add behavior (timing, logging, auth checks) around a function without modifying the function itself. The pattern is always: outer function takes func, inner function (wrapper) calls func and adds extra behavior, outer function returns wrapper.`,
    keyConceptsToSpot: ['decorator syntax', 'higher-order function', '*args **kwargs', 'time.time()', 'function wrapping pattern']
  },
  {
    id: '16',
    title: 'TypeScript discriminated unions',
    description: 'Discriminated unions are how TypeScript models "one of several shapes". AI uses this for API responses and state machines.',
    language: 'typescript',
    difficulty: 'advanced',
    code: `type LoadingState = { status: 'loading' }
type SuccessState = { status: 'success'; data: string[] }
type ErrorState = { status: 'error'; message: string }

type State = LoadingState | SuccessState | ErrorState

function render(state: State): string {
  switch (state.status) {
    case 'loading':
      return 'Loading...'
    case 'success':
      return state.data.join(', ')
    case 'error':
      return \`Error: \${state.message}\`
  }
}`,
    question: 'Why can you access state.data inside the "success" case but not outside the switch, and what happens if you forget a case?',
    explanation: `Inside the "success" case, TypeScript has narrowed the type of state from the broad union (State) down to specifically SuccessState. It knows that only SuccessState has a data property, so it allows you to access it. Outside the switch, state could be any of the three types, so TypeScript will not let you access data because loading and error states do not have that property.
If you forget a case, TypeScript will not always warn you unless you add a never check at the end. The switch falls through to undefined and the function returns undefined without TypeScript complaining by default.
Key insight: The status field is the discriminant - it is the shared key that has a unique literal value in each type. TypeScript uses it to figure out which "branch" of the union you are in. This pattern makes it impossible to access data on an error state, catching bugs at compile time instead of runtime.`,
    keyConceptsToSpot: ['discriminated union', 'type narrowing', 'literal types', 'switch exhaustiveness', 'union type']
  },
  {
    id: '17',
    title: 'Custom React hook',
    description: 'Custom hooks are how AI encapsulates reusable logic. Understanding them is essential for reading modern React code.',
    language: 'typescript',
    difficulty: 'advanced',
    code: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  function setValue(value: T) {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.error('Could not save to localStorage')
    }
  }

  return [storedValue, setValue] as const
}`,
    question: 'What does the function passed to useState do, and why is it a function instead of a direct value?',
    explanation: `The function passed to useState is a lazy initializer. It runs ONCE when the component first mounts and its return value becomes the initial state. It checks localStorage for a saved value under the key. If found, it parses the JSON and returns it. If not found (or if JSON.parse throws), it falls back to initialValue.
Why a function instead of a direct value: If you wrote useState(window.localStorage.getItem(key)) directly, that localStorage read would run on EVERY render, wasting performance. With the function form, useState knows to only call it once during initialization.
Key insight: The as const at the end tells TypeScript the returned array has a fixed tuple type [T, typeof setValue] instead of a general Array type. Without it, TypeScript would not know which element is the value and which is the setter, making destructuring less safe. The try/catch blocks handle cases where localStorage is blocked (private browsing mode, etc.).`,
    keyConceptsToSpot: ['custom hook', 'lazy useState initializer', 'localStorage serialization', 'generic type parameter', 'as const tuple']
  },
  {
    id: '18',
    title: 'Async race condition',
    description: 'Race conditions in async code are a classic AI-generated bug that is hard to spot.',
    language: 'typescript',
    difficulty: 'advanced',
    code: `function SearchComponent() {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<string[]>([])

  React.useEffect(() => {
    if (!query) return

    async function search() {
      const data = await fetchResults(query)
      setResults(data)
    }

    search()
  }, [query])

  return <input onChange={e => setQuery(e.target.value)} />
}`,
    question: 'What is the race condition bug here, and how would you fix it?',
    explanation: `The bug: if the user types quickly, multiple searches run at the same time. If the user types "re", then "react", two fetches are in flight. If "re" responds AFTER "react", the results for "re" overwrite the results for "react", showing stale data.
Here is why it is a problem: fetchResults("re") might take 500ms while fetchResults("react") takes 100ms. Even though "react" was searched later, "re" finishes last and setResults is called with the wrong data.
The fix: use a cleanup function to cancel the stale request. Add a boolean flag: let cancelled = false inside useEffect. In the search function, only call setResults(data) if !cancelled. Return a cleanup from useEffect: return () => { cancelled = true }. React calls that cleanup before running the effect again with a new query.
Key insight: useEffect cleanup is the key mechanism for cancelling stale async operations. Any time you have async work inside useEffect with a dependency that changes, you need to guard against stale responses.`,
    keyConceptsToSpot: ['race condition', 'useEffect cleanup', 'stale closure', 'async in useEffect', 'cancellation pattern']
  },
  {
    id: '19',
    title: 'Python context manager',
    description: 'Context managers handle setup and teardown automatically. AI uses them for files, database connections, and locks.',
    language: 'python',
    difficulty: 'advanced',
    code: `class DatabaseConnection:
    def __init__(self, host: str):
        self.host = host
        self.connection = None

    def __enter__(self):
        print(f"Connecting to {self.host}")
        self.connection = {"host": self.host, "active": True}
        return self.connection

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("Closing connection")
        self.connection["active"] = False
        if exc_type is not None:
            print(f"Error occurred: {exc_val}")
            return False
        return True

with DatabaseConnection("localhost") as conn:
    print(conn["active"])
    raise ValueError("Something went wrong")`,
    question: 'What gets printed, and does the ValueError propagate after the with block?',
    explanation: `Printed in order: "Connecting to localhost", "True", "Closing connection", "Error occurred: Something went wrong". Then the ValueError propagates and crashes the program (or is caught by an outer try/except).
Here is why: The with statement calls __enter__ first, which connects and returns the connection dict. Inside the block, conn["active"] is True so it prints "True". Then ValueError is raised. Python immediately calls __exit__, passing the exception details. __exit__ prints "Closing connection" and "Error occurred: Something went wrong". The return False at the end tells Python to NOT suppress the exception - let it propagate.
Key insight: Returning True from __exit__ swallows the exception (useful for retry logic). Returning False lets it propagate. The __exit__ method ALWAYS runs even if an exception occurs - this is the whole point of context managers: guaranteed cleanup. The with open("file") pattern you see everywhere works the same way.`,
    keyConceptsToSpot: ['context manager protocol', '__enter__ and __exit__', 'exception propagation', 'guaranteed cleanup', 'with statement']
  },
  {
    id: '20',
    title: 'TypeScript utility types',
    description: 'Utility types like Partial, Pick, and Omit appear in nearly every TypeScript project. AI generates these for API wrappers and form handlers.',
    language: 'typescript',
    difficulty: 'advanced',
    code: `interface User {
  id: number
  name: string
  email: string
  password: string
  createdAt: Date
}

type PublicUser = Omit<User, 'password'>
type UserPreview = Pick<User, 'id' | 'name'>
type UpdateUser = Partial<Omit<User, 'id' | 'createdAt'>>

function updateUser(id: number, changes: UpdateUser): void {
  console.log(id, changes)
}

updateUser(1, { name: 'Alice' })
updateUser(1, { email: 'a@b.com', password: 'new' })`,
    question: 'What fields are available on PublicUser, UserPreview, and UpdateUser? Why would you use UpdateUser for the changes parameter instead of Partial<User>?',
    explanation: `PublicUser has id, name, email, and createdAt - everything except password. UserPreview has only id and name. UpdateUser has name, email, and password - all optional (you can provide any combination or none).
Why UpdateUser instead of Partial<User>: Partial<User> would include id and createdAt as optional, meaning you could accidentally pass { id: 999 } in the changes object and TypeScript would not complain. By using Omit first to remove id and createdAt before making them Partial, you make it structurally impossible to change those fields through this function.
Key insight: TypeScript utility types are composable - you can nest them. Partial<Omit<User, 'id'>> means "all fields except id, all of which are optional". This lets you model exactly the shape your API accepts without creating a completely new interface from scratch.`,
    keyConceptsToSpot: ['Omit utility type', 'Pick utility type', 'Partial utility type', 'composing utility types', 'type safety for mutations']
  }
]
