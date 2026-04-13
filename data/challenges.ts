/**
 * @file data/challenges.ts
 * @description Challenges live in code, not a database — this is a deliberate
 *              architectural decision.
 *
 *              The trade-off: adding a challenge requires a code change and a redeploy,
 *              not a CMS click.  What we get in return: every challenge page is
 *              statically pre-rendered at build time (zero DB queries at request time),
 *              changes are reviewed via PR like any other code, and the content is
 *              version-controlled alongside the features that depend on it.
 *
 *              Array order matters: it determines prev/next navigation on the challenge
 *              detail page, and it determines which challenges LearningPath filters return
 *              first (since learningPaths filter this array, not re-order it).
 */

import { Challenge } from '@/types/challenge'
// Total: 20 challenges (ids 1–20)

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
    keyConceptsToSpot: ['&& vs || logic', 'template literals', '.trim()', 'truthy/falsy values'],
    tags: ['conditionals', 'strings', 'basics'],
    aiExplanation: 'Think of this like a name badge maker at a conference. If someone shows up with no first name AND no last name, the machine prints "Anonymous" as a default badge. But if even ONE name is provided, it tries to print both names together. The .trim() at the end is like wiping off any extra space before handing it over. So when you pass "" and "Tran", the first check fails (because Tran exists), and it prints " Tran" then trims it to just "Tran".',
    hints: ['Think about what happens when you pass an empty string to a boolean check.', 'The && operator requires BOTH conditions to be true. What is !"" and what is !"Tran"?', 'The template literal creates " Tran" (with a leading space). What does .trim() do?']
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
    keyConceptsToSpot: ['async/await', 'try/catch error handling', 'fetch API', 'return null as fallback'],
    tags: ['async/await', 'error handling', 'fetch', 'api'],
    aiExplanation: 'This is the classic "try and fail gracefully" pattern. Imagine ordering food from a restaurant app: you place the order (fetch), wait for it (await), and if the kitchen is closed (error), instead of crashing, the app politely says "sorry, we\'ll try later" (return null). The try/catch is your safety net - without it, one bad API call would freeze your entire app. Always use try/catch with async/await.',
    hints: ['Look for a block that catches errors.', 'When fetch fails, an error is thrown. Where does the code handle that?', 'The catch block has a return statement. What does it return?']
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
    keyConceptsToSpot: ['useState', 'useEffect cleanup', 'event listeners', 'memory leaks', 'empty dependency array'],
    tags: ['react', 'useEffect', 'hooks', 'cleanup'],
    aiExplanation: 'This React hook is like a window sensor. When your component mounts (opens the window), it starts measuring the window width. Every time the browser resizes, it updates the measurement. But here\'s the key: when the component unmounts (closes the window), the cleanup function removes the event listener. Without cleanup, your app would keep measuring forever, causing memory leaks - like leaving 100 sensors running in an empty room.',
    hints: ['Think about what happens when the browser window resizes.', 'There\'s a function that runs when the component unmounts. What does it do?', 'The cleanup function removes the event listener. Without it, listeners pile up.']
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
    keyConceptsToSpot: ['.filter()', '.map()', 'method chaining', 'arrow functions', '.toUpperCase()'],
    tags: ['arrays', 'filter', 'map', 'transformations'],
    aiExplanation: 'This is a data transformation pipeline - like an assembly line. First, .filter() removes inactive users (quality control). Then .map() takes each remaining user and transforms their data into a cleaner format (packaging). The result is a new array with only the data you need, neatly formatted. Method chaining lets you write this in one smooth flow instead of creating temporary variables at each step.',
    hints: ['Look for a block that catches errors.', 'When fetch fails, an error is thrown. Where does the code handle that?', 'The catch block has a return statement. What does it return?']
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
    keyConceptsToSpot: ['input validation', 'throw new Error', 'response.ok', 'JSON.stringify', 'multiple error paths'],
    tags: ['validation', 'error handling', 'api', 'fetch'],
    aiExplanation: 'This is a defensive programming pattern. Before creating anything, it validates every piece of data: title can\'t be empty, content can\'t be too short, and the API call must succeed. If ANY check fails, it throws a specific error explaining exactly what went wrong. This is better than silent failures because it tells you immediately what\'s wrong, like a spell-checker that highlights each error with a specific reason.',
    hints: ['Look at the conditions before the fetch call.', 'There are checks for empty title and short content. What happens if they fail?', 'The function throws specific Error messages for each validation failure.']
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
    keyConceptsToSpot: ['string split', 'array map', 'array join', 'method chaining', 'toUpperCase'],
    tags: ['strings', 'split', 'map', 'join'],
    aiExplanation: 'This function is like cutting up a full name into initials. First, .split(\' \') chops the name into words at each space. Then .map() takes the first letter of each word and capitalizes it. Finally, .join(\'\') glues them all back together without spaces. So "John Fitzgerald Kennedy" becomes ["John", "Fitzgerald", "Kennedy"] -> ["J", "F", "K"] -> "JFK".',
    hints: ['Think about what .split(\' \') does to a string.', 'Each word is mapped to its first character, uppercased.', 'The final .join(\'\') combines all the letters without spaces.']
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
    keyConceptsToSpot: ['Array.find', 'Array.filter', 'single vs array return', 'short-circuit evaluation', 'truthy object properties'],
    tags: ['arrays', 'find', 'filter', 'basics'],
    aiExplanation: 'Think of .find() as looking for one specific person in a crowd - it stops the moment it finds the first match. Think of .filter() as asking everyone with a red shirt to step forward - it collects ALL matches. Both scan the array, but .find() returns one item (or undefined), while .filter() returns an array (possibly empty). Use .find() when you need ONE thing, .filter() when you need EVERYTHING that matches.',
    hints: ['Look at the conditions before the fetch call.', 'There are checks for empty title and short content. What happens if they fail?', 'The function throws specific Error messages for each validation failure.']
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
    keyConceptsToSpot: ['destructuring defaults', 'default parameter value', 'shorthand object creation', 'undefined safety', 'function parameters'],
    tags: ['destructuring', 'defaults', 'objects', 'basics'],
    aiExplanation: 'Object destructuring is like unpacking a box with backup items. The function expects an object with label, color, and disabled properties. But the = \'Click me\', = \'blue\', = false parts are defaults - if you don\'t provide a value, the function uses the backup. So createButton({}) returns a blue "Click me" button, while createButton({ label: \'Submit\', color: \'red\' }) uses your values and defaults disabled to false.',
    hints: ['Look at the parameter list - each property has a default value.', 'If you pass an empty object {}, what values are used?', 'The defaults are: label=\'Click me\', color=\'blue\', disabled=false.']
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
    keyConceptsToSpot: ['Promise chaining', '.then return values', 'instanceof check', '.catch error handling', 'conditional branching in promises'],
    tags: ['promises', 'chaining', 'async', 'error handling'],
    aiExplanation: 'This is a promise chain - each .then() waits for the previous step to finish before starting. It\'s like a relay race: fetchOrder passes the baton to validateOrder, which passes it to processPayment, then to sendConfirmation. If ANY runner drops the baton (throws an error), the .catch() at the end picks it up. The finally block runs no matter what - like cleaning up the track after the race, win or lose.',
    hints: ['Read the chain from top to bottom. Each .then() receives the previous return.', 'The fetch returns a Response object. The next .then() calls .json() on it.', 'The order is: fetch -> json -> processOrder -> sendConfirmation. Finally runs regardless.']
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
    keyConceptsToSpot: ['useState object state', 'spread operator', 'computed property names', 'state replacement vs merge', 'React hooks'],
    tags: ['react', 'useState', 'objects', 'spread operator'],
    aiExplanation: 'useState with objects is tricky. When you do setForm({ name: \'New Name\' }), React REPLACES the entire form object - it doesn\'t merge. So the email and age fields disappear. To keep existing fields, you need the spread operator: setForm({ ...form, name: \'New Name\' }). This is like copying all the furniture from your old house before replacing one piece. Without spread, you lose everything else.',
    hints: ['Look at how setForm is called. Does it merge or replace?', 'React state for objects doesn\'t auto-merge like class components.', 'You need the spread operator: setForm({ ...form, name: value }).']
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
    keyConceptsToSpot: ['list comprehension', 'modulo operator', 'exponentiation', 'filter condition', 'string methods in comprehension'],
    tags: ['python', 'list comprehension', 'arrays', 'filtering'],
    aiExplanation: 'List comprehension is Python\'s elegant way to filter and transform in one line. Instead of writing a for loop, creating an empty list, and appending items, you write it like a sentence: "give me n for each n in numbers IF n is even." It\'s faster, cleaner, and more Pythonic. Think of it as a factory that only produces items meeting your criteria, all in a single expression.',
    hints: ['Read it like English: \"n for each n in numbers if n is even.\"', 'The % operator gives the remainder. Even numbers have remainder 0.', 'This creates [2, 4, 6, 8, 10] - all even numbers from the original list.']
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
    keyConceptsToSpot: ['generic type parameter', 'type inference', 'union type with undefined', 'reusable typed functions', 'array type syntax'],
    tags: ['typescript', 'generics', 'type inference', 'reusability'],
    aiExplanation: 'Generics are like a function template. <T> is a placeholder that says "I\'ll figure out the type when you call me." getFirst<number>([1,2,3]) replaces T with number. getFirst<string>([\'a\',\'b\']) replaces T with string. wrapInObject(\'hello\') automatically infers T as string. This makes one function work with ANY type while keeping full type safety - no any, no type assertions needed.',
    hints: ['<T> is a type placeholder. It gets replaced when you call the function.', 'getFirst([1,2,3]) infers T as number. getFirst([\'a\',\'b\']) infers T as string.', 'Generics let one function work with any type while keeping full type safety.']
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
    keyConceptsToSpot: ['Array.reduce', 'accumulator pattern', 'initial value', 'building objects with reduce', 'multiplication in iteration'],
    tags: ['arrays', 'reduce', 'aggregation', 'accumulation'],
    aiExplanation: 'Array.reduce() is the Swiss Army knife of array methods. It takes an accumulator (running total) and each item, then combines them. Here, it starts at 0 and adds each order\'s price * quantity. Think of it like a cash register: you start empty, scan each item (multiply price by quantity), and keep a running total. The final result is one value summarizing the entire array.',
    hints: ['The first argument to reduce is the accumulator (running total).', 'Each iteration adds price * quantity to the accumulator.', 'Starting from 0: 0 + (12*2) + (3*5) + (8*1) = 24 + 15 + 8 = 47.']
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
    keyConceptsToSpot: ['closure', 'lexical scope', 'factory function', 'encapsulated state', 'default parameters'],
    tags: ['closures', 'scope', 'factory function', 'encapsulation'],
    aiExplanation: 'A closure is a function that remembers its birthplace. makeCounter creates a private count variable and returns an object with methods. Even after makeCounter finishes running, those methods still have access to count. It\'s like a safe deposit box - only the returned methods can open it. Nobody outside can directly access or modify count, making this pattern perfect for encapsulation.',
    hints: ['The inner functions can still access \'count\' even after makeCounter returns.', 'This is called a closure - functions remember their lexical scope.', 'Only the returned object can modify count. External code cannot access it directly.']
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
    keyConceptsToSpot: ['decorator syntax', 'higher-order function', '*args **kwargs', 'time.time()', 'function wrapping pattern'],
    tags: ['python', 'decorators', 'higher-order functions', 'wrapping'],
    aiExplanation: 'A decorator is a function wrapper that adds behavior without changing the original code. @timer wraps slow_function so every time you call it, the decorator measures execution time, runs the function, then prints how long it took. It\'s like putting a security camera on a door - the door works the same, but now you get extra information. The wrapper preserves the original function\'s behavior while adding new functionality.',
    hints: ['The decorator wraps the original function with timing logic.', 'Before calling slow_function, it records the start time.', 'After slow_function finishes, it calculates elapsed time and prints it.']
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
    keyConceptsToSpot: ['discriminated union', 'type narrowing', 'literal types', 'switch exhaustiveness', 'union type'],
    tags: ['typescript', 'discriminated unions', 'type narrowing', 'switch'],
    aiExplanation: 'Discriminated unions use a common property (status) to distinguish between different types. TypeScript can narrow the type based on that property in a switch statement. When status === \'loading\', TS knows data and error don\'t exist. When status === \'success\', TS knows data exists and error doesn\'t. This prevents runtime errors - you can\'t accidentally access data when it doesn\'t exist. It\'s a type-safe state machine.',
    hints: ['The \'status\' field determines which type is active.', 'In the \'success\' case, TypeScript knows data exists but error doesn\'t.', 'This prevents runtime errors - you can\'t accidentally access .error when status is \'success\'.']
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
    keyConceptsToSpot: ['custom hook', 'lazy useState initializer', 'localStorage serialization', 'generic type parameter', 'as const tuple'],
    tags: ['react', 'custom hooks', 'localStorage', 'generics'],
    aiExplanation: 'This custom hook wraps localStorage in a React-friendly way. It reads the stored value on mount, and whenever you call setValue, it updates both React state AND localStorage. The generic <T> means it works with strings, numbers, objects - any JSON-serializable type. It\'s like having a React state that automatically persists across page refreshes. The JSON.parse/stringify handles the conversion between JavaScript objects and stored text.',
    hints: ['The hook reads from localStorage on mount and returns the stored value.', 'When setValue is called, it updates both React state AND localStorage.', 'JSON.parse/stringify handles converting between objects and stored text.']
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
    keyConceptsToSpot: ['race condition', 'useEffect cleanup', 'stale closure', 'async in useEffect', 'cancellation pattern'],
    tags: ['react', 'useEffect', 'race condition', 'async'],
    aiExplanation: 'Race conditions happen when async operations complete out of order. User types \'a\', then \'ab\'. The \'ab\' request might finish BEFORE \'a\', showing wrong results. The cleanup function in useEffect tracks this with cancelled flag. If the query changes before the fetch completes, the old request\'s results are ignored. Without this check, you might show stale data from a previous search. It\'s like canceling an old pizza order when you\'ve already placed a new one.',
    hints: ['Multiple fetch calls can return out of order. A slower earlier call might overwrite newer results.', 'The \'cancelled\' variable tracks whether the current query has changed.', 'If cancelled is true, the old response is discarded and not used to update results.']
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
    keyConceptsToSpot: ['context manager protocol', '__enter__ and __exit__', 'exception propagation', 'guaranteed cleanup', 'with statement'],
    tags: ['python', 'context manager', 'with statement', 'cleanup'],
    aiExplanation: 'Context managers (with statement) ensure resources are properly cleaned up. The __enter__ method opens the connection, and __exit__ always closes it - even if an error occurs. Without \'with\', you\'d need try/finally to guarantee cleanup. The with statement is like a hotel stay: check-in (__enter__), do your business (use the connection), check-out (__exit__). Even if something goes wrong during your stay, the hotel guarantees you\'ll check out properly.',
    hints: ['The \'with\' statement calls __enter__ before the block and __exit__ after.', '__exit__ runs even if an error occurs inside the block.', 'This guarantees the database connection is always closed, preventing leaks.']
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
    keyConceptsToSpot: ['Omit utility type', 'Pick utility type', 'Partial utility type', 'composing utility types', 'type safety for mutations'],
    tags: ['typescript', 'utility types', 'Omit', 'Pick', 'Partial'],
    aiExplanation: 'TypeScript utility types let you build new types from existing ones. PublicUser removes sensitive fields (password) using Omit. UserPreview keeps only essential fields using Pick. UpdateUser makes all remaining fields optional using Partial. By composing these, you create precise types for different scenarios without duplicating code. It\'s like having one master blueprint and creating specialized versions for different purposes.',
    hints: ['Omit removes specified fields. Pick keeps only specified fields.', 'Partial makes all fields optional - you can provide any combination.', 'By composing Omit + Partial, you prevent accidentally changing id or createdAt.']
  }
]
